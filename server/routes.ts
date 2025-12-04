import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, updatePropertySchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.mimetype.startsWith("image/") ? "photos" : "documents";
    const fullPath = path.join(uploadDir, subDir);
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

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
  
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

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

  // GET /api/properties/:id - Get single property
  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const property = await storage.getProperty(req.params.id);
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
  // ADMIN ENDPOINTS
  // ============================================

  // POST /api/admin/properties - Create property
  app.post("/api/admin/properties", async (req: Request, res: Response) => {
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
  app.put("/api/admin/properties/:id", async (req: Request, res: Response) => {
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
  app.delete("/api/admin/properties/:id", async (req: Request, res: Response) => {
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

  // POST /api/admin/upload/photo - Upload photo
  app.post("/api/admin/upload/photo", upload.single("photo"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const url = `/uploads/photos/${req.file.filename}`;
      
      await storage.createActivityLog({
        action: "upload",
        resourceType: "photo",
        details: { filename: req.file.filename, url },
      });
      
      res.json({ url, filename: req.file.filename });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  // POST /api/admin/upload/document - Upload document
  app.post("/api/admin/upload/document", upload.single("document"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const url = `/uploads/documents/${req.file.filename}`;
      
      await storage.createActivityLog({
        action: "upload",
        resourceType: "document",
        details: { filename: req.file.filename, originalName: req.file.originalname, url },
      });
      
      res.json({ 
        url, 
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size 
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // POST /api/admin/upload/photos - Upload multiple photos
  app.post("/api/admin/upload/photos", upload.array("photos", 10), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const urls = files.map(file => ({
        url: `/uploads/photos/${file.filename}`,
        filename: file.filename,
      }));
      
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
  app.post("/api/admin/properties/bulk_import", async (req: Request, res: Response) => {
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
  app.put("/api/admin/properties/bulk_update", async (req: Request, res: Response) => {
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

  // GET /api/admin/activity-logs - Get activity logs
  app.get("/api/admin/activity-logs", async (req: Request, res: Response) => {
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
