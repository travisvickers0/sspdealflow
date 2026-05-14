import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { createRequire } from "module";

// Load the CommonJS PDF parser wrapper at runtime
// This works in both ESM development and production with esbuild banner
function loadPDFParser() {
  // Create a require function for ESM
  // @ts-ignore - In production bundle, require is provided by esbuild banner
  const requireFunc = typeof require !== 'undefined' ? require : createRequire(import.meta.url);
  const pdfParserPath = path.join(process.cwd(), "server", "utils", "pdfParser.cjs");
  return requireFunc(pdfParserPath).parsePDF;
}

const parsePDF = loadPDFParser();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CompData {
  id: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  soldDate: string;
  distance?: string;
  lat?: number;
  lng?: number;
}

export interface BPOExtractionResult {
  subject?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    beds?: number;
    baths?: number;
    sqft?: number;
    arv?: number;
    asIsValue?: number;
  };
  comps: CompData[];
  repairs?: Array<{
    category: string;
    description?: string;
    estimatedCost: number;
  }>;
}

/** More text + a mid-document slice so comp grids in the middle of long PDFs are not lost. */
function buildPdfTextForExtraction(pdfText: string): string {
  const textLength = pdfText.length;
  const headChars = 28_000;
  const tailChars = 18_000;
  const midChars = 12_000;

  const beginningText = pdfText.slice(0, Math.min(headChars, textLength));
  let middleText = "";
  if (textLength > headChars + tailChars + 5_000) {
    const midStart = Math.max(headChars, Math.floor(textLength * 0.28));
    const midEnd = Math.min(textLength - tailChars, midStart + midChars);
    if (midEnd > midStart) {
      middleText = pdfText.slice(midStart, midEnd);
    }
  }
  const endingText = textLength > headChars ? pdfText.slice(-Math.min(tailChars, textLength)) : "";

  const parts: string[] = [beginningText];
  if (middleText) {
    parts.push("\n\n[...earlier section omitted...]\n\n", middleText);
  }
  if (endingText && textLength > headChars) {
    parts.push("\n\n[...middle section may be omitted...]\n\n", endingText);
  }
  return parts.join("");
}

export async function extractBPOData(filePath: string): Promise<BPOExtractionResult> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  try {
    console.log("Reading PDF file:", filePath);
    // Read and parse PDF
    const dataBuffer = await fs.readFile(filePath);
    console.log(`PDF file size: ${dataBuffer.length} bytes`);
    
    console.log("Parsing PDF...");
    const pdfData = await parsePDF(dataBuffer);
    const pdfText = pdfData.text || "";
    console.log(`PDF text extracted: ${pdfText.length} characters`);

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error("Could not read PDF text");
    }

    const pdfTextForExtraction = buildPdfTextForExtraction(pdfText);
    console.log(
      `Using ${pdfTextForExtraction.length} chars for extraction (full PDF text length: ${pdfText.length})`,
    );

    // Define extraction tool
    const extractionTool = {
      type: "function" as const,
      function: {
        name: "extract_bpo",
        description:
          "Extract subject property, comparable closed/sold sales, and repair estimates from a broker price opinion (BPO), broker valuation, or appraisal-style PDF. Layouts vary: adapt to the document at hand.",
        parameters: {
          type: "object",
          properties: {
            subject: {
              type: "object",
              properties: {
                address: { type: "string", description: "Street address" },
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" },
                beds: { type: "number" },
                baths: { type: "number" },
                sqft: { type: "number" },
                yearBuilt: { type: "number" },
                asIsValue: {
                  type: "number",
                  description:
                    "Current/as-is value: e.g. 'ESTIMATED AS-IS VALUE', 'As-Is', 'As Is Value', 'As Is Market Value', 'Retrospective Value - as is', 'Market Value - subject property', 'Opinion of Value' for the subject in as-is condition.",
                },
                arv: {
                  type: "number",
                  description:
                    "Value after repairs if present: e.g. 'AFTER REPAIR VALUE (ARV)', 'ARV', 'After Repair Value', 'As Repaired', 'Upon Completion', 'Hypothetical Condition', or value 'subject to' completion of repairs.",
                },
              },
              required: ["address"],
            },
            comps: {
              type: "array",
              description:
                "Comparable closed/sold properties only (actual sales). Include every sold comp in: 'Recent Sales', 'Sold Comps · Last 6 Months', 'Sold Comps · 6–12 Months Ago', 'Sales Comparison', 'Comparable Sales', 'Closed Sales', or Subject|Comp1|Comp2 column layouts. For row tables with ADDRESS, SOLD, PRICE, BD/BA (e.g. 2/1 or 2/1.5), SQFT, DIST: extract each data row; map BD/BA to beds/baths (2/1.5 => beds 2, baths 1.5); map DIST '1.5 mi' to distance. EXCLUDE 'Active Listings' / pending sections when sold comps exist. Prefer sold/closed price over list price.",
              items: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  zip: { type: "string" },
                  status: { type: "string", description: "sold | listed | pending | other" },
                  soldPrice: { type: "number" },
                  listPrice: { type: "number" },
                  soldDate: { type: "string", description: "ISO date if present" },
                  beds: { type: "number" },
                  baths: { type: "number" },
                  sqft: { type: "number" },
                  yearBuilt: { type: "number" },
                  distanceMiles: { type: "number" },
                  distance: { type: "string" },
                },
                required: ["address"],
              },
            },
            repairs: {
              type: "array",
              description:
                "Repair line items if present: tables titled 'Estimated Repairs', 'Cost to Cure', etc. If only a total rehab budget appears in narrative (e.g. '~$30K rehab'), return one item: category 'Rehab (estimated)', estimatedCost as the dollar amount, description briefly quoting the source. Use [] if no amount can be inferred.",
              items: {
                type: "object",
                properties: {
                  category: { 
                    type: "string", 
                    description: "Repair category (e.g., 'Kitchen', 'Bathroom', 'Roof', 'Flooring', 'HVAC', 'Paint', 'Electrical', 'Plumbing')" 
                  },
                  description: { 
                    type: "string", 
                    description: "Optional detailed description of the repair" 
                  },
                  estimatedCost: { 
                    type: "number", 
                    description: "Estimated cost without $ or commas (e.g., 5000 not $5,000)" 
                  },
                },
                required: ["category", "estimatedCost"],
              },
            },
          },
          required: ["subject", "comps", "repairs"],
        },
      },
    };

    console.log("Calling OpenAI for extraction...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You extract structured data from real-estate valuation PDFs: broker BPOs, broker valuations (including "SSP · Valuation Report" style), and similar reports. Layouts differ—read what is in the text.

SUBJECT: Street, city, state, ZIP when available (header may show "City, ST ZIP"; subject line may be street only—infer and merge). Beds/baths/sqft from header lines like "2 bd 1 ba 760 sqft".
- asIsValue: labels such as "ESTIMATED AS-IS VALUE", "As-Is Price", or as-is market value for the subject.
- arv: labels such as "AFTER REPAIR VALUE (ARV)", "ARV", after-repair opinion.

COMPS (CLOSED SALES ONLY):
- Include all rows under "Sold Comps" / "Recent Sales" / closed sales grids. Skip "Active Listings" tables when both exist.
- Row format ADDRESS, SOLD date, PRICE, BD/BA, SQFT, DIST: extract all sold rows; never use list price from active listings as a comp sold price.
- Parse BD/BA: "2/1" => beds 2 baths 1; "2/1.5" => beds 2 baths 1.5; "3/1" => beds 3 baths 1.

REPAIRS: Table line items if present; else one aggregate from narrative rehab budget (e.g. "~$30K rehab") if a clear dollar amount is given; else [].

RULES: Numeric fields without $ or commas. Dates ISO where possible. repairs can be [].`,
        },
        {
          role: "user",
          content: `Extract all data from this valuation/BPO report:\n\n${pdfTextForExtraction}`,
        },
      ],
      tools: [extractionTool],
      tool_choice: { type: "function", function: { name: "extract_bpo" } },
      temperature: 0.1,
    });

    const rawToolCall = completion.choices[0]?.message?.tool_calls?.[0];
    const toolArgs =
      rawToolCall &&
      rawToolCall.type === "function" &&
      "function" in rawToolCall &&
      typeof rawToolCall.function?.arguments === "string"
        ? rawToolCall.function.arguments
        : undefined;
    if (!toolArgs) {
      throw new Error("Failed to extract data from BPO - no tool call response");
    }

    let extracted: any;
    try {
      extracted = JSON.parse(toolArgs);
      console.log(`BPO Extraction summary:`, {
        compsCount: extracted.comps?.length || 0,
        repairsCount: extracted.repairs?.length || 0,
        hasSubject: !!extracted.subject,
      });
    } catch (parseErr) {
      console.error("Failed to parse OpenAI extraction:", parseErr, toolArgs);
      throw new Error("Failed to parse extracted BPO data");
    }

    // Convert comps to our format
    const comps: CompData[] = (extracted.comps || [])
      .filter((comp: any) => comp.address)
      .map((comp: any) => ({
        id: randomUUID(),
        address: [comp.address, comp.city, comp.state, comp.zip]
          .filter(Boolean)
          .join(", ") || comp.address,
        price: Number(comp.soldPrice || comp.listPrice || 0),
        beds: Number(comp.beds || 0),
        baths: Number(comp.baths || 0),
        sqft: Number(comp.sqft || 0),
        soldDate: comp.soldDate || "",
        distance: comp.distance || (comp.distanceMiles ? `${Number(comp.distanceMiles).toFixed(2)} mi` : undefined),
      }));

    return {
      subject: extracted.subject,
      comps,
      repairs: extracted.repairs || [],
    };
  } catch (error) {
    console.error("Error extracting data from BPO:", error);
    throw new Error(`Failed to extract BPO data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

