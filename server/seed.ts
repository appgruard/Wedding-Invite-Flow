import { db } from "./db";
import { invitations } from "@shared/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

const SEED_GUESTS = [
  { guestName: "Familia Rodriguez Hernández", seats: 4, status: "accepted", confirmedSeats: 3 },
  { guestName: "María Elena Gutierrez", seats: 2, status: "accepted", confirmedSeats: 2 },
  { guestName: "Roberto y Claudia Sánchez", seats: 2, status: "declined", confirmedSeats: 0 },
  { guestName: "Luis Fernando Martínez", seats: 3, status: "pending", confirmedSeats: 0 },
  { guestName: "Patricia Mendoza y Familia", seats: 5, status: "pending", confirmedSeats: 0 },
];

export async function seedDatabase() {
  const existing = await db.select().from(invitations);
  if (existing.length > 0) {
    return;
  }

  console.log("Seeding database with sample invitations...");

  for (const guest of SEED_GUESTS) {
    const [inv] = await db.insert(invitations).values(guest).returning();

    const qrCode = await QRCode.toDataURL(`https://localhost:5000/invitation?id=${inv.id}`, {
      width: 300,
      margin: 2,
      color: { dark: "#1B2A4A", light: "#FFFFFF" },
    });

    await db.update(invitations).set({ qrCode }).where(eq(invitations.id, inv.id));
  }

  console.log(`Seeded ${SEED_GUESTS.length} invitations.`);
}
