-- Wedding Invitation System - Complete Database Schema
-- Run this file to create all tables in a fresh PostgreSQL database
-- Compatible with PostgreSQL 12+

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

-- Insert default settings row if not exists
INSERT INTO "settings" ("id", "active_style")
VALUES ('main', 'clasico')
ON CONFLICT ("id") DO NOTHING;
