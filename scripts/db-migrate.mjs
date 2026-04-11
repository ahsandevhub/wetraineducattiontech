#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import dotenv from "dotenv";

const TEST_DB_REF = "uvakcxevpuixskqyrgia";
const LIVE_DB_REF = "iynvamrrxedbszairasl";
const DEFAULT_COMMAND_TIMEOUT_MS = 120_000;
const DB_PUSH_TIMEOUT_MS = 300_000;

loadEnvFiles();

function loadEnvFiles() {
  const cwd = process.cwd();
  const envFiles = [".env.local", ".env"];

  for (const fileName of envFiles) {
    const filePath = path.join(cwd, fileName);
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: false, quiet: true });
    }
  }
}

function getNpxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function runCommand(
  command,
  args = [],
  extraEnv = {},
  {
    timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS,
    label = [command, ...args].join(" "),
  } = {},
) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      windowsHide: true,
      env: {
        ...process.env,
        ...extraEnv,
      },
    });

    const timeout = setTimeout(() => {
      if (finished) {
        return;
      }

      child.kill("SIGTERM");
      reject(
        new Error(
          `Command timed out after ${Math.round(timeoutMs / 1000)}s: ${label}`,
        ),
      );
    }, timeoutMs);

    child.on("error", (error) => {
      finished = true;
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      finished = true;
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

function getDatabasePassword() {
  if (process.env.SUPABASE_DB_PASSWORD) {
    return process.env.SUPABASE_DB_PASSWORD;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(databaseUrl);
    return parsed.password || null;
  } catch {
    return null;
  }
}

async function question(prompt) {
  const { createInterface } = await import("readline");
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const target = args.find((arg) => arg === "test" || arg === "live");
  const autoApproveTest = args.includes("--yes");
  const dbPassword = getDatabasePassword();

  if (!target || !["test", "live"].includes(target)) {
    console.error("Usage: node scripts/db-migrate.mjs <test|live> [--yes]");
    console.error("");
    console.error("Examples:");
    console.error("  npm run migrate:test  - Migrate to TEST database");
    console.error(
      "  node scripts/db-migrate.mjs test --yes  - Migrate to TEST without prompt",
    );
    console.error(
      "  npm run migrate:live  - Migrate to LIVE database (requires confirmation)",
    );
    process.exit(1);
  }

  if (!dbPassword) {
    console.error(
      "❌ Missing database password. Set SUPABASE_DB_PASSWORD or DATABASE_URL.",
    );
    process.exit(1);
  }

  const commandEnv = {
    SUPABASE_DB_PASSWORD: dbPassword,
  };
  const npxCommand = getNpxCommand();

  try {
    if (target === "test") {
      console.log("🔵 Linking to TEST database...");
      await runCommand(
        npxCommand,
        ["supabase", "link", "--project-ref", TEST_DB_REF],
        commandEnv,
        {
          label: "supabase link (test)",
        },
      );
      console.log("✅ Linked to TEST_DB (wetrain_testing)");
      console.log("");
      await runCommand(npxCommand, ["supabase", "migration", "list"], commandEnv, {
        label: "supabase migration list (test)",
      });
      console.log("");
      const proceed = autoApproveTest
        ? "y"
        : await question("Apply migrations to TEST database? (y/n) ");

      if (String(proceed).toLowerCase() === "y") {
        await runCommand(
          npxCommand,
          ["supabase", "db", "push", "--include-all"],
          commandEnv,
          {
            timeoutMs: DB_PUSH_TIMEOUT_MS,
            label: "supabase db push (test)",
          },
        );
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
      await runCommand(
        npxCommand,
        ["supabase", "link", "--project-ref", LIVE_DB_REF],
        commandEnv,
        {
          label: "supabase link (live)",
        },
      );
      console.log("✅ Linked to LIVE_DB (wetrain_live)");
      console.log("");
      await runCommand(npxCommand, ["supabase", "migration", "list"], commandEnv, {
        label: "supabase migration list (live)",
      });
      console.log("");

      const finalConfirm = await question(
        "Applying to LIVE now. Final confirmation? (y/n) ",
      );
      if (String(finalConfirm).toLowerCase() === "y") {
        await runCommand(
          npxCommand,
          ["supabase", "db", "push", "--include-all"],
          commandEnv,
          {
            timeoutMs: DB_PUSH_TIMEOUT_MS,
            label: "supabase db push (live)",
          },
        );
        console.log("✅ Migrations applied to LIVE database");
      } else {
        console.log("❌ Migration cancelled");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
