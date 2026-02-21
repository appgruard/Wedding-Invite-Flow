# Wedding Invitation System

## Overview
A complete wedding invitation management system with an animated invitation page, admin panel, and multiple selectable invitation styles protected by password authentication.

## Pages
- `/` or `/invitation` - Wedding invitation page (add `?id=INVITATION_ID` for personalized RSVP)
- `/confirm` - QR code validation page showing guest confirmation data
- `/admin` - Admin panel for managing invitations (password protected)
- `/estilos` - Invitation style selector panel (password protected)
- `/login` - Login page (password: stored in ADMIN_PASSWORD env var)

## Features
- **Curtain reveal animation** on invitation intro
- **Full wedding info**: ceremony, reception, dress code, color palette, gift registry, envelope rain, countdown
- **RSVP system** with seat confirmation
- **QR code generation** for each invitation (points to `/confirm` page)
- **Admin panel**: CRUD invitations, track RSVPs, filter/search, PDF export
- **5 invitation styles**: clasico, romantico, moderno, rustico, jardin
- **Style selector panel**: Choose active style from exclusive panel
- **Password protection**: Session-based auth for admin and style panels
- **Seed data**: 5 sample invitations with various statuses

## Authentication
- Password: Stored in `ADMIN_PASSWORD` environment variable
- Session-based using express-session with MemoryStore
- Both `/admin` and `/estilos` require authentication
- Login redirects back to the intended page via `returnTo` query param

## Invitation Styles
- **Clasico Elegante**: Gold, burgundy, cream (default)
- **Romantico Rosa**: Pink, rose, lavender
- **Moderno Minimal**: Black, white, gold accents
- **Rustico Natural**: Earth tones, olive, sienna
- **Jardin Botanico**: Greens, lavender, coral

## Tech Stack
- Frontend: React, TanStack Query, Framer Motion, Shadcn UI, Tailwind CSS, wouter
- Backend: Express, Drizzle ORM, PostgreSQL, express-session
- Extras: jspdf + jspdf-autotable (PDF), qrcode (QR generation)

## Database Tables
- `invitations` - Guest invitations with RSVP status, seats, QR codes
- `settings` - App settings including active invitation style

## Customization
- Couple names/details: Edit `client/src/pages/invitation.tsx`
- Images: Replace files in `client/public/images/` (couple.png, church.png, venue.png, pattern-bg.png)
- Colors/theme: Change style via `/estilos` panel or edit styles in `shared/schema.ts`
- Wedding date: Edit countdown target in `invitation.tsx`

## API Routes
- `POST /api/auth/login` - Login (body: { password })
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status
- `GET /api/settings` - Get current settings (public)
- `PATCH /api/settings` - Update settings (auth required)
- `GET /api/styles` - List available styles (public)
- `GET /api/invitations` - List all (auth required)
- `GET /api/invitations/:id` - Get one (public for RSVP)
- `POST /api/invitations` - Create (auth required)
- `PATCH /api/invitations/:id` - Update (auth required)
- `DELETE /api/invitations/:id` - Delete (auth required)
- `POST /api/invitations/:id/respond` - RSVP (public)
