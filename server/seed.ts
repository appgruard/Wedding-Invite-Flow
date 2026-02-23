import { db } from "./db";
import { invitations, weddings } from "@shared/schema";
import { eq, isNull } from "drizzle-orm";
import QRCode from "qrcode";

const SEED_GUESTS = [
  { guestName: "Familia Rodriguez Hernandez", seats: 4, status: "accepted", confirmedSeats: 3 },
  { guestName: "Maria Elena Gutierrez", seats: 2, status: "accepted", confirmedSeats: 2 },
  { guestName: "Roberto y Claudia Sanchez", seats: 2, status: "declined", confirmedSeats: 0 },
  { guestName: "Luis Fernando Martinez", seats: 3, status: "pending", confirmedSeats: 0 },
  { guestName: "Patricia Mendoza y Familia", seats: 5, status: "pending", confirmedSeats: 0 },
];

export async function seedDatabase() {
  const existingWeddings = await db.select().from(weddings);
  let defaultWeddingId: string;

  if (existingWeddings.length === 0) {
    console.log("Seeding default wedding...");
    const [defaultWedding] = await db.insert(weddings).values({
      coupleName: "Ana María & Carlos Eduardo",
      weddingDate: "15 de marzo de 2026",
      venueName: "Salón Gran Fiesta",
      venueAddress: "Av. Insurgentes Sur 1234, CDMX",
      venueTime: "20:00 hrs",
      churchName: "Parroquia de Santa María",
      churchAddress: "Calle Iglesia 45, CDMX",
      churchTime: "18:00 hrs",
      dressCode: "Formal / Etiqueta",
      message: "",
      giftUrl1: "https://www.liverpool.com.mx",
      giftLabel1: "Liverpool",
      giftUrl2: "https://www.amazon.com.mx",
      giftLabel2: "Amazon",
      couplePhotoUrl: "/images/couple.png",
      template: "clasico",
      colorStyleId: "clasico",
      videoUrl: "",
      videoType: "none",
      introDuration: 4000,
    }).returning();
    defaultWeddingId = defaultWedding.id;
    console.log("Default wedding created.");
  } else {
    defaultWeddingId = existingWeddings[0].id;
  }

  const existing = await db.select().from(invitations);

  if (existing.length === 0) {
    console.log("Seeding database with sample invitations...");
    for (const guest of SEED_GUESTS) {
      const [inv] = await db.insert(invitations).values({ ...guest, weddingId: defaultWeddingId }).returning();
      const qrCode = await QRCode.toDataURL(`https://localhost:5000/confirm?id=${inv.id}`, {
        width: 300, margin: 2,
        color: { dark: "#1B2A4A", light: "#FFFFFF" },
      });
      await db.update(invitations).set({ qrCode }).where(eq(invitations.id, inv.id));
    }
    console.log(`Seeded ${SEED_GUESTS.length} invitations.`);
  }

  await db.update(invitations).set({ weddingId: defaultWeddingId }).where(isNull(invitations.weddingId));

  const withoutQR = await db.select().from(invitations).where(isNull(invitations.qrCode));
  if (withoutQR.length > 0) {
    for (const inv of withoutQR) {
      const qrCode = await QRCode.toDataURL(`https://localhost:5000/confirm?id=${inv.id}`, {
        width: 300, margin: 2,
        color: { dark: "#1B2A4A", light: "#FFFFFF" },
      });
      await db.update(invitations).set({ qrCode }).where(eq(invitations.id, inv.id));
    }
  }
}
