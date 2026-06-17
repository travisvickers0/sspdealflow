import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, updatePropertySchema, users, properties, type Property } from "@shared/schema";
import { db } from "./db";
import { isNotNull, isNull, and, eq } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import { createRequire } from "module";
import { extractBPOData } from "./services/openai";
import { geocodeComps, geocodeAddress } from "./services/geocoding";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { sendFacebookPixelEvent, type FacebookPixelEvent, createLeadEvent } from "./services/facebookPixel";
import nodemailer from "nodemailer";
import { sendQualificationConfirmation } from "./services/resend";
import { appendLeadToSheet } from "./lib/googleSheets";

const requireFunc = typeof require !== "undefined" ? require : createRequire(import.meta.url);
const { parsePDF } = requireFunc(path.join(process.cwd(), "server", "utils", "pdfParser.cjs")) as {
  parsePDF: (dataBuffer: Buffer) => Promise<{ text?: string }>;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SITE_URL = "https://sspdealflow.com";

// Signed token so unsubscribe links can't be forged. Format: <userId>.<hmac>
function makeUnsubscribeToken(userId: string): string {
  const secret = process.env.SESSION_SECRET ?? "";
  const sig = crypto.createHmac("sha256", secret).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [userId, sig] = token.split(".");
  if (!userId || !sig) return null;
  const secret = process.env.SESSION_SECRET ?? "";
  const expected = crypto.createHmac("sha256", secret).update(userId).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}

async function sendDealAlertEmails(property: Property): Promise<{ sent: number; failed: number; recipients: number }> {
  try {
    // Only announce deals that are actually live/available.
    if (property.status !== "AVAILABLE") {
      console.log(`[deal-alert] Skipped — property ${property.id} status is "${property.status}" (not AVAILABLE)`);
      return { sent: 0, failed: 0, recipients: 0 };
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("[deal-alert] SMTP_USER/SMTP_PASS not configured — cannot send");
      return { sent: 0, failed: 0, recipients: 0 };
    }

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(and(isNotNull(users.email), isNull(users.unsubscribedFromDeals)));

    if (!allUsers.length) {
      console.log("[deal-alert] No users to notify");
      return { sent: 0, failed: 0, recipients: 0 };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Pool + cap throughput so a burst of recipients doesn't trip Gmail limits.
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      rateDelta: 1000,
      rateLimit: 10,
    });

    const siteUrl = process.env.SITE_URL ?? DEFAULT_SITE_URL;
    const propertyUrl = `${siteUrl}/property/${property.slug}`;

    const photoUrl = property.mainPhotoUrl
      ? property.mainPhotoUrl.startsWith("http")
        ? property.mainPhotoUrl
        : `${siteUrl}${property.mainPhotoUrl}`
      : null;

    const equityFormatted = property.estimatedEquity
      ? `$${property.estimatedEquity.toLocaleString()}`
      : "TBD";

    const priceFormatted = property.purchasePrice
      ? `$${property.purchasePrice.toLocaleString()}`
      : "TBD";

    const bpoFormatted = property.bpoValue
      ? `$${property.bpoValue.toLocaleString()}`
      : "TBD";

    const rehabFormatted = property.rehabBudget
      ? `$${property.rehabBudget.toLocaleString()}`
      : "$0 — cosmetic only";

    const closingFormatted = property.closingDate
      ? new Date(property.closingDate).toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric"
        })
      : "TBD";

    const testEmail = (process.env.TEST_LOGIN_EMAIL || "test@ssp.com").toLowerCase();

    let recipients = allUsers.filter(
      u => u.email && u.email.toLowerCase() !== testEmail
    );

    // Safe testing: when DEAL_ALERT_TEST_RECIPIENT is set, redirect the whole
    // send to that single address so real investors are never emailed. Remove
    // the env var in production to send for real.
    const testRecipientOverride = process.env.DEAL_ALERT_TEST_RECIPIENT?.trim();
    if (testRecipientOverride) {
      console.log(`[deal-alert] TEST MODE — redirecting all mail to ${testRecipientOverride}`);
      recipients = [{ id: "test-recipient", email: testRecipientOverride, firstName: "Test", lastName: null }];
    }

    const buildEmail = (user: typeof recipients[number]) => {
        const firstName = user.firstName ?? "Investor";
        const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${encodeURIComponent(makeUnsubscribeToken(user.id))}`;

        return transporter.sendMail({
          from: `"SSP Deal Flow" <${process.env.SMTP_USER}>`,
          to: user.email!,
          subject: `🏠 New Deal Available — ${property.address}`,
          html: `
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0908;border-radius:12px;overflow:hidden">

    <!-- Header -->
    <div style="background:#0a0908;padding:20px 28px;border-bottom:1px solid #2a2724">
      <!--[if mso]><table><tr><td><![endif]-->
      <span style="font-family:'Bebas Neue',Impact,'Arial Narrow',Arial,sans-serif;font-size:28px;font-weight:400;color:#e8432d;line-height:1;letter-spacing:-0.02em">[</span><!--
      --><span style="font-family:'Bebas Neue',Impact,'Arial Narrow',Arial,sans-serif;font-size:22px;font-weight:400;color:#f0ebe3;line-height:1;letter-spacing:0.08em;padding:0 3px">SSP DEAL FLOW</span><!--
      --><span style="font-family:'Bebas Neue',Impact,'Arial Narrow',Arial,sans-serif;font-size:28px;font-weight:400;color:#e8432d;line-height:1;letter-spacing:-0.02em">]</span>
      <!--[if mso]></td></tr></table><![endif]-->
    </div>

${photoUrl ? `
  <!-- Property photo -->
  <div style="width:100%;position:relative;overflow:hidden;max-height:280px">
    <img
      src="${photoUrl}"
      alt="${property.address}"
      width="600"
      style="width:100%;height:280px;object-fit:cover;display:block;filter:brightness(0.9)"
    />
    <!-- Equity tag overlay -->
    <div style="position:absolute;bottom:14px;left:14px;background:rgba(10,9,8,0.82);border:1px solid rgba(34,197,94,0.25);border-radius:6px;padding:6px 12px">
      <span style="font-family:monospace;font-size:14px;font-weight:700;color:#22c55e">
        +${equityFormatted} equity
      </span>
    </div>
    <!-- Status badge -->
    <div style="position:absolute;top:14px;left:14px;background:#e8432d;border-radius:4px;padding:4px 10px">
      <span style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:white">
        Needs Funding
      </span>
    </div>
  </div>
` : ""}

    <!-- Body -->
    <div style="padding:28px;background:#181614">

      <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6b6158">
        New Deal Available · Needs Funding
      </p>
      <h1 style="margin:0 0 4px;font-size:28px;font-weight:700;color:#f0ebe3;line-height:1.2">
        ${property.address}
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#6b6158">
        📍 ${property.city}, ${property.state} ${property.zip}
      </p>

      <p style="margin:0 0 20px;font-size:15px;color:#a89e91;line-height:1.65">
        Hi ${firstName}, a new deal just dropped on SSP Deal Flow.
        These fund fast — here are the numbers:
      </p>

      <!-- Key numbers 2x2 grid -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:18px">
        <tr>
          <td style="padding:14px 16px;background:#252220;border:1px solid #2a2724;width:50%;vertical-align:top">
            <div style="font-size:9px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6b6158;margin-bottom:5px">Purchase Price</div>
            <div style="font-size:22px;font-weight:700;color:#f0ebe3;font-family:monospace;letter-spacing:-0.02em">${priceFormatted}</div>
          </td>
          <td style="padding:14px 16px;background:#111f12;border:1px solid #2a2724;width:50%;vertical-align:top">
            <div style="font-size:9px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(34,197,94,0.6);margin-bottom:5px">Est. Equity</div>
            <div style="font-size:22px;font-weight:700;color:#22c55e;font-family:monospace;letter-spacing:-0.02em">${equityFormatted}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#111520;border:1px solid #2a2724;vertical-align:top">
            <div style="font-size:9px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(59,130,246,0.6);margin-bottom:5px">After Repair Value</div>
            <div style="font-size:22px;font-weight:700;color:#3b82f6;font-family:monospace;letter-spacing:-0.02em">${bpoFormatted}</div>
          </td>
          <td style="padding:14px 16px;background:#252220;border:1px solid #2a2724;vertical-align:top">
            <div style="font-size:9px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6b6158;margin-bottom:5px">Closing Date</div>
            <div style="font-size:17px;font-weight:600;color:#f0ebe3">${closingFormatted}</div>
          </td>
        </tr>
      </table>

      <!-- Specs -->
      <p style="margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid #2a2724;font-size:13px;color:#6b6158">
        ${property.beds ?? "—"} bed &nbsp;·&nbsp;
        ${property.baths ?? "—"} bath &nbsp;·&nbsp;
        ${property.squareFeet ? property.squareFeet.toLocaleString() : "—"} sqft
      </p>

      <!-- Urgency bar -->
      ${property.closingDate ? (() => {
        const daysUntilClose = Math.max(0, Math.ceil(
          (new Date(property.closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ));
        return `
          <div style="background:rgba(232,67,45,0.08);border:1px solid rgba(232,67,45,0.18);border-left:3px solid #e8432d;border-radius:0 6px 6px 0;padding:12px 16px;margin-bottom:20px">
            <div style="font-size:13px;font-weight:600;color:#f0ebe3;margin-bottom:3px">
              ⚡ This deal closes in ${daysUntilClose} days
            </div>
            <div style="font-size:11px;color:#a89e91">
              Deals at this equity level typically fund within 48–72 hours of posting.
            </div>
          </div>
        `;
      })() : ""}

      <!-- Deal breakdown -->
      <div style="background:#252220;border:1px solid #2a2724;border-radius:8px;padding:16px;margin-bottom:22px">
        <div style="font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b6158;margin-bottom:12px">
          Deal Breakdown
        </div>

        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #2a2724">
            <td style="padding:9px 0;font-size:12px;color:#a89e91">Structure</td>
            <td style="padding:9px 0;font-size:13px;font-weight:600;color:#f0ebe3;text-align:right">Deal-by-deal JV</td>
          </tr>
          <tr style="border-bottom:1px solid #2a2724">
            <td style="padding:9px 0;font-size:12px;color:#a89e91">Your profit split</td>
            <td style="padding:9px 0;font-size:13px;font-weight:600;color:#22c55e;text-align:right;font-family:monospace">50% of net profit</td>
          </tr>
          <tr style="border-bottom:1px solid #2a2724">
            <td style="padding:9px 0;font-size:12px;color:#a89e91">Rehab budget</td>
            <td style="padding:9px 0;font-size:13px;font-weight:600;color:#f0ebe3;text-align:right;font-family:monospace">
              ${rehabFormatted}
            </td>
          </tr>
          <tr style="border-bottom:1px solid #2a2724">
            <td style="padding:9px 0;font-size:12px;color:#a89e91">Your est. return</td>
            <td style="padding:9px 0;font-size:13px;font-weight:600;color:#22c55e;text-align:right;font-family:monospace">
              ${property.estimatedEquity
                ? `$${Math.round(property.estimatedEquity * 0.5).toLocaleString()} (+${property.purchasePrice ? ((property.estimatedEquity * 0.5 / property.purchasePrice) * 100).toFixed(1) : "—"}%)`
                : "TBD"}
            </td>
          </tr>
          <tr>
            <td style="padding:9px 0;font-size:12px;color:#a89e91">Protection</td>
            <td style="padding:9px 0;font-size:13px;font-weight:600;color:#f0ebe3;text-align:right">1st position lien</td>
          </tr>
        </table>
      </div>

      <!-- CTA button -->
      <div style="text-align:center;margin-bottom:16px">
        <a href="${propertyUrl}"
          style="display:inline-block;background:#e8432d;color:white;text-decoration:none;padding:16px 48px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.01em">
          View This Deal →
        </a>
      </div>

      <p style="margin:0;font-size:11px;color:#6b6158;text-align:center;line-height:1.7">
        Questions? Reply to this email or call Travis directly.
      </p>

    </div>

    <!-- Footer -->
    <div style="padding:16px 28px 24px;background:#0f0e0d;border-top:1px solid #2a2724;text-align:center">
      <div style="margin-bottom:10px">
        <span style="font-family:'Bebas Neue',Impact,'Arial Narrow',Arial,sans-serif;font-size:20px;font-weight:400;color:#e8432d;line-height:1;letter-spacing:-0.02em">[</span><!--
        --><span style="font-family:'Bebas Neue',Impact,'Arial Narrow',Arial,sans-serif;font-size:16px;font-weight:400;color:#a89e91;line-height:1;letter-spacing:0.08em;padding:0 2px">SSP DEAL FLOW</span><!--
        --><span style="font-family:'Bebas Neue',Impact,'Arial Narrow',Arial,sans-serif;font-size:20px;font-weight:400;color:#e8432d;line-height:1;letter-spacing:-0.02em">]</span>
      </div>
      <p style="margin:0 0 8px;font-size:11px;color:#6b6158;line-height:1.6">
        Deal-by-deal joint venture partnerships. Not a Fund. No pooled capital.<br/>
        You're receiving this because you have an SSP Deal Flow account.
      </p>
      <p style="margin:0 0 8px;font-size:10px;color:#6b6158;line-height:1.6">
        Southern Specialty Properties · 3611 Braselton Hwy, Dacula, GA 30019
      </p>
      <p style="margin:0 0 8px;font-size:10px;color:#6b6158">
        <a href="${unsubscribeUrl}" style="color:#6b6158;text-decoration:underline">
          Unsubscribe from deal alerts
        </a>
      </p>
      <p style="margin:0;font-size:10px;color:#6b6158">
        © 2026 Southern Specialty Properties
      </p>
    </div>

  </div>
`,
        });
    };

    // Send in small batches so the pooled transport paces delivery instead of
    // firing every message at once (Gmail throttles big concurrent bursts).
    const BATCH_SIZE = 20;
    let sent = 0;
    let failed = 0;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(buildEmail));
      sent += results.filter(r => r.status === "fulfilled").length;
      failed += results.filter(r => r.status === "rejected").length;
    }

    transporter.close();

    // Record that the alert went out so we don't double-send and can show
    // status. Skipped in test mode so a test send never marks a real deal sent.
    if (!testRecipientOverride) {
      await db
        .update(properties)
        .set({ dealAlertSentAt: new Date() })
        .where(eq(properties.id, property.id));
    }

    console.log(`[deal-alert] Sent ${sent}/${recipients.length} emails. Failed: ${failed}`);
    return { sent, failed, recipients: recipients.length };
  } catch (err: any) {
    console.error("[deal-alert] Failed:", err.message);
    return { sent: 0, failed: 0, recipients: 0 };
  }
}


// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for photos (will be uploaded to object storage)
const memoryStorage = multer.memoryStorage();

// Keep disk storage for documents (BPO PDFs need to be saved for processing)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fullPath = path.join(uploadDir, "documents");
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Photo upload uses memory storage -> object storage
const photoUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

// Document upload uses memory storage -> object storage
const documentUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF is allowed."));
    }
  },
});

/** BPO / valuation PDFs are often scanned multi-page files — allow larger than generic uploads */
const BPO_PROCESS_MAX_FILE_BYTES = 50 * 1024 * 1024;

const closedDealPdfUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

const bpoProcessUpload = multer({
  storage: diskStorage,
  limits: { fileSize: BPO_PROCESS_MAX_FILE_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF is allowed."));
    }
  },
});

// Legacy upload for backwards compatibility
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed."));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Test endpoint to verify routing works
  app.get("/api/test", (req: Request, res: Response) => {
    res.json({ message: "API routes are working" });
  });

  // GET /api/test-sheets - Test Google Sheets connection (admin only)
  app.get("/api/test-sheets", isAdmin, async (req: Request, res: Response) => {
    try {
      const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const sheetId = process.env.GOOGLE_SHEET_ID;

      // Check if environment variables are set
      const hasCredentials = !!credentialsJson;
      const hasSheetId = !!sheetId;
      
      if (!hasCredentials || !hasSheetId) {
        return res.status(400).json({
          error: "Google Sheets not configured",
          message: "Missing environment variables",
          details: {
            GOOGLE_SERVICE_ACCOUNT_JSON: hasCredentials ? "SET" : "NOT SET",
            GOOGLE_SHEET_ID: hasSheetId ? "SET" : "NOT SET",
          },
          note: "If you just added secrets, you may need to restart the server for them to take effect.",
        });
      }

      // Validate JSON format
      let credentials;
      try {
        credentials = typeof credentialsJson === 'string' 
          ? JSON.parse(credentialsJson) 
          : credentialsJson;
      } catch (parseError: any) {
        return res.status(400).json({
          error: "Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON",
          message: parseError.message,
        });
      }

      // Check required fields
      if (!credentials.client_email || !credentials.private_key) {
        return res.status(400).json({
          error: "Invalid service account credentials",
          message: "Missing client_email or private_key in credentials",
        });
      }

      // Try to append a test row
      await appendLeadToSheet({
        name: "Test User",
        email: "test@example.com",
        phone: "555-1234",
        accredited: true,
        capitalRange: "$150,000 – $200,000",
        timeline: "1–3 months",
        interest: "All of the above",
      });

      res.json({
        success: true,
        message: "Google Sheets connection successful! Test row added to sheet.",
        serviceAccountEmail: credentials.client_email,
        sheetId: sheetId.substring(0, 10) + "...",
      });
    } catch (error: any) {
      console.error("Google Sheets test error:", error);
      const errorStatus = error?.response?.status;
      const errorCode = error?.code;
      
      let errorMessage = error.message || "Unknown error";
      if (errorStatus === 401 || errorStatus === 403) {
        errorMessage = "Authentication failed. Make sure the service account email has Editor access to the sheet.";
      } else if (errorStatus === 404) {
        errorMessage = "Sheet not found. Check that the Sheet ID is correct and the 'Leads' tab exists.";
      }
      
      res.status(500).json({
        error: "Google Sheets test failed",
        message: errorMessage,
        status: errorStatus,
        code: errorCode,
      });
    }
  });

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, phone } = req.body;

      if (!firstName || !email) {
        return res.status(400).json({ error: "firstName and email are required" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const fullName = `${String(firstName).trim()} ${String(lastName || "").trim()}`.trim();

      await storage.createLead({
        fullName,
        email: String(email).trim(),
        phone: phone != null ? String(phone).trim() : "",
        isAccredited: true,
        capitalRange: "not_specified",
        investmentTimeline: "not_specified",
        primaryInterest: "general_inquiry",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.post("/api/contact", async (req: Request, res: Response) => {
    const {
      firstName, lastName, email,
      phone, interests, message,
    } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    try {
      const smtpUser = process.env.SMTP_USER?.trim();
      const smtpPass = process.env.SMTP_PASS?.trim();
      const notifyEmail = process.env.NOTIFY_EMAIL?.trim();

      if (!notifyEmail) {
        console.warn("[contact] NOTIFY_EMAIL not set - skipping notification");
      } else if (!smtpUser || !smtpPass) {
        console.warn("[contact] SMTP_USER or SMTP_PASS missing - skipping notification");
      } else {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: smtpUser,
          to: notifyEmail,
          subject: `New Contact Form — ${firstName} ${lastName}`,
          html: `
        <div style="font-family:sans-serif;
          max-width:600px;margin:0 auto;
          background:#f7f4ef;padding:32px;
          border-radius:12px">
          <div style="background:#0d0c0b;
            padding:20px 24px;border-radius:10px;
            margin-bottom:24px">
            <span style="color:#e8432d;
              font-size:20px;font-weight:700">[</span>
            <span style="color:white;
              font-size:13px;font-weight:700;
              letter-spacing:.05em">SSP DEAL FLOW</span>
            <span style="color:#e8432d;
              font-size:20px;font-weight:700">]</span>
          </div>
          <h2 style="color:#0d0c0b;
            font-size:22px;margin-bottom:4px">
            New Contact Form Submission
          </h2>
          <p style="color:rgba(13,12,11,0.5);
            font-size:14px;margin-bottom:24px">
            Someone filled out the contact form.
            Reach out within 2 hours.
          </p>
          <div style="background:white;
            border:1px solid rgba(13,12,11,0.08);
            border-radius:10px;padding:20px;
            margin-bottom:16px">
            <div style="margin-bottom:12px">
              <div style="font-size:10px;
                font-weight:700;
                letter-spacing:.1em;
                text-transform:uppercase;
                color:rgba(13,12,11,0.4);
                margin-bottom:3px">Name</div>
              <div style="font-size:15px;
                font-weight:600;color:#0d0c0b">
                ${firstName} ${lastName}
              </div>
            </div>
            <div style="margin-bottom:12px">
              <div style="font-size:10px;
                font-weight:700;
                letter-spacing:.1em;
                text-transform:uppercase;
                color:rgba(13,12,11,0.4);
                margin-bottom:3px">Email</div>
              <a href="mailto:${email}"
                style="font-size:15px;
                font-weight:600;
                color:#e8432d">
                ${email}
              </a>
            </div>
            ${phone ? `
            <div style="margin-bottom:12px">
              <div style="font-size:10px;
                font-weight:700;
                letter-spacing:.1em;
                text-transform:uppercase;
                color:rgba(13,12,11,0.4);
                margin-bottom:3px">Phone</div>
              <a href="tel:${phone}"
                style="font-size:15px;
                font-weight:600;color:#0d0c0b">
                ${phone}
              </a>
            </div>` : ""}
            ${interests?.length ? `
            <div style="margin-bottom:12px">
              <div style="font-size:10px;
                font-weight:700;
                letter-spacing:.1em;
                text-transform:uppercase;
                color:rgba(13,12,11,0.4);
                margin-bottom:6px">
                Interested in
              </div>
              <div style="display:flex;
                flex-wrap:wrap;gap:6px">
                ${interests.map((i: string) => `
                  <span style="background:
                    rgba(232,67,45,0.08);
                    border:1px solid
                    rgba(232,67,45,0.2);
                    color:#e8432d;
                    font-size:11px;
                    font-weight:600;
                    padding:3px 10px;
                    border-radius:999px">
                    ${i}
                  </span>`).join("")}
              </div>
            </div>` : ""}
            ${message ? `
            <div>
              <div style="font-size:10px;
                font-weight:700;
                letter-spacing:.1em;
                text-transform:uppercase;
                color:rgba(13,12,11,0.4);
                margin-bottom:3px">Message</div>
              <div style="font-size:14px;
                color:rgba(13,12,11,0.7);
                line-height:1.6">
                ${message}
              </div>
            </div>` : ""}
          </div>
          <div style="background:#e8432d;
            border-radius:10px;padding:16px 20px;
            text-align:center">
            <div style="color:white;
              font-weight:700;font-size:14px;
              margin-bottom:4px">
              Respond within 2 hours
            </div>
            <div style="color:rgba(255,255,255,0.7);
              font-size:12px">
              Best time to reach investors is
              same-day
            </div>
          </div>
        </div>
      `,
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("[contact] Email error:", error);
      res.json({ success: true });
    }
  });

  app.post("/api/property-interest", async (req: Request, res: Response) => {
    try {
      const { propertyId, propertyAddress, fullName, email, phone, message } = req.body;

      if (!propertyId || !fullName || !email) {
        return res.status(400).json({
          error: "propertyId, fullName, and email are required",
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const userId = (req as any).user?.claims?.sub ?? null;

      const interest = await storage.createPropertyInterest({
        propertyId: String(propertyId),
        propertyAddress: propertyAddress != null ? String(propertyAddress) : "",
        userId,
        fullName: String(fullName).trim(),
        email: String(email).trim(),
        phone: phone != null && String(phone).trim() !== "" ? String(phone).trim() : null,
        message: message != null && String(message).trim() !== "" ? String(message).trim() : null,
      });

      let emailSent = false;
      try {
        const notifyEmail = process.env.NOTIFY_EMAIL?.trim();
        const smtpUser = process.env.SMTP_USER?.trim();
        const smtpPass = process.env.SMTP_PASS?.trim();

        if (!notifyEmail) {
          console.warn("[property-interest] NOTIFY_EMAIL not set — skipping notification");
        } else if (!smtpUser || !smtpPass) {
          console.warn(
            "[property-interest] SMTP_USER or SMTP_PASS missing — cannot send mail (set both in Replit Secrets)",
          );
        } else {
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
            from: `"SSP Deal Flow" <${smtpUser}>`,
            to: notifyEmail,
            subject: `🏠 New Investor Interest — ${propertyAddress}`,
            html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#e8432d;padding:20px 24px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0;font-size:18px">
              New Investor Interest
            </h2>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee">
            <p style="margin:0 0 16px;font-size:15px;color:#333">
              Someone just expressed interest in a deal on SSP Deal Flow.
            </p>
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:13px;width:140px">Property</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${propertyAddress}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:13px">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${fullName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:13px">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px">
                  <a href="mailto:${email}" style="color:#e8432d">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:13px">Phone</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px">
                  ${phone
                    ? `<a href="tel:${phone}" style="color:#e8432d">${phone}</a>`
                    : "Not provided"}
                </td>
              </tr>
              ${message ? `
              <tr>
                <td style="padding:10px 0;color:#666;font-size:13px">Message</td>
                <td style="padding:10px 0;font-size:13px">${message}</td>
              </tr>` : ""}
            </table>
            <div style="margin-top:24px;padding:16px;background:#fff3f2;border-radius:6px;border-left:3px solid #e8432d">
              <p style="margin:0;font-size:13px;color:#333">
                <strong>Action needed:</strong> Call or email this investor
                within 2 hours while the deal is top of mind.
              </p>
            </div>
          </div>
          <p style="text-align:center;margin-top:16px;font-size:11px;color:#999">
            SSP Deal Flow · Southern Specialty Properties
          </p>
        </div>
      `,
          });

          emailSent = true;
          console.log(`[property-interest] Notification sent to ${notifyEmail}`);
        }
      } catch (emailErr: unknown) {
        const err = emailErr as { message?: string; stack?: string };
        console.error(
          "[property-interest] Email failed:",
          err?.message || emailErr,
          err?.stack ? `\n${err.stack}` : "",
        );
      }

      console.log(
        `[property-interest] response interestId=${interest.id} emailSent=${emailSent}`,
      );
      res.json({ success: true, id: interest.id, emailSent });
    } catch (error) {
      console.error("Error creating property interest:", error);
      res.status(500).json({ error: "Failed to save interest" });
    }
  });

  // POST /api/qualify - Investor qualification form submission
  app.post("/api/qualify", async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone, isAccredited, capitalRange, investmentTimeline, primaryInterest } = req.body;

      // Validate required fields
      if (!fullName || !email || !phone || isAccredited === undefined || !capitalRange || !investmentTimeline || !primaryInterest) {
        return res.status(400).json({ 
          error: "All fields are required",
          received: { fullName: !!fullName, email: !!email, phone: !!phone, isAccredited, capitalRange: !!capitalRange, investmentTimeline: !!investmentTimeline, primaryInterest: !!primaryInterest }
        });
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Block if accreditation is not confirmed
      if (!isAccredited) {
        return res.status(400).json({ error: "Accredited investor confirmation is required" });
      }

      // Save lead to database
      let lead;
      try {
        lead = await storage.createLead({
          fullName: String(fullName).trim(),
          email: String(email).trim(),
          phone: String(phone).trim(),
          isAccredited: true,
          capitalRange: String(capitalRange),
          investmentTimeline: String(investmentTimeline),
          primaryInterest: String(primaryInterest),
        });
      } catch (dbError: any) {
        console.error("Database error creating lead:", dbError);
        return res.status(500).json({ 
          error: "Failed to save lead to database",
          message: dbError.message || "Database error"
        });
      }

      // Fire Meta Pixel Lead event with correct domain
      try {
        // Use production domain or environment variable, fallback to request host
        const baseUrl = process.env.SITE_URL || process.env.PRODUCTION_URL || 'https://sspdealflow.com';
        const eventSourceUrl = `${baseUrl}/qualify`;

        await sendFacebookPixelEvent({
          events: [
            createLeadEvent(eventSourceUrl, undefined, {
              email,
              firstName: fullName.split(' ')[0],
              lastName: fullName.split(' ').slice(1).join(' '),
              phone,
            }),
          ],
          testEventCode: process.env.FACEBOOK_TEST_EVENT_CODE,
        });
      } catch (pixelError) {
        console.error("Error sending Facebook Pixel event:", pixelError);
        // Don't fail the request if pixel fails
      }

      // Send confirmation email via Resend
      try {
        await sendQualificationConfirmation(email, fullName);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the request if email fails
      }

      // Append lead to Google Sheets (non-blocking with timeout)
      // Use Promise.race to add a timeout so it doesn't hang forever
      const sheetsPromise = appendLeadToSheet({
        name: fullName,
        email,
        phone,
        accredited: true,
        capitalRange,
        timeline: investmentTimeline,
        interest: primaryInterest,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Google Sheets operation timed out after 10 seconds')), 10000)
      );

      Promise.race([sheetsPromise, timeoutPromise])
        .then(() => {
          console.log("Successfully appended lead to Google Sheets");
        })
        .catch((sheetsError: any) => {
          // Log error without exposing sensitive information
          const errorMessage = sheetsError instanceof Error ? sheetsError.message : 'Unknown error';
          const errorCode = sheetsError?.code || 'NO_CODE';
          const errorStatus = sheetsError?.response?.status || 'NO_STATUS';
          
          console.error("Error appending to Google Sheets:", {
            message: errorMessage,
            code: errorCode,
            status: errorStatus,
            // Common issues:
            // - 401/403: Service account doesn't have access or credentials are wrong
            // - 404: Sheet ID is wrong or sheet doesn't exist
            // - ENOTFOUND: Network/API issue
            // - Timeout: API call took too long
          });
          // Don't fail the request if Sheets fails
        });

      res.json({
        success: true,
        leadId: lead.id,
        message: "Qualification form submitted successfully",
      });
    } catch (error: any) {
      console.error("Error processing qualification form:", error);
      // Ensure we always return JSON, not HTML
      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to process qualification form",
          message: error.message || "An unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  });

  // POST /api/facebook-pixel/events - Send server-side events to Facebook Conversions API
  app.post("/api/facebook-pixel/events", async (req: Request, res: Response) => {
    try {
      const { events, testEventCode } = req.body;

      if (!events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: "Events array is required" });
      }

      // Normalize event source URL to use production domain
      const normalizeEventSourceUrl = (url: string | undefined): string | undefined => {
        if (!url) return undefined;
        const baseUrl = process.env.SITE_URL || process.env.PRODUCTION_URL || 'https://sspdealflow.com';
        try {
          const urlObj = new URL(url);
          // If URL is from Replit domain, replace with production domain
          if (urlObj.hostname.includes('replit') || urlObj.hostname.includes('repl.co') || urlObj.hostname.includes('.replit.dev')) {
            return `${baseUrl}${urlObj.pathname}${urlObj.search}`;
          }
          // If URL is already from production domain, use as-is
          if (urlObj.hostname.includes('sspdealflow.com')) {
            return url;
          }
          // Otherwise, use production domain with the path from the original URL
          return `${baseUrl}${urlObj.pathname}${urlObj.search}`;
        } catch {
          // If URL parsing fails, return production domain with the path
          return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
        }
      };

      // Validate events structure
      const validatedEvents: FacebookPixelEvent[] = events.map((event: any) => ({
        eventName: event.eventName || event.event_name,
        eventTime: event.eventTime || event.event_time || Math.floor(Date.now() / 1000),
        eventSourceUrl: normalizeEventSourceUrl(event.eventSourceUrl || event.event_source_url),
        userData: event.userData || event.user_data,
        customData: event.customData || event.custom_data,
        eventId: event.eventId || event.event_id,
        actionSource: event.actionSource || event.action_source || 'website',
      }));

      // Send events to Facebook Conversions API
      const result = await sendFacebookPixelEvent({
        events: validatedEvents,
        testEventCode: testEventCode || process.env.FACEBOOK_TEST_EVENT_CODE || undefined,
      });

      res.json({
        success: true,
        events_received: result.events_received,
        test_mode: !!testEventCode,
      });
    } catch (error: any) {
      console.error("Error sending Facebook Pixel event:", error);
      res.status(500).json({
        error: "Failed to send Facebook Pixel event",
        message: error.message,
      });
    }
  });
  
  // Serve uploaded files from local filesystem (legacy - for documents)
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // Serve files from object storage (persistent storage for photos)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      await objectStorageService.downloadObject(req.params.objectPath, res);
    } catch (error) {
      console.error("Error fetching object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "File not found" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  // GET /api/config/maps-key - Get Google Maps API key for interactive maps
  app.get("/api/config/maps-key", (req: Request, res: Response) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      res.json({ apiKey });
    } else {
      res.status(404).json({ error: "Maps API key not configured" });
    }
  });

  // GET /api/maps/static - Generate static map URL for property with comps
  app.get("/api/maps/static/:propertyId", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(404).json({ error: "Maps API key not configured" });
      }
      
      // Try by ID first, then by slug
      let property = await storage.getProperty(req.params.propertyId);
      if (!property) {
        property = await storage.getPropertyBySlug(req.params.propertyId);
      }
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      const comps = property.comps as any[] || [];
      
      // Build markers for static map
      const markers: string[] = [];
      
      // Subject property marker (red)
      const subjectLocation = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
      markers.push(`color:red|label:S|${encodeURIComponent(subjectLocation)}`);
      
      // Comp markers (numbered)
      comps.forEach((comp, idx) => {
        if (comp.lat && comp.lng) {
          markers.push(`color:0x475569|label:${idx + 1}|${comp.lat},${comp.lng}`);
        } else if (comp.address) {
          markers.push(`color:0x475569|label:${idx + 1}|${encodeURIComponent(comp.address)}`);
        }
      });
      
      // Build static map URL with dark style
      const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
      const params = new URLSearchParams({
        size: "800x400",
        scale: "2",
        maptype: "roadmap",
        style: "element:geometry|color:0x242f3e",
        key: apiKey,
      });
      
      // Add dark theme styles
      const styles = [
        "element:geometry|color:0x242f3e",
        "element:labels.text.stroke|color:0x242f3e",
        "element:labels.text.fill|color:0x746855",
        "feature:administrative.locality|element:labels.text.fill|color:0xd59563",
        "feature:road|element:geometry|color:0x38414e",
        "feature:road|element:geometry.stroke|color:0x212a37",
        "feature:road|element:labels.text.fill|color:0x9ca5b3",
        "feature:water|element:geometry|color:0x17263c",
      ];
      
      let url = `${baseUrl}?${params.toString()}`;
      styles.forEach(style => {
        url += `&style=${encodeURIComponent(style)}`;
      });
      markers.forEach(marker => {
        url += `&markers=${marker}`;
      });
      
      res.json({ mapUrl: url });
    } catch (error) {
      console.error("Error generating map:", error);
      res.status(500).json({ error: "Failed to generate map" });
    }
  });

  // GET /api/properties - Get all properties
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  // GET /api/closed-deals - Get all closed deals
  app.get("/api/closed-deals", async (req: Request, res: Response) => {
    try {
      const deals = await storage.getClosedDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching closed deals:", error);
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  // GET /api/closed-deals/:slug - Get a single closed deal
  app.get("/api/closed-deals/:slug", async (req: Request, res: Response) => {
    try {
      const deal = await storage.getClosedDealBySlug(req.params.slug);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error fetching closed deal:", error);
      res.status(500).json({ error: "Failed to fetch deal" });
    }
  });

  // GET /api/properties/:id - Get single property (by ID or slug)
  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      // Try by ID first
      let property = await storage.getProperty(req.params.id);
      
      // If not found by ID, try by slug
      if (!property) {
        property = await storage.getPropertyBySlug(req.params.id);
      }
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  // GET /api/photos - Get all property photos (lightweight endpoint)
  app.get("/api/photos", async (req: Request, res: Response) => {
    try {
      const properties = await storage.getAllProperties();
      const photos = properties.map(p => ({
        propertyId: p.id,
        slug: p.slug,
        address: p.address,
        city: p.city,
        state: p.state,
        mainPhoto: p.mainPhotoUrl,
        galleryPhotos: p.galleryPhotoUrls || [],
      }));
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // GET /api/photos/:id - Get photos for a single property
  app.get("/api/photos/:id", async (req: Request, res: Response) => {
    try {
      let property = await storage.getProperty(req.params.id);
      if (!property) {
        property = await storage.getPropertyBySlug(req.params.id);
      }
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      res.json({
        propertyId: property.id,
        slug: property.slug,
        address: property.address,
        city: property.city,
        state: property.state,
        mainPhoto: property.mainPhotoUrl,
        galleryPhotos: property.galleryPhotoUrls || [],
      });
    } catch (error) {
      console.error("Error fetching property photos:", error);
      res.status(500).json({ error: "Failed to fetch property photos" });
    }
  });

  // ============================================
  // ADMIN ENDPOINTS (Protected by isAdmin middleware)
  // ============================================

  // POST /api/admin/closed-deals/extract-pdf - Extract structured deal data from a closeout PDF
  app.post("/api/admin/closed-deals/extract-pdf", isAdmin, (req: Request, res: Response, next: NextFunction) => {
    closedDealPdfUpload.single("pdf")(req, res, (err) => {
      if (err) {
        console.error("Closed deal PDF upload error:", err);
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message, code: err.code });
        }
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    try {
      const pdfData = await parsePDF(file.buffer);
      const pdfText = (pdfData.text ?? "").trim();

      if (!pdfText) {
        throw new Error("Could not extract text from PDF");
      }

      const textLength = pdfText.length;
      const beginningText = pdfText.slice(0, Math.min(25000, textLength));
      const endingText = textLength > 25000 ? pdfText.slice(-12000) : "";
      const pdfTextForExtraction = endingText
        ? `${beginningText}\n\n[...middle section omitted for brevity...]\n\n${endingText}`
        : beginningText;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You extract structured real-estate closeout data from SSP closeout report PDFs. Return only valid JSON matching the requested schema. Use null when a field is missing. Parse dollar values as numbers without dollar signs or commas. Parse percentages as numbers without percent signs.",
          },
          {
            role: "user",
            content: `Extract all financial and deal data from this SSP closeout report PDF text.
Return ONLY a valid JSON object with NO markdown formatting, NO backticks, NO preamble.

Required JSON structure:
{
  "address": "street address only",
  "city": "city name",
  "state": "2-letter state code",
  "zip": "zip code or null",
  "source": "HUD or Off-Market",
  "purchasePrice": number,
  "salePrice": number or null,
  "dealProfit": number,
  "investorRoi": number (as percentage, e.g. 5.99),
  "annualizedRoi": number (as percentage, e.g. 15.52),
  "totalInvestorPayoff": number,
  "investorCapital": number,
  "investorProfitShare": number,
  "operatorShare": number,
  "partnerShare": number,
  "acquisitionDate": "Month DD, YYYY",
  "closeDate": "Month DD, YYYY",
  "daysHeld": number,
  "netSaleProceeds": number,
  "excessDrawReimbursement": number,
  "totalSources": number,
  "cashToClose": number,
  "earnestMoney": number,
  "acquisitionCosts": number,
  "rehabCosts": number,
  "holdingCosts": number,
  "salesCosts": number,
  "totalUses": number,
  "reportGeneratedAt": "date string from PDF footer",
  "costLineItems": [
    {
      "category": "Renovation|Holding|Acquisition|Sales",
      "amount": number
    }
  ]
}

If any value is not present in the PDF, use null.

PDF text:
${pdfTextForExtraction}`,
          },
        ],
      });

      const rawText = completion.choices[0]?.message?.content ?? "";
      const cleaned = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const extracted = JSON.parse(cleaned);
      const slug = `${extracted.address}-${extracted.city}-${extracted.state}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      res.json({
        success: true,
        extracted: { ...extracted, slug },
      });
    } catch (error: any) {
      console.error("[pdf-extract] Error:", error?.message || error);
      res.status(500).json({
        error: "Failed to extract PDF data",
        detail: error?.message || "Unknown error",
      });
    }
  });

  // POST /api/admin/closed-deals - Save a closed deal
  app.post("/api/admin/closed-deals", isAdmin, async (req: Request, res: Response) => {
    try {
      const deal = await storage.createClosedDeal(req.body);
      res.status(201).json({ success: true, deal });
    } catch (error: any) {
      console.error("[closed-deals] Save error:", error);
      res.status(500).json({
        error: "Failed to save deal",
        detail: error?.message || "Unknown error",
      });
    }
  });

  // PATCH /api/admin/closed-deals/:id - Update a closed deal
  app.patch("/api/admin/closed-deals/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const deal = await storage.updateClosedDeal(
        parseInt(req.params.id, 10),
        req.body,
      );
      res.json({ success: true, deal });
    } catch (error) {
      console.error("[closed-deals] Update error:", error);
      res.status(500).json({ error: "Failed to update deal" });
    }
  });

  // DELETE /api/admin/closed-deals/:id - Delete a closed deal
  app.delete("/api/admin/closed-deals/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteClosedDeal(parseInt(req.params.id, 10));
      if (!deleted) {
        return res.status(404).json({ error: "Closed deal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[closed-deals] Delete error:", error);
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  // POST /api/admin/properties - Create property
  app.post("/api/admin/properties", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      
      // Auto-geocode if lat/lng not provided
      if (!validatedData.lat || !validatedData.lng) {
        const fullAddress = `${validatedData.address}, ${validatedData.city}, ${validatedData.state} ${validatedData.zip}`;
        const geocodeResult = await geocodeAddress(fullAddress);
        if (geocodeResult) {
          validatedData.lat = geocodeResult.lat;
          validatedData.lng = geocodeResult.lng;
        }
      }
      
      const property = await storage.createProperty(validatedData);
      
      await storage.createActivityLog({
        action: "create",
        resourceType: "property",
        resourceId: property.id,
        details: { address: property.address },
      });

      // Only email investors when the admin opted in on the form. This lets
      // deals be backfilled silently and alerted later (one at a time) via the
      // manual "Send email alert" button. The send fn also no-ops for
      // non-AVAILABLE deals and won't re-send if dealAlertSentAt is already set.
      if (req.body?.sendAlert === true) {
        sendDealAlertEmails(property).catch((err) =>
          console.error("[deal-alert] Background send failed:", err)
        );
      }
      
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  // POST /api/admin/properties/:id/send-alert - Manually send the deal alert email.
  // Lets admins stagger backfilled deals: create silently, then trigger each
  // alert on demand. Won't re-send unless { force: true } is passed.
  app.post("/api/admin/properties/:id/send-alert", isAdmin, async (req: Request, res: Response) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      if (property.status !== "AVAILABLE") {
        return res.status(400).json({
          error: `Deal alerts can only be sent for AVAILABLE deals (this one is "${property.status}").`,
        });
      }

      if (property.dealAlertSentAt && req.body?.force !== true) {
        return res.status(409).json({
          error: "An alert was already sent for this deal.",
          alreadySent: true,
          dealAlertSentAt: property.dealAlertSentAt,
        });
      }

      const result = await sendDealAlertEmails(property);

      await storage.createActivityLog({
        action: "send_deal_alert",
        resourceType: "property",
        resourceId: property.id,
        details: { address: property.address, ...result },
      });

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("[deal-alert] Manual send error:", error);
      res.status(500).json({ error: "Failed to send deal alert" });
    }
  });

  // GET /api/unsubscribe?token=... - Public, one-click opt-out from deal alerts.
  app.get("/api/unsubscribe", async (req: Request, res: Response) => {
    const page = (title: string, message: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#0a0908;color:#f0ebe3;margin:0;padding:48px 20px;text-align:center">
  <div style="max-width:460px;margin:0 auto;background:#181614;border:1px solid #2a2724;border-radius:12px;padding:32px">
    <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
    <p style="font-size:14px;color:#a89e91;line-height:1.6;margin:0">${message}</p>
  </div>
</body></html>`;

    try {
      const token = typeof req.query.token === "string" ? req.query.token : "";
      const userId = verifyUnsubscribeToken(token);
      if (!userId) {
        return res
          .status(400)
          .send(page("Invalid link", "This unsubscribe link is invalid or has expired."));
      }

      await db
        .update(users)
        .set({ unsubscribedFromDeals: new Date() })
        .where(eq(users.id, userId));

      res.send(
        page(
          "You're unsubscribed",
          "You'll no longer receive new deal alert emails. You can still browse deals anytime in your account."
        )
      );
    } catch (error) {
      console.error("[unsubscribe] Error:", error);
      res.status(500).send(page("Something went wrong", "Please try again later."));
    }
  });

  // PUT /api/admin/properties/:id - Update property
  app.put("/api/admin/properties/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = updatePropertySchema.parse(req.body);
      
      // Auto-geocode if address is being updated and lat/lng not provided
      const hasAddressFields = validatedData.address || validatedData.city || validatedData.state || validatedData.zip;
      if (hasAddressFields && !validatedData.lat && !validatedData.lng) {
        // Get existing property to fill in missing address fields
        const existingProperty = await storage.getProperty(req.params.id);
        if (existingProperty) {
          const address = validatedData.address || existingProperty.address;
          const city = validatedData.city || existingProperty.city;
          const state = validatedData.state || existingProperty.state;
          const zip = validatedData.zip || existingProperty.zip;
          const fullAddress = `${address}, ${city}, ${state} ${zip}`;
          const geocodeResult = await geocodeAddress(fullAddress);
          if (geocodeResult) {
            validatedData.lat = geocodeResult.lat;
            validatedData.lng = geocodeResult.lng;
          }
        }
      }
      
      const property = await storage.updateProperty(req.params.id, validatedData);
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      await storage.createActivityLog({
        action: "update",
        resourceType: "property",
        resourceId: property.id,
        details: { updatedFields: Object.keys(validatedData) },
      });
      
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // DELETE /api/admin/properties/:id - Delete property
  app.delete("/api/admin/properties/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      const deleted = await storage.deleteProperty(req.params.id);
      
      if (deleted) {
        await storage.createActivityLog({
          action: "delete",
          resourceType: "property",
          resourceId: req.params.id,
          details: { address: property.address },
        });
      }
      
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // POST /api/admin/upload/photo - Upload photo to object storage
  app.post("/api/admin/upload/photo", isAdmin, (req: Request, res: Response, next: NextFunction) => {
    photoUpload.any()(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message, code: err.code });
        }
        return res.status(500).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const file = files[0];
      const objectStorageService = new ObjectStorageService();
      
      // Upload to object storage
      const url = await objectStorageService.uploadBuffer(
        file.buffer,
        "photos",
        file.mimetype
      );
      
      await storage.createActivityLog({
        action: "upload",
        resourceType: "photo",
        details: { originalName: file.originalname, url },
      });
      
      res.json({ url, filename: file.originalname });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  // POST /api/admin/upload/document - Upload document to object storage
  app.post("/api/admin/upload/document", isAdmin, (req: Request, res: Response, next: NextFunction) => {
    documentUpload.any()(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message, code: err.code });
        }
        return res.status(500).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const file = files[0];
      const objectStorageService = new ObjectStorageService();
      const url = await objectStorageService.uploadBuffer(
        file.buffer,
        "documents",
        file.mimetype
      );
      
      await storage.createActivityLog({
        action: "upload",
        resourceType: "document",
        details: { originalName: file.originalname, url },
      });
      
      res.json({ 
        url, 
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size 
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // POST /api/admin/upload/photos - Upload multiple photos to object storage
  app.post("/api/admin/upload/photos", isAdmin, (req: Request, res: Response, next: NextFunction) => {
    photoUpload.any()(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message, code: err.code });
        }
        return res.status(500).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const objectStorageService = new ObjectStorageService();
      
      // Upload all files in parallel for much faster uploads
      const uploadPromises = files.map(async (file) => {
        const url = await objectStorageService.uploadBuffer(
          file.buffer,
          "photos",
          file.mimetype
        );
        return {
          url,
          filename: file.originalname,
        };
      });
      
      const urls = await Promise.all(uploadPromises);
      
      await storage.createActivityLog({
        action: "upload",
        resourceType: "photo",
        details: { count: files.length, files: urls },
      });
      
      res.json({ urls });
    } catch (error) {
      console.error("Error uploading photos:", error);
      res.status(500).json({ error: "Failed to upload photos" });
    }
  });

  // POST /api/admin/properties/bulk_import - Bulk import properties
  app.post("/api/admin/properties/bulk_import", isAdmin, async (req: Request, res: Response) => {
    try {
      const { properties: propertyList } = req.body;
      
      if (!Array.isArray(propertyList)) {
        return res.status(400).json({ error: "Properties must be an array" });
      }
      
      const validatedProperties = propertyList.map(p => insertPropertySchema.parse(p));
      const created = await storage.bulkCreateProperties(validatedProperties);
      
      await storage.createActivityLog({
        action: "create",
        resourceType: "property",
        details: { bulkImport: true, count: created.length },
      });
      
      res.status(201).json({ created: created.length, properties: created });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error bulk importing properties:", error);
      res.status(500).json({ error: "Failed to bulk import properties" });
    }
  });

  // PUT /api/admin/properties/bulk_update - Bulk update properties
  app.put("/api/admin/properties/bulk_update", isAdmin, async (req: Request, res: Response) => {
    try {
      const { updates } = req.body;
      
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: "Updates must be an array" });
      }
      
      const validatedUpdates = updates.map(u => ({
        id: u.id,
        data: updatePropertySchema.parse(u.data),
      }));
      
      const updated = await storage.bulkUpdateProperties(validatedUpdates);
      
      await storage.createActivityLog({
        action: "update",
        resourceType: "property",
        details: { bulkUpdate: true, count: updated.length },
      });
      
      res.json({ updated: updated.length, properties: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error bulk updating properties:", error);
      res.status(500).json({ error: "Failed to bulk update properties" });
    }
  });

  // POST /api/admin/properties/geocode-all - Geocode all properties that don't have lat/lng
  app.post("/api/admin/properties/geocode-all", isAdmin, async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Google Maps API key not configured" });
      }

      const properties = await storage.getAllProperties();
      const { geocodeAddress } = await import("./services/geocoding");
      
      const geocodedCount = { success: 0, failed: 0 };
      const updates = [];

      for (const prop of properties) {
        // Skip if already has coordinates
        if (prop.lat && prop.lng) {
          continue;
        }

        const fullAddress = `${prop.address}, ${prop.city}, ${prop.state} ${prop.zip}`;
        const result = await geocodeAddress(fullAddress);
        
        if (result) {
          updates.push({
            id: prop.id,
            data: { lat: result.lat, lng: result.lng }
          });
          geocodedCount.success++;
        } else {
          geocodedCount.failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Batch update all geocoded properties
      if (updates.length > 0) {
        await storage.bulkUpdateProperties(updates);
      }

      await storage.createActivityLog({
        action: "update",
        resourceType: "property",
        details: { action: "geocode-all", ...geocodedCount },
      });

      res.json({ 
        message: "Geocoding completed",
        geocoded: geocodedCount.success,
        failed: geocodedCount.failed,
        alreadyHadCoords: properties.length - geocodedCount.success - geocodedCount.failed
      });
    } catch (error) {
      console.error("Error geocoding properties:", error);
      res.status(500).json({ error: "Failed to geocode properties" });
    }
  });

  // POST /api/admin/process-bpo - Process BPO document and extract comps
  app.post("/api/admin/process-bpo", isAdmin, (req: Request, res: Response, next: NextFunction) => {
    bpoProcessUpload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer error in BPO upload:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            const maxMb = Math.round(BPO_PROCESS_MAX_FILE_BYTES / (1024 * 1024));
            return res.status(400).json({
              error: "File too large",
              message: `BPO/valuation PDF must be ${maxMb}MB or smaller. Try compressing the PDF or reducing scan resolution.`,
              code: err.code,
            });
          }
          return res.status(400).json({ error: err.message, code: err.code });
        }
        return res.status(500).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  }, async (req: Request, res: Response) => {
    try {
      console.log("BPO processing endpoint hit - file received");
      const file = req.file as Express.Multer.File;
      if (!file) {
        console.error("No file in request");
        return res.status(400).json({ error: "No BPO file uploaded" });
      }

      if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "BPO must be a PDF file" });
      }

      console.log(`Processing BPO: ${file.originalname}, size: ${file.size} bytes`);

      // Use file.path if available (multer diskStorage), otherwise construct path
      const filePath = file.path || path.join(uploadDir, "documents", file.filename);
      console.log("BPO file path:", filePath);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error("File not found at path:", filePath);
        return res.status(500).json({ error: "Uploaded file not found on server" });
      }

      // Extract data from BPO using OpenAI with timeout
      console.log("Starting OpenAI extraction...");
      let extractedData: any;
      try {
        extractedData = await Promise.race([
          extractBPOData(filePath),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error("OpenAI extraction timeout after 60 seconds")), 60000)
          )
        ]);
        console.log(`Extracted ${extractedData.comps?.length || 0} comps from BPO`);
      } catch (extractError) {
        console.error("OpenAI extraction error:", extractError);
        throw new Error(`Failed to extract BPO data: ${extractError instanceof Error ? extractError.message : "Unknown error"}`);
      }

      let comps = extractedData.comps || [];

      // Geocode all comp addresses with timeout
      console.log("Starting geocoding...");
      try {
        comps = await Promise.race([
          geocodeComps(comps) as Promise<any[]>,
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error("Geocoding timeout after 45 seconds")), 45000)
          )
        ]);
        console.log(`Geocoded ${comps.length} comps`);
      } catch (geocodeError) {
        console.error("Geocoding error:", geocodeError);
        // Continue even if geocoding fails - comps are still valid
        console.warn("Continuing without server-side geocoding - client CompsMap will attempt fallback...");
      }

      // Upload BPO PDF to persistent object storage
      const objectStorageService = new ObjectStorageService();
      const fileBuffer = fs.readFileSync(filePath);
      const persistentUrl = await objectStorageService.uploadBuffer(
        fileBuffer,
        "documents",
        "application/pdf"
      );

      // Clean up local temp file
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore cleanup errors */ }

      await storage.createActivityLog({
        action: "upload",
        resourceType: "document",
        details: { 
          originalName: file.originalname, 
          url: persistentUrl,
          type: "bpo",
          compsExtracted: comps.length 
        },
      }).catch(err => {
        console.error("Failed to create activity log:", err);
      });

      res.json({ 
        comps,
        subject: extractedData.subject,
        repairs: extractedData.repairs || [],
        url: persistentUrl,
        filename: file.originalname,
        originalName: file.originalname,
      });
    } catch (error) {
      console.error("Error processing BPO:", error);
      // Make sure we send a response even if there's an error
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Failed to process BPO", 
          message: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
  });

  app.get("/api/admin/leads", isAdmin, async (req: Request, res: Response) => {
    try {
      const leadsList = await storage.getLeads();
      res.json(leadsList);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/admin/property-interests", isAdmin, async (req: Request, res: Response) => {
    try {
      const interests = await storage.getPropertyInterests();
      res.json(interests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interests" });
    }
  });

  // GET /api/admin/activity-logs - Get activity logs
  app.get("/api/admin/activity-logs", isAdmin, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  return httpServer;
}
