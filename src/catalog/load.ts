import "server-only";
import { connection } from "next/server";
import { getDb } from "@/db";
import { modelSettings, modelSizes, sizes } from "@/db/schema";
import { hasDatabase } from "@/lib/env";
import { logger } from "@/lib/logger";
import { DEFAULT_CATALOG, type Catalog } from "./models";
import { catalogFromRows } from "./rows";

// Read per request so panel changes show up immediately.
export async function getCatalog(): Promise<Catalog> {
  await connection();
  if (!hasDatabase()) return DEFAULT_CATALOG;
  try {
    const db = getDb();
    const [sizeRows, settingRows, offerRows] = await Promise.all([
      db.select().from(sizes),
      db.select().from(modelSettings),
      db.select().from(modelSizes),
    ]);
    return catalogFromRows({ sizes: sizeRows, settings: settingRows, offers: offerRows });
  } catch (error) {
    // Keep the store selling with the code defaults if the database is down;
    // stock flags may be stale until it recovers.
    logger.error({ code: (error as { code?: string }).code }, "Catalog read failed; using defaults");
    return DEFAULT_CATALOG;
  }
}
