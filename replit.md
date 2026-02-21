# Wedding Invitation System

## Overview
A complete wedding invitation management system with an animated invitation page and admin panel.

## Pages
- `/` or `/invitation` - Wedding invitation page (add `?id=INVITATION_ID` for personalized RSVP)
- `/admin` - Admin panel for managing invitations

## Features
- **Curtain reveal animation** on invitation intro
- **Full wedding info**: ceremony, reception, dress code, color palette, gift registry, envelope rain, countdown
- **RSVP system** with seat confirmation
- **QR code generation** for each invitation
- **Admin panel**: CRUD invitations, track RSVPs, filter/search, PDF export
- **Seed data**: 5 sample invitations with various statuses

## Tech Stack
- Frontend: React, TanStack Query, Framer Motion, Shadcn UI, Tailwind CSS
- Backend: Express, Drizzle ORM, PostgreSQL
- Extras: jspdf + jspdf-autotable (PDF), qrcode (QR generation)

## Customization
- Couple names/details: Edit `client/src/pages/invitation.tsx`
- Images: Replace files in `client/public/images/` (couple.png, church.png, venue.png, floral-frame.png, pattern-bg.png)
- Colors/theme: Edit `client/src/index.css` CSS variables
- Wedding date: Edit countdown target in `invitation.tsx` (line ~66)

## API Routes
- `GET /api/invitations` - List all
- `GET /api/invitations/:id` - Get one
- `POST /api/invitations` - Create (body: { guestName, seats })
- `PATCH /api/invitations/:id` - Update
- `DELETE /api/invitations/:id` - Delete
- `POST /api/invitations/:id/respond` - RSVP (body: { status, confirmedSeats })
