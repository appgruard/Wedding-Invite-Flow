import { type Invitation, type InsertInvitation, type Settings, invitations, settings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getInvitations(): Promise<Invitation[]>;
  getInvitation(id: string): Promise<Invitation | undefined>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  updateInvitation(id: string, data: Partial<InsertInvitation>): Promise<Invitation | undefined>;
  updateQRCode(id: string, qrCode: string): Promise<Invitation | undefined>;
  deleteInvitation(id: string): Promise<boolean>;
  respondInvitation(id: string, status: string, confirmedSeats: number): Promise<Invitation | undefined>;
  getSettings(): Promise<Settings>;
  updateSettings(activeStyle: string): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getInvitations(): Promise<Invitation[]> {
    return await db.select().from(invitations);
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
    const updateData: any = {};
    if (data.guestName !== undefined) updateData.guestName = data.guestName;
    if (data.seats !== undefined) updateData.seats = data.seats;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.confirmedSeats !== undefined) updateData.confirmedSeats = data.confirmedSeats;

    if (Object.keys(updateData).length === 0) {
      return await this.getInvitation(id);
    }

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

  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).where(eq(settings.id, "main"));
    if (existing) return existing;
    const [created] = await db.insert(settings).values({ id: "main", activeStyle: "clasico" }).returning();
    return created;
  }

  async updateSettings(activeStyle: string): Promise<Settings> {
    const existing = await this.getSettings();
    const [updated] = await db.update(settings)
      .set({ activeStyle })
      .where(eq(settings.id, "main"))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
