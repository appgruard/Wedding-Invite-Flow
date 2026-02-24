import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export async function runMigrations() {
  const dbPath = process.env.DB_PATH || path.resolve("data/db.sqlite");
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = OFF");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "weddings" (
      "id"              TEXT PRIMARY KEY,
      "couple_name"     TEXT NOT NULL DEFAULT 'Ana María & Carlos Eduardo',
      "wedding_date"    TEXT NOT NULL DEFAULT '15 de marzo de 2026',
      "venue_name"      TEXT DEFAULT 'Salón Gran Fiesta',
      "venue_address"   TEXT DEFAULT 'Av. Insurgentes Sur 1234, CDMX',
      "venue_time"      TEXT DEFAULT '20:00 hrs',
      "church_name"     TEXT DEFAULT 'Parroquia de Santa María',
      "church_address"  TEXT DEFAULT 'Calle Iglesia 45, CDMX',
      "church_time"     TEXT DEFAULT '18:00 hrs',
      "dress_code"      TEXT DEFAULT 'Formal / Etiqueta',
      "message"         TEXT DEFAULT '',
      "gift_url_1"      TEXT DEFAULT 'https://www.liverpool.com.mx',
      "gift_label_1"    TEXT DEFAULT 'Liverpool',
      "gift_url_2"      TEXT DEFAULT 'https://www.amazon.com.mx',
      "gift_label_2"    TEXT DEFAULT 'Amazon',
      "couple_photo_url" TEXT DEFAULT '/images/couple.png',
      "template"        TEXT NOT NULL DEFAULT 'clasico',
      "color_style_id"  TEXT NOT NULL DEFAULT 'clasico',
      "video_url"       TEXT DEFAULT '',
      "video_type"      TEXT NOT NULL DEFAULT 'none',
      "intro_duration"  INTEGER NOT NULL DEFAULT 4000,
      "created_at"      INTEGER
    );

    CREATE TABLE IF NOT EXISTS "invitations" (
      "id"               TEXT PRIMARY KEY,
      "wedding_id"       TEXT REFERENCES "weddings"("id") ON DELETE CASCADE,
      "guest_name"       TEXT NOT NULL,
      "seats"            INTEGER NOT NULL DEFAULT 2,
      "confirmed_seats"  INTEGER DEFAULT 0,
      "status"           TEXT NOT NULL DEFAULT 'pending',
      "qr_code"          TEXT,
      "created_at"       INTEGER
    );

    CREATE TABLE IF NOT EXISTS "settings" (
      "id"           TEXT PRIMARY KEY DEFAULT 'main',
      "active_style" TEXT NOT NULL DEFAULT 'clasico'
    );

    INSERT OR IGNORE INTO "settings" ("id", "active_style") VALUES ('main', 'clasico');
  `);

  const weddingCols = sqlite.pragma("table_info(weddings)") as { name: string }[];
  const weddingColNames = weddingCols.map((c) => c.name);
  if (!weddingColNames.includes("music_url")) {
    sqlite.exec(`ALTER TABLE "weddings" ADD COLUMN "music_url" TEXT DEFAULT ''`);
  }
  if (!weddingColNames.includes("music_type")) {
    sqlite.exec(`ALTER TABLE "weddings" ADD COLUMN "music_type" TEXT NOT NULL DEFAULT 'none'`);
  }
  if (!weddingColNames.includes("client_username")) {
    sqlite.exec(`ALTER TABLE "weddings" ADD COLUMN "client_username" TEXT DEFAULT ''`);
  }
  if (!weddingColNames.includes("client_password")) {
    sqlite.exec(`ALTER TABLE "weddings" ADD COLUMN "client_password" TEXT DEFAULT ''`);
  }

  sqlite.pragma("foreign_keys = ON");
  sqlite.close();

  console.log("Database migrations completed successfully.");
}
