import { type Invitation, type InsertInvitation, type Wedding, type InsertWedding, type Settings, invitations, settings, weddings } from "@shared/schema";
import { db } from "./db";
import { eq, isNull } from "drizzle-orm";

export interface IStorage {
  getWeddings(): Promise<Wedding[]>;
  getWedding(id: string): Promise<Wedding | undefined>;
  createWedding(data: InsertWedding): Promise<Wedding>;
  updateWedding(id: string, data: Partial<InsertWedding>): Promise<Wedding | undefined>;
  deleteWedding(id: string): Promise<boolean>;

  getInvitations(): Promise<Invitation[]>;
  getInvitationsByWedding(weddingId: string): Promise<Invitation[]>;
  getInvitation(id: string): Promise<Invitation | undefined>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  updateInvitation(id: string, data: Partial<InsertInvitation>): Promise<Invitation | undefined>;
  updateQRCode(id: string, qrCode: string): Promise<Invitation | undefined>;
  deleteInvitation(id: string): Promise<boolean>;
  respondInvitation(id: string, status: string, confirmedSeats: number): Promise<Invitation | undefined>;
  linkOrphanedInvitations(weddingId: string): Promise<void>;

  getSettings(): Promise<Settings>;
  updateSettings(activeStyle: string): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getWeddings(): Promise<Wedding[]> {
    return await db.select().from(weddings).orderBy(weddings.createdAt);
  }

  async getWedding(id: string): Promise<Wedding | undefined> {
    const [wedding] = await db.select().from(weddings).where(eq(weddings.id, id));
    return wedding;
  }

  async createWedding(data: InsertWedding): Promise<Wedding> {
    const [wedding] = await db.insert(weddings).values(data).returning();
    return wedding;
  }

  async updateWedding(id: string, data: Partial<InsertWedding>): Promise<Wedding | undefined> {
    const [updated] = await db.update(weddings).set(data).where(eq(weddings.id, id)).returning();
    return updated;
  }

  async deleteWedding(id: string): Promise<boolean> {
    const result = await db.delete(weddings).where(eq(weddings.id, id)).returning();
    return result.length > 0;
  }

  async getInvitations(): Promise<Invitation[]> {
    return await db.select().from(invitations);
  }

  async getInvitationsByWedding(weddingId: string): Promise<Invitation[]> {
    return await db.select().from(invitations).where(eq(invitations.weddingId, weddingId));
  }

  async getInvitation(id: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.id, id));
    return invitation;
  }

  async createInvitation(data: InsertInvitation): Promise<Invitation> {
    const [invitation] = await db.insert(invitations).values(data).returning();
    return invitation;
  }

  async updateInvitation(id: string, data: Partial<InsertInvitation>): Promise<Invitation | undefined> {
    const updateData: Record<string, any> = {};
    if (data.guestName !== undefined) updateData.guestName = data.guestName;
    if (data.seats !== undefined) updateData.seats = data.seats;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.confirmedSeats !== undefined) updateData.confirmedSeats = data.confirmedSeats;
    if (data.weddingId !== undefined) updateData.weddingId = data.weddingId;

    if (Object.keys(updateData).length === 0) return await this.getInvitation(id);
    const [updated] = await db.update(invitations).set(updateData).where(eq(invitations.id, id)).returning();
    return updated;
  }

  async updateQRCode(id: string, qrCode: string): Promise<Invitation | undefined> {
    const [updated] = await db.update(invitations).set({ qrCode }).where(eq(invitations.id, id)).returning();
    return updated;
  }

  async deleteInvitation(id: string): Promise<boolean> {
    const result = await db.delete(invitations).where(eq(invitations.id, id)).returning();
    return result.length > 0;
  }

  async respondInvitation(id: string, status: string, confirmedSeats: number): Promise<Invitation | undefined> {
    const [updated] = await db.update(invitations)
      .set({ status, confirmedSeats })
      .where(eq(invitations.id, id))
      .returning();
    return updated;
  }

  async linkOrphanedInvitations(weddingId: string): Promise<void> {
    await db.update(invitations).set({ weddingId }).where(isNull(invitations.weddingId));
  }

  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).where(eq(settings.id, "main"));
    if (existing) return existing;
    const [created] = await db.insert(settings).values({ id: "main", activeStyle: "clasico" }).returning();
    return created;
  }

  async updateSettings(activeStyle: string): Promise<Settings> {
    await this.getSettings();
    const [updated] = await db.update(settings)
      .set({ activeStyle })
      .where(eq(settings.id, "main"))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
