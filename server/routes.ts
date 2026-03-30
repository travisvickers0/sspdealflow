import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, updatePropertySchema, users } from "@shared/schema";
import { db } from "./db";
import { isNotNull } from "drizzle-orm";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractBPOData } from "./services/openai";
import { geocodeComps, geocodeAddress } from "./services/geocoding";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { sendFacebookPixelEvent, type FacebookPixelEvent, createLeadEvent } from "./services/facebookPixel";
import nodemailer from "nodemailer";
import { sendQualificationConfirmation } from "./services/resend";
import { appendLeadToSheet } from "./lib/googleSheets";

async function sendDealAlertEmails(property: any) {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(isNotNull(users.email));

    if (!allUsers.length) {
      console.log("[deal-alert] No users to notify");
      return;
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const propertyUrl = `${process.env.SITE_URL ?? "https://sspdealflow.com"}/property/${property.slug}`;

    const photoUrl = property.mainPhotoUrl
      ? property.mainPhotoUrl.startsWith("http")
        ? property.mainPhotoUrl
        : `${process.env.SITE_URL ?? "https://sspdealflow.com"}${property.mainPhotoUrl}`
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

    const closingFormatted = property.closingDate
      ? new Date(property.closingDate).toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric"
        })
      : "TBD";

    const emailPromises = allUsers
      .filter(u => u.email)
      .map(user => {
        const firstName = user.firstName ?? "Investor";

        return transporter.sendMail({
          from: `"SSP Deal Flow" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: `🏠 New Deal Available — ${property.address}`,
          html: `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0908;border-radius:12px;overflow:hidden">

    <!-- Header -->
    <div style="background:#e8432d;padding:20px 28px;display:flex;align-items:center;gap:10px">
      <div style="width:28px;height:28px;background:rgba(255,255,255,0.2);border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:13px;flex-shrink:0">S</div>
      <span style="color:white;font-weight:600;font-size:15px">SSP Deal Flow</span>
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
              ${property.rehabBudget === 0 ? "$0 — cosmetic only" : priceFormatted}
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
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px">
        <div style="width:20px;height:20px;background:#e8432d;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white">S</div>
        <span style="font-size:13px;font-weight:600;color:#a89e91">SSP Deal Flow</span>
      </div>
      <p style="margin:0 0 8px;font-size:11px;color:#6b6158;line-height:1.6">
        Deal-by-deal joint venture partnerships. Not a Fund. No pooled capital.<br/>
        You're receiving this because you have an SSP Deal Flow account.
      </p>
      <p style="margin:0;font-size:10px;color:#6b6158">
        © 2026 Southern Specialty Properties
      </p>
    </div>

  </div>
`,
        });
      });

    const results = await Promise.allSettled(emailPromises);
    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    console.log(`[deal-alert] Sent ${sent}/${allUsers.length} emails. Failed: ${failed}`);
  } catch (err: any) {
    console.error("[deal-alert] Failed:", err.message);
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

      sendDealAlertEmails(property).catch((err) =>
        console.error("[deal-alert] Background send failed:", err)
      );
      
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
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
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Multer error in BPO upload:", err);
        if (err instanceof multer.MulterError) {
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
