import { 
  users, properties, activityLogs,
  type User, type UpsertUser,
  type Property, type InsertProperty, type UpdateProperty,
  type ActivityLog, type InsertActivityLog,
  generatePropertySlug
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, and, gte, lte, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // Users (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Properties
  getAllProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: UpdateProperty): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  bulkCreateProperties(properties: InsertProperty[]): Promise<Property[]>;
  bulkUpdateProperties(updates: { id: string; data: UpdateProperty }[]): Promise<Property[]>;
  
  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  // Helper to generate unique slug with collision handling
  private async generateUniqueSlug(address: string, city: string, state: string, excludeId?: string): Promise<string> {
    const baseSlug = generatePropertySlug(address, city, state);
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, slug));
      // If no conflict, or the conflict is the same property we're updating, we're good
      if (existing.length === 0 || (excludeId && existing.length === 1 && existing[0].id === excludeId)) {
        return slug;
      }
      // Append counter for uniqueness
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  // User methods (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property methods
  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.slug, slug));
    return property || undefined;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const slug = await this.generateUniqueSlug(property.address, property.city, property.state);
    const [newProperty] = await db.insert(properties).values({ ...property, slug }).returning();
    return newProperty;
  }

  async updateProperty(id: string, property: UpdateProperty): Promise<Property | undefined> {
    // If address fields are being updated, regenerate slug
    let updateData: any = { ...property, updatedAt: new Date() };
    
    if (property.address || property.city || property.state) {
      // Need to fetch the current property to get complete address info
      const current = await this.getProperty(id);
      if (current) {
        const newAddress = property.address ?? current.address;
        const newCity = property.city ?? current.city;
        const newState = property.state ?? current.state;
        updateData.slug = await this.generateUniqueSlug(newAddress, newCity, newState, id);
      }
    }
    
    const [updated] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
  }

  async bulkCreateProperties(propertyList: InsertProperty[]): Promise<Property[]> {
    if (propertyList.length === 0) return [];
    // Generate unique slugs for each property, tracking in-batch slugs
    const propertiesWithSlugs = [];
    const usedSlugsInBatch = new Set<string>();
    
    for (const p of propertyList) {
      let slug = await this.generateUniqueSlug(p.address, p.city, p.state);
      
      // Handle in-batch collisions
      let counter = 2;
      const baseSlug = slug;
      while (usedSlugsInBatch.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      usedSlugsInBatch.add(slug);
      propertiesWithSlugs.push({ ...p, slug });
    }
    return await db.insert(properties).values(propertiesWithSlugs).returning();
  }

  async bulkUpdateProperties(updates: { id: string; data: UpdateProperty }[]): Promise<Property[]> {
    const results: Property[] = [];
    for (const update of updates) {
      const updated = await this.updateProperty(update.id, update.data);
      if (updated) results.push(updated);
    }
    return results;
  }

  // Activity Log methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
