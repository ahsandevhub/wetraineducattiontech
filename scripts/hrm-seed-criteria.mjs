import "dotenv/config";
import { Client } from "pg";

const databaseUrl = (process.env.DATABASE_URL || "").trim();

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

const client = new Client({ connectionString: databaseUrl });

const defaultCriteria = [
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

async function seedHrmCriteria() {
  console.log("🌱 Seeding HRM Criteria...");

  for (const criteria of defaultCriteria) {
    await client.query(
      `INSERT INTO public.hrm_criteria (key, name, default_scale_max, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (key) DO UPDATE SET
         name = EXCLUDED.name,
         default_scale_max = EXCLUDED.default_scale_max,
         description = EXCLUDED.description,
         updated_at = NOW()`,
      [
        criteria.key,
        criteria.name,
        criteria.defaultScaleMax,
        criteria.description,
      ],
    );
    console.log(`  ✓ Created/Updated: ${criteria.name} (${criteria.key})`);
  }
}

async function main() {
  await client.connect();
  try {
    console.log("🌱 Seeding HRM data...\n");
    await seedHrmCriteria();
    console.log("\n✅ HRM criteria seeded successfully!");
  } catch (error) {
    console.error("\n❌ HRM seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
