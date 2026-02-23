# Wedding Invitation System

## Overview
A multi-wedding invitation management system with animated invitation pages (3 templates), admin panel for full customization, RSVP tracking, and video intro support.

## Pages
- `/` or `/invitation` - Wedding invitation page (add `?id=INVITATION_ID` for personalized RSVP). Routes to the correct template based on wedding settings.
- `/confirm` - QR code validation page showing guest confirmation data
- `/admin` - Admin panel for managing weddings and invitations (password protected)
- `/estilos` - Invitation style selector panel (password protected)
- `/login` - Login page (password: stored in ADMIN_PASSWORD env var)

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

## Video Intro (per template)
- `videoType = "none"`: Uses the template's built-in CSS animation
- `videoType = "youtube"`: YouTube embed plays fullscreen for `introDuration` ms then invitation appears
- `videoType = "mp4"`: Uploaded MP4 plays fullscreen for `introDuration` ms then invitation appears

## Authentication
- Password: Stored in `ADMIN_PASSWORD` environment variable
- Session-based using express-session with MemoryStore
- Login redirects back to the intended page via `returnTo` query param

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
  - `ADMIN_PASSWORD` — admin panel password
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
