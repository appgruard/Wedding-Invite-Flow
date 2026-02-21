CREATE TABLE "invitations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_name" text NOT NULL,
	"seats" integer DEFAULT 2 NOT NULL,
	"confirmed_seats" integer DEFAULT 0,
	"status" text DEFAULT 'pending' NOT NULL,
	"qr_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar PRIMARY KEY DEFAULT 'main' NOT NULL,
	"active_style" text DEFAULT 'clasico' NOT NULL
);
