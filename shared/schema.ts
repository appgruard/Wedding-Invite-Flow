import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const weddings = sqliteTable("weddings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  coupleName: text("couple_name").notNull().default("Ana María & Carlos Eduardo"),
  weddingDate: text("wedding_date").notNull().default("15 de marzo de 2026"),
  venueName: text("venue_name").default("Salón Gran Fiesta"),
  venueAddress: text("venue_address").default("Av. Insurgentes Sur 1234, CDMX"),
  venueTime: text("venue_time").default("20:00 hrs"),
  churchName: text("church_name").default("Parroquia de Santa María"),
  churchAddress: text("church_address").default("Calle Iglesia 45, CDMX"),
  churchTime: text("church_time").default("18:00 hrs"),
  dressCode: text("dress_code").default("Formal / Etiqueta"),
  allowedColors: text("allowed_colors").default("[]"),
  message: text("message").default(""),
  giftUrl1: text("gift_url_1").default("https://www.liverpool.com.mx"),
  giftLabel1: text("gift_label_1").default("Liverpool"),
  giftUrl2: text("gift_url_2").default("https://www.amazon.com.mx"),
  giftLabel2: text("gift_label_2").default("Amazon"),
  couplePhotoUrl: text("couple_photo_url").default("/images/couple.png"),
  template: text("template").notNull().default("clasico"),
  colorStyleId: text("color_style_id").notNull().default("clasico"),
  videoUrl: text("video_url").default(""),
  videoType: text("video_type").notNull().default("none"),
  introDuration: integer("intro_duration").notNull().default(4000),
  tvVideoUrl: text("tv_video_url").default("https://youtu.be/BboMpayJomw?t=25"),
  tvVideoType: text("tv_video_type").notNull().default("youtube"),
  musicUrl: text("music_url").default("https://youtu.be/WyrZYGmoaFM"),
  musicType: text("music_type").notNull().default("youtube"),
  clientUsername: text("client_username").default(""),
  clientPassword: text("client_password").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertWeddingSchema = createInsertSchema(weddings).omit({
  id: true,
  createdAt: true,
});

export type InsertWedding = z.infer<typeof insertWeddingSchema>;
export type Wedding = typeof weddings.$inferSelect;

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  weddingId: text("wedding_id").references(() => weddings.id, { onDelete: "cascade" }),
  guestName: text("guest_name").notNull(),
  seats: integer("seats").notNull().default(2),
  confirmedSeats: integer("confirmed_seats").default(0),
  status: text("status").notNull().default("pending"),
  qrCode: text("qr_code"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  qrCode: true,
  createdAt: true,
});

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().default("main"),
  activeStyle: text("active_style").notNull().default("clasico"),
});

export type Settings = typeof settings.$inferSelect;

export const INVITATION_STYLES = [
  {
    id: "clasico",
    name: "Clasico Elegante",
    description: "Tonos dorados, borgoña y crema con tipografia serif clasica",
    preview: { bg: "#FDF8F0", primary: "#800020", accent: "#C9A96E", text: "#5C4033" },
  },
  {
    id: "romantico",
    name: "Romantico Rosa",
    description: "Rosa empolvado, lavanda y detalles plateados con estilo suave y delicado",
    preview: { bg: "#FFF5F7", primary: "#C2185B", accent: "#E8B4CB", text: "#6D4C5E" },
  },
  {
    id: "moderno",
    name: "Moderno Minimal",
    description: "Blanco y negro con acentos dorados, lineas limpias y minimalistas",
    preview: { bg: "#FAFAFA", primary: "#1A1A1A", accent: "#B8860B", text: "#333333" },
  },
  {
    id: "rustico",
    name: "Rustico Natural",
    description: "Tonos tierra, verde olivo y siena con textura artesanal y calida",
    preview: { bg: "#FAF5EF", primary: "#6B4226", accent: "#8B7D3C", text: "#5D4E37" },
  },
  {
    id: "jardin",
    name: "Jardin Botanico",
    description: "Verdes vibrantes, lavanda y toques de coral con inspiracion floral",
    preview: { bg: "#F5FAF5", primary: "#2E7D32", accent: "#7CB342", text: "#3E5641" },
  },
] as const;

export type InvitationStyleId = typeof INVITATION_STYLES[number]["id"];

export const TEMPLATES = [
  {
    id: "clasico",
    name: "Clásico Elegante",
    description: "Cortinas de teatro con colores personalizables y tipografía serif",
    thumbnail: "🎭",
  },
  {
    id: "netflix",
    name: "Netflix",
    description: "Intro estilo Netflix con fondo negro y animación del logo",
    thumbnail: "🎬",
  },
  {
    id: "nineties",
    name: "Años 90",
    description: "Estilo retro con tostadoras voladoras y estética vintage",
    thumbnail: "💾",
  },
  {
    id: "galaxia",
    name: "Galaxia Celestial",
    description: "Cielo estrellado con cristales de luz y paneles de cristal flotantes",
    thumbnail: "✨",
  },
  {
    id: "jardin",
    name: "Jardín Encantado",
    description: "Acuarelas botánicas con marcos de enredaderas y pétalos flotantes",
    thumbnail: "🌿",
  },
] as const;

export type TemplateId = typeof TEMPLATES[number]["id"];
