import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guestName: text("guest_name").notNull(),
  seats: integer("seats").notNull().default(2),
  confirmedSeats: integer("confirmed_seats").default(0),
  status: text("status").notNull().default("pending"),
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

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default("main"),
  activeStyle: text("active_style").notNull().default("clasico"),
});

export type Settings = typeof settings.$inferSelect;

export const INVITATION_STYLES = [
  {
    id: "clasico",
    name: "Clasico Elegante",
    description: "Tonos dorados, borgoña y crema con tipografia serif clasica",
    preview: {
      bg: "#FDF8F0",
      primary: "#800020",
      accent: "#C9A96E",
      text: "#5C4033",
    },
  },
  {
    id: "romantico",
    name: "Romantico Rosa",
    description: "Rosa empolvado, lavanda y detalles plateados con estilo suave y delicado",
    preview: {
      bg: "#FFF5F7",
      primary: "#C2185B",
      accent: "#E8B4CB",
      text: "#6D4C5E",
    },
  },
  {
    id: "moderno",
    name: "Moderno Minimal",
    description: "Blanco y negro con acentos dorados, lineas limpias y minimalistas",
    preview: {
      bg: "#FAFAFA",
      primary: "#1A1A1A",
      accent: "#B8860B",
      text: "#333333",
    },
  },
  {
    id: "rustico",
    name: "Rustico Natural",
    description: "Tonos tierra, verde olivo y siena con textura artesanal y calida",
    preview: {
      bg: "#FAF5EF",
      primary: "#6B4226",
      accent: "#8B7D3C",
      text: "#5D4E37",
    },
  },
  {
    id: "jardin",
    name: "Jardin Botanico",
    description: "Verdes vibrantes, lavanda y toques de coral con inspiracion floral",
    preview: {
      bg: "#F5FAF5",
      primary: "#2E7D32",
      accent: "#7CB342",
      text: "#3E5641",
    },
  },
] as const;

export type InvitationStyleId = typeof INVITATION_STYLES[number]["id"];
