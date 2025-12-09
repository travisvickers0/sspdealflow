// Object Storage Service using Replit's official SDK
// Reference: blueprint:javascript_object_storage

import { Client } from "@replit/object-storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import { Readable } from "stream";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async uploadBuffer(buffer: Buffer, subfolder: string = "photos", contentType: string = "image/jpeg"): Promise<string> {
    const objectId = randomUUID();
    const extension = this.getExtensionFromContentType(contentType);
    const objectPath = `${subfolder}/${objectId}${extension}`;

    // Use uploadFromStream as it handles Buffer data correctly
    const stream = Readable.from(buffer);
    await this.client.uploadFromStream(objectPath, stream);

    // Brief verification - don't block too long as object storage is eventually consistent
    // The client-side will retry loading if needed
    const exists = await this.quickVerify(objectPath);
    if (!exists) {
      console.warn(`Object ${objectPath} not immediately available - client will retry`);
    }

    return `/objects/${objectPath}`;
  }

  private async quickVerify(objectPath: string): Promise<boolean> {
    // Single quick check - don't wait too long to avoid timeouts with batch uploads
    const { ok } = await this.client.exists(objectPath);
    return ok;
  }

  private getExtensionFromContentType(contentType: string): string {
    switch (contentType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      case 'application/pdf':
        return '.pdf';
      default:
        return '';
    }
  }

  async downloadObject(objectPath: string, res: Response): Promise<void> {
    try {
      const { ok, value, error } = await this.client.downloadAsBytes(objectPath);
      
      if (!ok) {
        console.error("Object storage download failed:", error);
        throw new ObjectNotFoundError();
      }

      // SDK returns array with buffer inside
      const buffer = Array.isArray(value) ? value[0] : value;
      
      if (!buffer || buffer.length === 0) {
        throw new ObjectNotFoundError();
      }

      const contentType = this.getContentType(objectPath);
      
      res.set({
        "Content-Type": contentType,
        "Content-Length": buffer.length,
        "Cache-Control": "public, max-age=31536000",
      });

      res.send(buffer);
    } catch (error) {
      console.error("Error downloading object:", error);
      throw error;
    }
  }

  async deleteObject(objectPath: string): Promise<boolean> {
    const { ok, error } = await this.client.delete(objectPath);
    
    if (!ok) {
      console.error("Object storage delete failed:", error);
      return false;
    }
    
    return true;
  }

  async objectExists(objectPath: string): Promise<boolean> {
    const { ok } = await this.client.exists(objectPath);
    return ok;
  }

  normalizeObjectPath(rawPath: string): string {
    if (rawPath.startsWith("/objects/")) {
      return rawPath.slice(9);
    }
    return rawPath;
  }

  private getContentType(objectPath: string): string {
    const ext = objectPath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }
}
