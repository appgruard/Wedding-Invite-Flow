# Wedding Invitation System

## Overview
A multi-wedding invitation management system with animated invitation pages (3 templates), admin panel for full customization, RSVP tracking, and video intro support.

## Pages
- `/` or `/invitation` - Wedding invitation page (add `?id=INVITATION_ID` for personalized RSVP). Routes to the correct template based on wedding settings.
- `/confirm` - QR code validation page showing guest confirmation data
- `/admin` - Admin panel for managing weddings and invitations. Has inline login (password: `ADMIN_PASSWORD` env var). Full control.
- `/login` - **Client login** (password: `CLIENT_PASSWORD` env var). Redirects to `/client` after auth.
- `/client` - **Client panel**: create invitations for existing weddings only. Cannot edit weddings, templates, or settings.
- `/estilos` - Invitation style selector panel (password protected)

## Features
- **3 invitation templates**: Clásico (curtain reveal), Netflix (N logo animation), 90s (Flying Toasters / Windows 95)
- **Multi-wedding management**: Create/edit/delete multiple wedding events from the admin panel
- **Per-wedding customization**: couple names, dates, venues, church, photos, messages, gift registries
- **Video intro support**: YouTube link or MP4 upload, configurable duration
- **Full wedding info**: ceremony, reception, dress code, gift registry, envelope rain, countdown
- **RSVP system** with seat confirmation
- **QR code generation** for each invitation (points to `/confirm` page)
- **Admin panel**: Wedding CRUD + Invitation CRUD per wedding, track RSVPs, filter/search, PDF export
- **5 color styles** for Clásico template: clasico, romantico, moderno, rustico, jardin
- **Password protection**: Session-based auth for admin panel

## Templates
- **Clásico** (`clasico`): Theater curtain reveal animation + elegant wedding invitation layout. Color scheme customizable from 5 options.
- **Netflix** (`netflix`): Netflix "N" logo animation intro + dark themed invitation styled like Netflix UI.
- **90s** (`nineties`): Flying Toasters screensaver intro + Windows 95/98 aesthetic invitation with dialog boxes.

## Video Intro (all templates)
- All 3 templates support video intro; configured in the admin "Video" tab
- `videoType = "none"`: Template's native CSS animation plays (curtains / Netflix N / Flying Toasters)
- `videoType = "youtube"`: YouTube embed plays fullscreen before the invitation content
- `videoType = "mp4"`: Uploaded MP4 plays fullscreen before the invitation content
- `introDuration`: Controls how long the intro plays (1–10 seconds)
- For the 90s template, video plays **inside the TV screen** in the intro
- Countdown timer in Clásico template parses the Spanish wedding date string (e.g. "15 de marzo de 2026")

## Authentication
- **Admin** (`/admin`): Uses `ADMIN_PASSWORD` env var. Inline login form directly in the admin page. Full CRUD on weddings + invitations.
- **Client** (`/login` → `/client`): Uses `CLIENT_PASSWORD` env var. Can only create invitations for existing weddings. Cannot manage weddings or change templates.
- Session-based using express-session with MemoryStore (24h)
- `requireAuth` = admin only, `requireAnyAuth` = admin or client, `requireClientAuth` = client only

## Database Tables
- `weddings` - Wedding event metadata (names, dates, venues, template, video, photos, gifts, etc.)
- `invitations` - Guest invitations with weddingId FK, RSVP status, seats, QR codes
- `settings` - App settings including active invitation style

## Tech Stack
- Frontend: React, TanStack Query, Framer Motion, Shadcn UI, Tailwind CSS, wouter
- Backend: Express, Drizzle ORM, **SQLite (better-sqlite3)**, express-session, multer (file uploads)
- Extras: jspdf + jspdf-autotable (PDF), qrcode (QR generation)

## Database (SQLite)
- No external DB dependency — SQLite file at `data/db.sqlite` (development) or `/data/db.sqlite` (production)
- WAL mode enabled for concurrent reads
- Path controlled by `DB_PATH` env var
- Uploads path controlled by `UPLOADS_DIR` env var (default: `public/uploads`)

## CapRover Deployment
- **`Dockerfile`** — multi-stage build: builds Vite frontend + bundles server, then installs production deps
- **`captain-definition`** — `{ "schemaVersion": 2, "dockerfilePath": "./Dockerfile" }`
- **Persistent volume**: Mount `/data` in CapRover to persist DB + uploads between deployments
- **Environment variables to set in CapRover**:
  - `ADMIN_PASSWORD` — admin panel password (for `/admin`)
  - `CLIENT_PASSWORD` — client portal password (for `/login` → `/client`)
  - `SESSION_SECRET` — session secret (any random string)
  - `DB_PATH=/data/db.sqlite` — SQLite file location
  - `UPLOADS_DIR=/data/uploads` — uploaded files location
  - `PORT=80` — already set in Dockerfile

## API Routes
- `POST /api/auth/login` - Login (body: { password })
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status
- `GET /api/settings` - Get current settings (public)
- `PATCH /api/settings` - Update settings (auth required)
- `GET /api/styles` - List available color styles (public)
- `GET /api/weddings` - List all weddings (auth required)
- `GET /api/weddings/:id` - Get one wedding (public)
- `POST /api/weddings` - Create wedding (auth required)
- `PATCH /api/weddings/:id` - Update wedding (auth required)
- `DELETE /api/weddings/:id` - Delete wedding (auth required)
- `POST /api/upload` - Upload image/video file (auth required, returns { url })
- `GET /api/invitations` - List all invitations (auth required)
- `GET /api/invitations/wedding/:weddingId` - Invitations for a wedding (auth required)
- `GET /api/invitations/:id` - Get one invitation with wedding data (public)
- `POST /api/invitations` - Create (auth required)
- `PATCH /api/invitations/:id` - Update (auth required)
- `DELETE /api/invitations/:id` - Delete (auth required)
- `POST /api/invitations/:id/respond` - RSVP (public)

## File Structure (key files)
- `shared/schema.ts` - DB schema (weddings, invitations, settings) + INVITATION_STYLES + TEMPLATES constants
- `server/storage.ts` - Database storage interface and implementation
- `server/routes.ts` - Express API routes including wedding CRUD + file upload
- `client/src/pages/invitation.tsx` - Main invitation router (routes to correct template based on wedding.template)
- `client/src/pages/netflix-invitation.tsx` - Netflix-themed template
- `client/src/pages/nineties-invitation.tsx` - 90s Windows-themed template
- `client/src/pages/admin.tsx` - Admin panel with wedding + invitation management
