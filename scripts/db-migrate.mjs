#!/usr/bin/env node

import { spawn } from "child_process";
import readline from "readline";

const TEST_DB_REF = "uvakcxevpuixskqyrgia";
const LIVE_DB_REF = "iynvamrrxedbszairasl";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const target = process.argv[2];

  if (!target || !["test", "live"].includes(target)) {
    console.error("Usage: node scripts/db-migrate.mjs <test|live>");
    console.error("");
    console.error("Examples:");
    console.error("  npm run migrate:test  - Migrate to TEST database");
    console.error(
      "  npm run migrate:live  - Migrate to LIVE database (requires confirmation)",
    );
    process.exit(1);
  }

  try {
    if (target === "test") {
      console.log("🔵 Linking to TEST database...");
      await runCommand(`npx supabase link --project-ref ${TEST_DB_REF}`);
      console.log("✅ Linked to TEST_DB (wetrain_testing)");
      console.log("");
      await runCommand("npx supabase migration list");
      console.log("");
      const proceed = await question(
        "Apply migrations to TEST database? (y/n) ",
      );
      if (proceed.toLowerCase() === "y") {
        await runCommand("npx supabase db push --include-all");
        console.log("✅ Migrations applied to TEST database");
      } else {
        console.log("❌ Migration cancelled");
      }
    } else if (target === "live") {
      console.log("");
      console.log(
        "⚠️  ⚠️  ⚠️  WARNING: YOU ARE ABOUT TO MIGRATE TO PRODUCTION DATABASE ⚠️  ⚠️  ⚠️ ",
      );
      console.log("");
      console.log("This will apply database migrations to the LIVE database.");
      console.log(
        "Make sure you have fully tested these migrations in TEST database first!",
      );
      console.log("");

      const confirm1 = await question(
        'Type "yes" to confirm you want to migrate to LIVE database: ',
      );
      if (confirm1 !== "yes") {
        console.log("❌ Migration cancelled");
        process.exit(0);
      }

      console.log("");
      const confirm2 = await question(
        'Are you 100% sure? This cannot be easily undone. Type "LIVE" to proceed: ',
      );
      if (confirm2 !== "LIVE") {
        console.log("❌ Migration cancelled");
        process.exit(0);
      }

      console.log("");
      console.log("🔴 Linking to LIVE database...");
      await runCommand(`npx supabase link --project-ref ${LIVE_DB_REF}`);
      console.log("✅ Linked to LIVE_DB (wetrain_live)");
      console.log("");
      await runCommand("npx supabase migration list");
      console.log("");

      const finalConfirm = await question(
        "Applying to LIVE now. Final confirmation? (y/n) ",
      );
      if (finalConfirm.toLowerCase() === "y") {
        await runCommand("npx supabase db push --include-all");
        console.log("✅ Migrations applied to LIVE database");
      } else {
        console.log("❌ Migration cancelled");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
