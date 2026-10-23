import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

// Seller-managed catalog data. Model copy and icons stay in src/catalog/models.ts;
// rows here reference those model ids.
export const sizes = pgTable("sizes", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull().default(""),
  shape: text("shape", { enum: ["square", "portrait"] }).notNull().default("square"),
  position: integer("position").notNull().default(0),
});

export const modelSettings = pgTable("model_settings", {
  modelId: text("model_id").primaryKey(),
  available: boolean("available").notNull().default(true),
});

export const modelSizes = pgTable(
  "model_sizes",
  {
    modelId: text("model_id").notNull(),
    sizeId: text("size_id")
      .notNull()
      .references(() => sizes.id, { onDelete: "cascade" }),
    priceCents: integer("price_cents").notNull(),
    soldOut: boolean("sold_out").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.modelId, table.sizeId] }),
    check("model_sizes_price_positive", sql`${table.priceCents} > 0`),
  ],
);

export type SizeRow = typeof sizes.$inferSelect;
export type ModelSettingRow = typeof modelSettings.$inferSelect;
export type ModelSizeRow = typeof modelSizes.$inferSelect;
