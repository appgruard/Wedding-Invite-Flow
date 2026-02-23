import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import multer from "multer";
import { storage } from "./storage";
import QRCode from "qrcode";
import { seedDatabase } from "./seed";
import { INVITATION_STYLES, TEMPLATES } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

const uploadsDir = path.resolve("public/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];
    cb(null, allowed.includes(file.mimetype));
  },
});

async function generateQRCode(invitationId: string, baseUrl: string): Promise<string> {
  const url = `${baseUrl}/confirm?id=${invitationId}`;
  return await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: "#1B2A4A", light: "#FFFFFF" },
  });
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).authenticated) return next();
  return res.status(401).json({ message: "No autorizado" });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "wedding-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: { maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  app.use("/uploads", (req, res, next) => {
    const filePath = path.resolve(uploadsDir, req.path.replace(/^\//, ""));
    if (fs.existsSync(filePath)) return res.sendFile(filePath);
    next();
  });

  await seedDatabase();

  // ── Auth ────────────────────────────────────────────────────────────────────
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
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get("/api/auth/check", (req, res) => {
    res.json({ authenticated: !!(req.session && (req.session as any).authenticated) });
  });

  // ── File Upload ──────────────────────────────────────────────────────────────
  app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No se recibió archivo" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, mimetype: req.file.mimetype });
  });

  // ── Settings + Styles + Templates ───────────────────────────────────────────
  app.get("/api/settings", async (_req, res) => {
    res.json(await storage.getSettings());
  });

  app.get("/api/styles", (_req, res) => res.json(INVITATION_STYLES));
  app.get("/api/templates", (_req, res) => res.json(TEMPLATES));

  app.patch("/api/settings", requireAuth, async (req, res) => {
    const { activeStyle } = req.body;
    if (!INVITATION_STYLES.find((s) => s.id === activeStyle)) {
      return res.status(400).json({ message: "Estilo no valido" });
    }
    res.json(await storage.updateSettings(activeStyle));
  });

  // ── Weddings ────────────────────────────────────────────────────────────────
  app.get("/api/weddings", requireAuth, async (_req, res) => {
    const all = await storage.getWeddings();
    res.json(all);
  });

  app.get("/api/weddings/:id", async (req, res) => {
    const wedding = await storage.getWedding(req.params.id);
    if (!wedding) return res.status(404).json({ message: "Boda no encontrada" });
    res.json(wedding);
  });

  app.post("/api/weddings", requireAuth, async (req, res) => {
    try {
      const wedding = await storage.createWedding(req.body);
      res.status(201).json(wedding);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/weddings/:id", requireAuth, async (req, res) => {
    const wedding = await storage.updateWedding(String(req.params.id), req.body);
    if (!wedding) return res.status(404).json({ message: "Boda no encontrada" });
    res.json(wedding);
  });

  app.delete("/api/weddings/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteWedding(String(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Boda no encontrada" });
    res.json({ success: true });
  });

  // ── Invitations ──────────────────────────────────────────────────────────────
  app.get("/api/invitations", requireAuth, async (_req, res) => {
    res.json(await storage.getInvitations());
  });

  app.get("/api/invitations/wedding/:weddingId", requireAuth, async (req, res) => {
    res.json(await storage.getInvitationsByWedding(String(req.params.weddingId)));
  });

  app.get("/api/invitations/:id", async (req, res) => {
    const invitation = await storage.getInvitation(req.params.id);
    if (!invitation) return res.status(404).json({ message: "Invitacion no encontrada" });
    let wedding = null;
    if (invitation.weddingId) wedding = await storage.getWedding(invitation.weddingId);
    res.json({ ...invitation, wedding });
  });

  app.post("/api/invitations", requireAuth, async (req, res) => {
    try {
      const { guestName, seats, confirmedSeats, status, weddingId } = req.body;
      if (!guestName) return res.status(400).json({ message: "El nombre del invitado es requerido" });
      const invitation = await storage.createInvitation({
        guestName,
        seats: seats || 2,
        confirmedSeats: confirmedSeats || 0,
        status: status || "pending",
        weddingId: weddingId || null,
      });
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["host"] || "localhost:5000";
      const qrCode = await generateQRCode(invitation.id, `${protocol}://${host}`);
      const withQR = await storage.updateQRCode(invitation.id, qrCode);
      res.status(201).json(withQR || invitation);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/invitations/:id", requireAuth, async (req, res) => {
    const { guestName, seats, weddingId } = req.body;
    const invitation = await storage.updateInvitation(String(req.params.id), { guestName, seats, weddingId });
    if (!invitation) return res.status(404).json({ message: "Invitacion no encontrada" });
    res.json(invitation);
  });

  app.delete("/api/invitations/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteInvitation(String(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Invitacion no encontrada" });
    res.json({ success: true });
  });

  app.post("/api/invitations/:id/respond", async (req, res) => {
    const { status, confirmedSeats } = req.body;
    if (!status || !["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Estado invalido" });
    }
    const invitation = await storage.getInvitation(req.params.id);
    if (!invitation) return res.status(404).json({ message: "Invitacion no encontrada" });
    if (status === "accepted" && (confirmedSeats === undefined || confirmedSeats < 1)) {
      return res.status(400).json({ message: "Debe confirmar al menos 1 asiento" });
    }
    if (status === "accepted" && confirmedSeats > invitation.seats) {
      return res.status(400).json({ message: "No puede confirmar mas asientos de los asignados" });
    }
    const seats = status === "declined" ? 0 : confirmedSeats;
    const updated = await storage.respondInvitation(req.params.id, status, seats);
    if (!updated) return res.status(404).json({ message: "Invitacion no encontrada" });
    res.json(updated);
  });

  return httpServer;
}
