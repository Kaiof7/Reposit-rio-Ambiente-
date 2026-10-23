CREATE TABLE "model_settings" (
	"model_id" text PRIMARY KEY NOT NULL,
	"available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_sizes" (
	"model_id" text NOT NULL,
	"size_id" text NOT NULL,
	"price_cents" integer NOT NULL,
	"sold_out" boolean DEFAULT false NOT NULL,
	CONSTRAINT "model_sizes_model_id_size_id_pk" PRIMARY KEY("model_id","size_id"),
	CONSTRAINT "model_sizes_price_positive" CHECK ("model_sizes"."price_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "sizes" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"shape" text DEFAULT 'square' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "model_sizes" ADD CONSTRAINT "model_sizes_size_id_sizes_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id") ON DELETE cascade ON UPDATE no action;