import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
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

const migrationsDir = path.resolve("supabase", "migrations");

const client = new Client({ connectionString: databaseUrl });

async function resetPublicSchema() {
  await client.query("begin");
  await client.query("drop schema if exists public cascade;");
  await client.query("create schema public;");

  // Re-apply default grants expected by Supabase
  await client.query(
    "grant usage on schema public to postgres, anon, authenticated, service_role;",
  );
  await client.query("grant all on schema public to postgres, service_role;");
  await client.query(
    "alter default privileges in schema public grant all on tables to postgres, service_role;",
  );
  await client.query(
    "alter default privileges in schema public grant all on sequences to postgres, service_role;",
  );
  await client.query(
    "alter default privileges in schema public grant all on functions to postgres, service_role;",
  );
  await client.query(
    "alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;",
  );
  await client.query(
    "alter default privileges in schema public grant usage, select on sequences to anon, authenticated;",
  );

  await client.query("commit");
}

async function applyMigrations() {
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = await readFile(filePath, "utf8");
    if (!sql.trim()) continue;

    console.log(`Applying migration: ${file}`);
    await client.query(sql);
  }
}

async function main() {
  await client.connect();
  try {
    console.log("Resetting public schema (auth.users preserved)...");
    await resetPublicSchema();

    console.log("Applying migrations...");
    await applyMigrations();

    console.log("Database reset + migrations complete.");
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // ignore rollback errors
    }
    console.error("Database reset failed:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
