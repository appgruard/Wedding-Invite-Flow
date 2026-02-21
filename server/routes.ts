import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import QRCode from "qrcode";
import { seedDatabase } from "./seed";

async function generateQRCode(invitationId: string, baseUrl: string): Promise<string> {
  const url = `${baseUrl}/confirm?id=${invitationId}`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: "#1B2A4A",
      light: "#FFFFFF",
    },
  });
  return qrDataUrl;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  await seedDatabase();

  app.get("/api/invitations", async (_req, res) => {
    const all = await storage.getInvitations();
    res.json(all);
  });

  app.get("/api/invitations/:id", async (req, res) => {
    const invitation = await storage.getInvitation(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }
    res.json(invitation);
  });

  app.post("/api/invitations", async (req, res) => {
    try {
      const { guestName, seats, confirmedSeats, status } = req.body;
      if (!guestName) {
        return res.status(400).json({ message: "El nombre del invitado es requerido" });
      }
      const invitation = await storage.createInvitation({
        guestName,
        seats: seats || 2,
        confirmedSeats: confirmedSeats || 0,
        status: status || "pending",
      });

      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["host"] || "localhost:5000";
      const baseUrl = `${protocol}://${host}`;
      const qrCode = await generateQRCode(invitation.id, baseUrl);

      const updated = await storage.updateInvitation(invitation.id, {} as any);
      if (updated) {
        const withQR = await storage.updateQRCode(invitation.id, qrCode);
        res.status(201).json(withQR || invitation);
      } else {
        res.status(201).json(invitation);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/invitations/:id", async (req, res) => {
    const { guestName, seats } = req.body;
    const invitation = await storage.updateInvitation(req.params.id, { guestName, seats });
    if (!invitation) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }
    res.json(invitation);
  });

  app.delete("/api/invitations/:id", async (req, res) => {
    const deleted = await storage.deleteInvitation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }
    res.json({ success: true });
  });

  app.post("/api/invitations/:id/respond", async (req, res) => {
    const { status, confirmedSeats } = req.body;
    if (!status || !["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }
    const invitation = await storage.getInvitation(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }
    if (status === "accepted" && (confirmedSeats === undefined || confirmedSeats < 1)) {
      return res.status(400).json({ message: "Debe confirmar al menos 1 asiento" });
    }
    if (status === "accepted" && confirmedSeats > invitation.seats) {
      return res.status(400).json({ message: "No puede confirmar más asientos de los asignados" });
    }
    const seats = status === "declined" ? 0 : confirmedSeats;
    const updated = await storage.respondInvitation(req.params.id, status, seats);
    if (!updated) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }
    res.json(updated);
  });

  return httpServer;
}
