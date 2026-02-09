import "dotenv/config";
import { Client } from "pg";

const databaseUrl = (process.env.DATABASE_URL || "").trim();

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

if (process.env.RESET_SEED_ALLOW !== "true") {
  throw new Error(
    "RESET_SEED_ALLOW must be set to true to run this script safely.",
  );
}

const client = new Client({ connectionString: databaseUrl });

async function resetDatabase() {
  await client.query("BEGIN");
  try {
    // Drop all tables in public schema
    await client.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      
      -- Re-apply default grants expected by Supabase
      GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
      GRANT ALL ON SCHEMA public TO postgres, service_role;
      
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
    `);

    await client.query("COMMIT");
    console.log("✅ Database cleaned successfully!");
    console.log("⚠️  Note: Run 'npm run db:seed' to repopulate data");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Database clean failed:", error.message);
    process.exitCode = 1;
  }
}

async function main() {
  await client.connect();
  try {
    console.log("🗑️  Cleaning database...");
    await resetDatabase();
  } finally {
    await client.end();
  }
}

main();
