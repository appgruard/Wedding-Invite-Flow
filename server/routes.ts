import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import QRCode from "qrcode";
import { seedDatabase } from "./seed";
import { INVITATION_STYLES } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

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

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).authenticated) {
    return next();
  }
  return res.status(401).json({ message: "No autorizado" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "wedding-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: { maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  await seedDatabase();

  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "PSinvitation99";
    if (password === adminPassword) {
      (req.session as any).authenticated = true;
      return res.json({ success: true });
    }
    return res.status(401).json({ message: "Contraseña incorrecta" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/check", (req, res) => {
    res.json({ authenticated: !!(req.session && (req.session as any).authenticated) });
  });

  app.get("/api/settings", async (_req, res) => {
    const s = await storage.getSettings();
    res.json(s);
  });

  app.get("/api/styles", (_req, res) => {
    res.json(INVITATION_STYLES);
  });

  app.patch("/api/settings", requireAuth, async (req, res) => {
    const { activeStyle } = req.body;
    const valid = INVITATION_STYLES.find((s) => s.id === activeStyle);
    if (!valid) {
      return res.status(400).json({ message: "Estilo no valido" });
    }
    const updated = await storage.updateSettings(activeStyle);
    res.json(updated);
  });

  app.get("/api/invitations", requireAuth, async (_req, res) => {
    const all = await storage.getInvitations();
    res.json(all);
  });

  app.get("/api/invitations/:id", async (req, res) => {
    const invitation = await storage.getInvitation(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitacion no encontrada" });
    }
    res.json(invitation);
  });

  app.post("/api/invitations", requireAuth, async (req, res) => {
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
      const withQR = await storage.updateQRCode(invitation.id, qrCode);
      res.status(201).json(withQR || invitation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/invitations/:id", requireAuth, async (req, res) => {
    const { guestName, seats } = req.body;
    const invitation = await storage.updateInvitation(req.params.id, { guestName, seats });
    if (!invitation) {
      return res.status(404).json({ message: "Invitacion no encontrada" });
    }
    res.json(invitation);
  });

  app.delete("/api/invitations/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteInvitation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Invitacion no encontrada" });
    }
    res.json({ success: true });
  });

  app.post("/api/invitations/:id/respond", async (req, res) => {
    const { status, confirmedSeats } = req.body;
    if (!status || !["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Estado invalido" });
    }
    const invitation = await storage.getInvitation(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitacion no encontrada" });
    }
    if (status === "accepted" && (confirmedSeats === undefined || confirmedSeats < 1)) {
      return res.status(400).json({ message: "Debe confirmar al menos 1 asiento" });
    }
    if (status === "accepted" && confirmedSeats > invitation.seats) {
      return res.status(400).json({ message: "No puede confirmar mas asientos de los asignados" });
    }
    const seats = status === "declined" ? 0 : confirmedSeats;
    const updated = await storage.respondInvitation(req.params.id, status, seats);
    if (!updated) {
      return res.status(404).json({ message: "Invitacion no encontrada" });
    }
    res.json(updated);
  });

  return httpServer;
}
