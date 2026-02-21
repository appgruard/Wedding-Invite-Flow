import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guestName: text("guest_name").notNull(),
  seats: integer("seats").notNull().default(2),
  confirmedSeats: integer("confirmed_seats").default(0),
  status: text("status").notNull().default("pending"), // pending, accepted, declined
  qrCode: text("qr_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  qrCode: true,
  createdAt: true,
});

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;
