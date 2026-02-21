# Overview

This is a **wedding invitation management system** (for "Ana Maria & Carlos Eduardo") built as a full-stack TypeScript application. It has two main interfaces:

1. **Guest-facing invitation page** — A beautifully styled wedding invitation that guests access via a unique URL (with QR code support). Guests can view event details and RSVP (confirm/decline attendance with seat count).
2. **Admin dashboard** — An admin panel at `/admin` for managing invitations, viewing RSVP statuses, creating new invitations with QR codes, and exporting data to PDF.

The app is in Spanish, targeting a Latin American wedding audience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (warm gold/earth tones wedding palette)
- **Animations**: Framer Motion for invitation page transitions
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Build tool**: Vite with React plugin
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via `tsx`
- **API pattern**: REST API with all endpoints under `/api/`
- **Key endpoints**:
  - `GET /api/invitations` — List all invitations
  - `GET /api/invitations/:id` — Get single invitation
  - `POST /api/invitations` — Create invitation
  - `PATCH /api/invitations/:id` — Update invitation
  - `DELETE /api/invitations/:id` — Delete invitation
  - `POST /api/invitations/:id/respond` — Guest RSVP response
  - `GET /api/invitations/:id/qr` — Generate/get QR code
- **QR Code generation**: `qrcode` library generates data URLs embedded in invitation records
- **PDF export**: `jspdf` + `jspdf-autotable` on the client side for admin reports

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema location**: `shared/schema.ts` — single `invitations` table
- **Schema**: The `invitations` table has: `id` (UUID, auto-generated), `guestName`, `seats`, `confirmedSeats`, `status` (pending/accepted/declined), `qrCode` (base64 data URL), `createdAt`
- **Migrations**: Drizzle Kit with `db:push` command for schema sync
- **Seeding**: `server/seed.ts` auto-seeds 5 sample invitations on first run (if table is empty)

### Development vs Production
- **Development**: Vite dev server runs as middleware on the Express server with HMR (`server/vite.ts`)
- **Production**: Client is built to `dist/public/`, server is bundled with esbuild to `dist/index.cjs` (`script/build.ts`)
- **Dev command**: `npm run dev` (uses tsx to run server/index.ts)
- **Build command**: `npm run build` (builds both client and server)
- **Start command**: `npm start` (runs production bundle)

### Project Structure
```
client/               # Frontend React app
  src/
    components/ui/    # shadcn/ui components
    pages/            # Route pages (invitation, admin, not-found)
    hooks/            # Custom React hooks
    lib/              # Utilities (queryClient, cn helper)
server/               # Backend Express app
  index.ts            # Entry point, Express setup
  routes.ts           # API route definitions
  storage.ts          # Database access layer (IStorage interface + DatabaseStorage)
  db.ts               # Drizzle + pg Pool setup
  seed.ts             # Database seeder
  vite.ts             # Vite dev middleware
  static.ts           # Production static file serving
shared/               # Shared between client and server
  schema.ts           # Drizzle schema + Zod types
migrations/           # Drizzle migration files
```

### Storage Pattern
The storage layer uses an interface (`IStorage`) with a concrete `DatabaseStorage` implementation. This allows for potential swapping of storage backends. The exported `storage` singleton is used across route handlers.

## External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` environment variable. Uses `pg` (node-postgres) driver with connection pooling.
- **QR Code generation** — `qrcode` npm package for generating QR code data URLs server-side
- **Google Fonts** — Loaded via CDN for wedding-themed typography (Playfair Display, Lora, etc.)
- **Replit plugins** — `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` for development on Replit
- **connect-pg-simple** — PostgreSQL session store (available but may not be actively used for sessions yet)
- **jsPDF** — Client-side PDF generation for admin export functionality