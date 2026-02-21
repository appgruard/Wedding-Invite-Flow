import { Pool } from "pg";

export async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const schemaSQL = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS "invitations" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "guest_name" text NOT NULL,
        "seats" integer DEFAULT 2 NOT NULL,
        "confirmed_seats" integer DEFAULT 0,
        "status" text DEFAULT 'pending' NOT NULL,
        "qr_code" text,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "settings" (
        "id" varchar PRIMARY KEY DEFAULT 'main' NOT NULL,
        "active_style" text DEFAULT 'clasico' NOT NULL
      );

      INSERT INTO "settings" ("id", "active_style")
      VALUES ('main', 'clasico')
      ON CONFLICT ("id") DO NOTHING;
    `;

    await pool.query(schemaSQL);
    console.log("Database migrations completed successfully.");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
