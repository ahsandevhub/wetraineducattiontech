/**
 * HRM Application Seeder
 *
 * Seeds the Human Resource Management module:
 *   - hrm_criteria (KPI scoring criteria)
 *   - hrm_users    (linked to real auth.users — created if missing)
 *
 * Auth users created:
 *   hrm.super@seed.local    → SUPER_ADMIN
 *   hrm.admin1@seed.local   → ADMIN
 *   hrm.admin2@seed.local   → ADMIN
 *   hrm.employee1@seed.local → EMPLOYEE
 *   hrm.employee2@seed.local → EMPLOYEE
 *   hrm.employee3@seed.local → EMPLOYEE
 *
 * Run: node scripts/seed-hrm.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local
 * Optional: DATABASE_URL for direct-pg inserts (falls back to Supabase client)
 */

import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const _require = createRequire(import.meta.url);
const dotenv = _require("dotenv");
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const { createClient } = _require("@supabase/supabase-js");

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const serviceKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  ""
).trim();

if (!supabaseUrl || !serviceKey) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE HRM USERS
// ─────────────────────────────────────────────────────────────────────────────

const SEED_PASSWORD = "Seed@1234!";

const hrmUsers = [
  {
    email: "hrm.super@seed.local",
    full_name: "Super Admin (Seed)",
    hrm_role: "SUPER_ADMIN",
  },
  {
    email: "hrm.admin1@seed.local",
    full_name: "HRM Admin One (Seed)",
    hrm_role: "ADMIN",
  },
  {
    email: "hrm.admin2@seed.local",
    full_name: "HRM Admin Two (Seed)",
    hrm_role: "ADMIN",
  },
  {
    email: "hrm.employee1@seed.local",
    full_name: "Employee One (Seed)",
    hrm_role: "EMPLOYEE",
  },
  {
    email: "hrm.employee2@seed.local",
    full_name: "Employee Two (Seed)",
    hrm_role: "EMPLOYEE",
  },
  {
    email: "hrm.employee3@seed.local",
    full_name: "Employee Three (Seed)",
    hrm_role: "EMPLOYEE",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HRM CRITERIA
// ─────────────────────────────────────────────────────────────────────────────

const hrmCriteria = [
  {
    key: "attendance",
    name: "Attendance",
    defaultScaleMax: 10,
    description: "Employee attendance and punctuality",
  },
  {
    key: "behavior",
    name: "Behavior",
    defaultScaleMax: 10,
    description: "Professional behavior and workplace conduct",
  },
  {
    key: "self_learning",
    name: "Self-learning",
    defaultScaleMax: 10,
    description: "Initiative in learning and professional development",
  },
  {
    key: "discipline",
    name: "Discipline",
    defaultScaleMax: 10,
    description: "Following company policies and procedures",
  },
  {
    key: "task_productivity",
    name: "Task & Productivity",
    defaultScaleMax: 10,
    description: "Task completion and overall productivity",
  },
  {
    key: "marketing_output",
    name: "Marketing Output",
    defaultScaleMax: 10,
    description: "Marketing deliverables and campaign results",
  },
  {
    key: "overall_fairness",
    name: "Overall & Fairness",
    defaultScaleMax: 10,
    description: "Overall performance and fairness in work",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensure an auth user exists for the given email.
 * - Tries to create them first.
 * - If email is already taken, searches the existing user list.
 * Returns the user's auth UUID.
 */
async function ensureAuthUser(email, full_name) {
  // 1. Try create
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name },
    });

  if (!createErr) {
    return created.user.id;
  }

  // 2. If already exists, look up by listing users
  if (
    createErr.message?.toLowerCase().includes("already") ||
    createErr.status === 422
  ) {
    const { data: list } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) return existing.id;
  }

  throw new Error(
    `Could not create or find auth user for ${email}: ${createErr.message}`,
  );
}

/**
 * Upsert a row into public.profiles using the Supabase client.
 */
async function upsertProfile(id, full_name, email) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id,
      full_name,
      email,
      role: "admin",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error)
    throw new Error(`Profile upsert failed for ${email}: ${error.message}`);
}

/**
 * Upsert a row into public.hrm_users using the Supabase client.
 */
async function upsertHrmUser(id, hrm_role) {
  const { error } = await supabase
    .from("hrm_users")
    .upsert(
      { id, hrm_role, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  if (error)
    throw new Error(`hrm_users upsert failed for ${id}: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function seedHrmCriteria() {
  console.log("  📊 Seeding HRM criteria...");
  for (const c of hrmCriteria) {
    const { error } = await supabase.from("hrm_criteria").upsert(
      {
        key: c.key,
        name: c.name,
        default_scale_max: c.defaultScaleMax,
        description: c.description,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error)
      throw new Error(
        `hrm_criteria upsert failed for ${c.key}: ${error.message}`,
      );
    console.log(`    ✓ ${c.name} (${c.key})`);
  }
}

async function seedHrmUsers() {
  console.log("\n  👥 Seeding HRM users (auth + profiles + hrm_users)...");

  for (const u of hrmUsers) {
    process.stdout.write(`    → ${u.email} [${u.hrm_role}] ... `);

    const authId = await ensureAuthUser(u.email, u.full_name);
    await upsertProfile(authId, u.full_name, u.email);
    await upsertHrmUser(authId, u.hrm_role);

    console.log(`✓  (${authId.slice(0, 8)}…)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Seeding HRM application data...\n");
  try {
    await seedHrmCriteria();
    await seedHrmUsers();
    console.log(
      "\n✅  HRM data seeded successfully!" +
        `\n    Login with password: ${SEED_PASSWORD}\n`,
    );
  } catch (err) {
    console.error("\n❌  HRM seeding failed:", err.message);
    process.exitCode = 1;
  }
}

main();
