import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, updatePropertySchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractBPOData } from "./services/openai";
import { geocodeComps } from "./services/geocoding";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

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

// Document upload uses disk storage (for PDF processing)
const documentUpload = multer({
  storage: diskStorage,
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

  // ============================================
  // ADMIN ENDPOINTS (Protected by isAdmin middleware)
  // ============================================

  // POST /api/admin/properties - Create property
  app.post("/api/admin/properties", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      
      await storage.createActivityLog({
        action: "create",
        resourceType: "property",
        resourceId: property.id,
        details: { address: property.address },
      });
      
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

  // POST /api/admin/upload/document - Upload document (kept on disk for processing)
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
      const url = `/uploads/documents/${file.filename}`;
      
      await storage.createActivityLog({
        action: "upload",
        resourceType: "document",
        details: { filename: file.filename, originalName: file.originalname, url },
      });
      
      res.json({ 
        url, 
        filename: file.filename,
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
            setTimeout(() => reject(new Error("Geocoding timeout after 30 seconds")), 30000)
          )
        ]);
        console.log(`Geocoded ${comps.length} comps`);
      } catch (geocodeError) {
        console.error("Geocoding error:", geocodeError);
        // Continue even if geocoding fails - comps are still valid
        console.warn("Continuing without geocoding...");
      }

      await storage.createActivityLog({
        action: "upload",
        resourceType: "document",
        details: { 
          filename: file.filename, 
          originalName: file.originalname, 
          type: "bpo",
          compsExtracted: comps.length 
        },
      }).catch(err => {
        console.error("Failed to create activity log:", err);
        // Don't fail the request if activity log fails
      });

      res.json({ 
        comps,
        subject: extractedData.subject,
        repairs: extractedData.repairs || [],
        url: `/uploads/documents/${file.filename}`,
        filename: file.filename,
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
