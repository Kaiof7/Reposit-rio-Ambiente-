// Applies drizzle/ migrations during Vercel production builds only: the seller
// has no terminal to run `pnpm db:migrate`. Previews and local builds skip it,
// so unmerged schema changes never reach the production database.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (process.env.VERCEL_ENV !== "production" || !url) {
  console.log("Skipping database migrations (only Vercel production builds with DATABASE_URL run them).");
  process.exit(0);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await migrate(drizzle({ client }), { migrationsFolder: "drizzle" });
  console.log("Database migrations applied.");
} finally {
  await client.end();
}
