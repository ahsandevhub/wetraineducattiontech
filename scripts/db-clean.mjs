import dotenv from "dotenv";
import { resolve } from "path";
import { Client } from "pg";
import { fileURLToPath } from "url";

// Load .env.local explicitly
const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });

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
    // Disable FK constraints temporarily
    await client.query("SET session_replication_role = replica;");

    // Get all tables in public schema and truncate them
    const result = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        AND tablename NOT IN ('supabase_migrations', 'schema_migrations')
    `);

    const tables = result.rows.map((row) => `"${row.tablename}"`).join(", ");

    if (tables) {
      await client.query(`TRUNCATE TABLE ${tables} CASCADE;`);
      console.log(`✅ Truncated ${result.rows.length} table(s)`);
    } else {
      console.log("ℹ️  No tables to truncate");
    }

    // Re-enable FK constraints
    await client.query("SET session_replication_role = default;");

    await client.query("COMMIT");
    console.log("✅ Database cleaned successfully!");
    console.log("ℹ️  All tables, RLS policies, and relationships preserved");
    console.log("⚠️  Note: Run 'npm run seed:all' to repopulate data");
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
