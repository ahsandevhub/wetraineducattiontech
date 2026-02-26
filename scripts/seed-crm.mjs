/**
 * CRM Application Seeder
 *
 * Seeds the Customer Relationship Management module:
 *   - crm_users      (linked to real auth.users — created if missing)
 *   - crm_leads      (sample leads assigned to seeded marketers)
 *   - crm_contact_logs (sample activity logs)
 *
 * Auth users created:
 *   crm.admin@seed.local      → ADMIN
 *   crm.marketer1@seed.local  → MARKETER
 *   crm.marketer2@seed.local  → MARKETER
 *
 * Run: node scripts/seed-crm.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local
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
// SAMPLE CRM USERS
// ─────────────────────────────────────────────────────────────────────────────

const SEED_PASSWORD = "Seed@1234!";

const crmUsers = [
  {
    email: "crm.admin@seed.local",
    full_name: "CRM Admin (Seed)",
    crm_role: "ADMIN",
  },
  {
    email: "crm.marketer1@seed.local",
    full_name: "Marketer One (Seed)",
    crm_role: "MARKETER",
  },
  {
    email: "crm.marketer2@seed.local",
    full_name: "Marketer Two (Seed)",
    crm_role: "MARKETER",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE LEADS DATA
// ─────────────────────────────────────────────────────────────────────────────

// Will be populated with real marketer IDs after user seeding
function buildLeads(marketer1Id, marketer2Id) {
  return [
    {
      name: "Rahim Uddin",
      email: "rahim.uddin@example.com",
      phone: "01711000001",
      company: "Rahim Traders",
      status: "NEW",
      source: "WEBSITE",
      owner_id: marketer1Id,
      notes: "Interested in digital marketing package.",
    },
    {
      name: "Sumaiya Akter",
      email: "sumaiya.akter@example.com",
      phone: "01711000002",
      company: null,
      status: "CONTACTED",
      source: "REFERRAL",
      owner_id: marketer1Id,
      notes: "Called twice, will follow up next week.",
    },
    {
      name: "Kamal Hossain",
      email: null,
      phone: "01711000003",
      company: "Kamal Electronics",
      status: "INTERESTED",
      source: "SOCIAL_MEDIA",
      owner_id: marketer2Id,
      notes: "Sent web development bootcamp proposal.",
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.jahan@example.com",
      phone: "01711000004",
      company: "Nusrat Boutique",
      status: "INTERESTED",
      source: "WEBSITE",
      owner_id: marketer2Id,
      notes: "Negotiating price for SEO package.",
    },
    {
      name: "Tanvir Ahmed",
      email: "tanvir.ahmed@example.com",
      phone: "01711000005",
      company: "Tanvir IT Solutions",
      status: "SOLD",
      source: "REFERRAL",
      owner_id: marketer1Id,
      notes: "Sold ERP system. Contract signed.",
    },
    {
      name: "Reshma Begum",
      email: null,
      phone: "01711000006",
      company: null,
      status: "NOT_INTERESTED",
      source: "SOCIAL_MEDIA",
      owner_id: marketer2Id,
      notes: "Said not interested at this time.",
    },
    {
      name: "Jakir Hasan",
      email: "jakir.hasan@example.com",
      phone: "01711000007",
      company: "Jakir & Co.",
      status: "CONTACTED",
      source: "WEBSITE",
      owner_id: marketer1Id,
      notes: "Wants hospital management system demo.",
    },
    {
      name: "Parveen Sultana",
      email: "parveen.sultana@example.com",
      phone: "01711000008",
      company: "Sultana Retail Group",
      status: "NEW",
      source: "ADMIN",
      owner_id: marketer2Id,
      notes: "Assigned by admin. Interested in POS system.",
    },
    {
      name: "Belal Khan",
      email: null,
      phone: "01711000009",
      company: "Khan Pharmaceuticals",
      status: "CONTACTED",
      source: "REFERRAL",
      owner_id: marketer1Id,
      notes: "Initial contact made via WhatsApp.",
    },
    {
      name: "Nasrin Islam",
      email: "nasrin.islam@example.com",
      phone: "01711000010",
      company: "Islam Academy",
      status: "INTERESTED",
      source: "WEBSITE",
      owner_id: marketer2Id,
      notes: "Sent LMS proposal for online courses.",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function ensureAuthUser(email, full_name) {
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name },
    });

  if (!createErr) return created.user.id;

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

async function upsertCrmUser(id, crm_role) {
  const { error } = await supabase
    .from("crm_users")
    .upsert(
      { id, crm_role, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  if (error)
    throw new Error(`crm_users upsert failed for ${id}: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function seedCrmUsers() {
  console.log("  👥 Seeding CRM users (auth + profiles + crm_users)...");
  const ids = {};

  for (const u of crmUsers) {
    process.stdout.write(`    → ${u.email} [${u.crm_role}] ... `);
    const authId = await ensureAuthUser(u.email, u.full_name);
    await upsertProfile(authId, u.full_name, u.email);
    await upsertCrmUser(authId, u.crm_role);
    ids[u.email] = authId;
    console.log(`✓  (${authId.slice(0, 8)}…)`);
  }

  return ids;
}

async function seedLeads(userIds) {
  const marketer1Id = userIds["crm.marketer1@seed.local"];
  const marketer2Id = userIds["crm.marketer2@seed.local"];

  console.log("\n  📋 Seeding CRM leads...");
  const leads = buildLeads(marketer1Id, marketer2Id);
  const insertedIds = [];

  for (const lead of leads) {
    const { data, error } = await supabase
      .from("crm_leads")
      .upsert(
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: lead.status,
          source: lead.source,
          owner_id: lead.owner_id,
          notes: lead.notes,
        },
        // Upsert on (phone) — phone is the natural unique key in this app
        { onConflict: "phone", ignoreDuplicates: false },
      )
      .select("id")
      .single();

    if (error) {
      console.warn(`    ⚠️  Lead '${lead.name}' skipped: ${error.message}`);
    } else {
      insertedIds.push({ id: data.id, owner_id: lead.owner_id });
    }
  }

  console.log(`  ✓ ${insertedIds.length} leads upserted`);
  return insertedIds;
}

async function seedContactLogs(leads) {
  if (leads.length === 0) return;

  console.log("\n  📞 Seeding contact logs...");

  const sampleLogs = [
    {
      leadIdx: 0,
      contact_type: "CALL",
      notes: "Spoke about digital marketing package pricing.",
    },
    {
      leadIdx: 0,
      contact_type: "WHATSAPP",
      notes: "Sent brochure via WhatsApp.",
    },
    { leadIdx: 1, contact_type: "CALL", notes: "No answer. Left voicemail." },
    {
      leadIdx: 1,
      contact_type: "EMAIL",
      notes: "Sent follow-up email with discount offer.",
    },
    {
      leadIdx: 2,
      contact_type: "MEETING",
      notes: "Online demo of the web development bootcamp.",
    },
    {
      leadIdx: 3,
      contact_type: "CALL",
      notes: "Discussed SEO package scope and timeline.",
    },
    {
      leadIdx: 4,
      contact_type: "EMAIL",
      notes: "Sent final contract for ERP system.",
    },
    {
      leadIdx: 6,
      contact_type: "WHATSAPP",
      notes: "Confirmed hospital management demo scheduled.",
    },
    {
      leadIdx: 8,
      contact_type: "CALL",
      notes: "Spoke in Bengali, very interested. Will call back.",
    },
    { leadIdx: 9, contact_type: "EMAIL", notes: "Sent LMS demo credentials." },
  ];

  let inserted = 0;
  for (const log of sampleLogs) {
    const lead = leads[log.leadIdx];
    if (!lead) continue;

    const { error } = await supabase.from("crm_contact_logs").insert({
      lead_id: lead.id,
      user_id: lead.owner_id,
      contact_type: log.contact_type,
      notes: log.notes,
    });

    if (error) {
      console.warn(`    ⚠️  Contact log skipped: ${error.message}`);
    } else {
      inserted++;
    }
  }

  console.log(`  ✓ ${inserted} contact logs inserted`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱  Seeding CRM application data...\n");
  try {
    const userIds = await seedCrmUsers();
    const leads = await seedLeads(userIds);
    await seedContactLogs(leads);

    console.log(
      "\n✅  CRM data seeded successfully!" +
        `\n    Login with password: ${SEED_PASSWORD}\n`,
    );
  } catch (err) {
    console.error("\n❌  CRM seeding failed:", err.message);
    process.exitCode = 1;
  }
}

main();
