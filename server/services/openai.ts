import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Load the CommonJS PDF parser wrapper at runtime
// This works in both ESM source and CommonJS bundle output
function loadPDFParser() {
  // In CommonJS bundle, require is available globally
  // @ts-ignore
  if (typeof require !== 'undefined') {
    // @ts-ignore
    const pdfParserPath = path.join(process.cwd(), "server", "utils", "pdfParser.cjs");
    // @ts-ignore
    return require(pdfParserPath).parsePDF;
  }
  // Fallback for ESM (shouldn't happen in production bundle)
  throw new Error("PDF parser requires CommonJS runtime");
}

const parsePDF = loadPDFParser();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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",
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

export async function extractBPOData(filePath: string): Promise<BPOExtractionResult> {
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

    // Extract text from both beginning (for subject/comps) and end (for repairs)
    const textLength = pdfText.length;
    const beginningText = pdfText.slice(0, Math.min(15000, textLength));
    const endingText = textLength > 15000 ? pdfText.slice(-10000) : "";
    
    // Combine both sections
    const pdfTextForExtraction = endingText 
      ? `${beginningText}\n\n[...middle section omitted for brevity...]\n\n${endingText}`
      : beginningText;

    console.log(`Using ${pdfTextForExtraction.length} chars for extraction (first ${beginningText.length} + last ${endingText.length})`);

    // Define extraction tool
    const extractionTool = {
      type: "function" as const,
      function: {
        name: "extract_bpo",
        description: "Extract subject property, comparable sales, and estimated repairs from a BPO PDF document.",
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
                asIsValue: { type: "number", description: "As-Is Price/Value - prominently displayed in top right of first page, labeled 'As-Is Price' or 'As Is Value'" },
                arv: { type: "number", description: "After Repair Value (ARV) - typically shown near the As-Is Price in top right of first page" },
              },
              required: ["address"],
            },
            comps: {
              type: "array",
              description: "Extract ONLY from the 'Recent Sales' table (NOT 'Active Listings'). The table has columns: Subject, Comp 1, Comp 2, Comp 3. Extract Comp 1, Comp 2, and Comp 3 data only - ignore the Subject column and ignore any Active Listings page.",
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
              description: "Extract the 'Estimated Repairs' table from the back of the BPO. Each repair item typically has a category/description and estimated cost.",
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
          content: "You are an expert BPO parser. Extract subject property details, ONLY the 'Recent Sales' table, and the 'Estimated Repairs' table from the BPO report.\n\n" +
            "IMPORTANT:\n" +
            "1. For As-Is Price: Extract the 'As-Is Price' or 'As Is Value' from the TOP RIGHT of the FIRST PAGE. This is ALWAYS prominently displayed and labeled clearly. This is the current value of the property without repairs.\n" +
            "2. For ARV: Extract the estimated ARV (After Repair Value) also from the TOP RIGHT of the FIRST PAGE, displayed near the As-Is Price.\n" +
            "3. For comps: The BPO contains an 'Active Listings' page and a 'Recent Sales' page. ONLY extract from the 'Recent Sales' table. This table has columns: Subject (the house being valued), Comp 1, Comp 2, Comp 3. Extract ONLY Comp 1, Comp 2, and Comp 3 - do NOT extract the Subject column or anything from Active Listings.\n" +
            "4. For repairs: Look for a table section titled 'Estimated Repairs', 'Repair Estimate', 'Scope of Repairs', or similar at the back of the document.\n\n" +
            "Key instructions:\n" +
            "- Extract numeric values WITHOUT $ symbols or commas (e.g., '250000' not '$250,000')\n" +
            "- The As-Is Price and ARV are typically in the top right corner of page 1\n" +
            "- For distances, extract numeric miles (e.g., 0.5 for '0.5 mi')\n" +
            "- Parse dates in ISO format (YYYY-MM-DD)\n" +
            "- Use the SOLD price from Recent Sales comps (not list price)",
        },
        {
          role: "user",
          content: `Extract all data from this BPO report:\n\n${pdfTextForExtraction}`,
        },
      ],
      tools: [extractionTool],
      tool_choice: { type: "function", function: { name: "extract_bpo" } },
      temperature: 0.1,
    });

    const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Failed to extract data from BPO - no tool call response");
    }

    let extracted: any;
    try {
      extracted = JSON.parse(toolCall.function.arguments);
      console.log(`BPO Extraction summary:`, {
        compsCount: extracted.comps?.length || 0,
        repairsCount: extracted.repairs?.length || 0,
        hasSubject: !!extracted.subject,
      });
    } catch (parseErr) {
      console.error("Failed to parse OpenAI extraction:", parseErr, toolCall.function.arguments);
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

