#!/usr/bin/env node
/**
 * Create admin profile for user who has HRM access but no education profile
 * Usage: node scripts/create-admin-profile.mjs <user-email>
 * Example: node scripts/create-admin-profile.mjs arman0sheikh@gmail.com
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminProfile(email) {
  console.log(`\n🔍 Checking user: ${email}`);

  // Get user by email
  const {
    data: { users },
    error: userError,
  } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error("❌ Error fetching users:", userError.message);
    return;
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    console.error(`❌ User not found: ${email}`);
    return;
  }

  console.log(`✅ Found user: ${user.id}`);

  // Check existing profile
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    console.log(`✅ Profile already exists with role: ${existingProfile.role}`);

    // Update to admin if needed
    if (existingProfile.role !== "admin") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id);

      if (updateError) {
        console.error("❌ Error updating profile:", updateError.message);
      } else {
        console.log("✅ Updated profile role to admin");
      }
    }
  } else {
    console.log("📝 Creating new admin profile...");

    // Create admin profile
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Admin",
      email: user.email,
      role: "admin",
    });

    if (insertError) {
      console.error("❌ Error creating profile:", insertError.message);
      console.error("Details:", insertError);
    } else {
      console.log("✅ Created admin profile successfully");
    }
  }

  // Check HRM access
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (hrmUser) {
    console.log(`✅ HRM access: ${hrmUser.hrm_role}`);
  } else {
    console.log("⚠️  No HRM access");
  }

  // Check CRM access
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (crmUser) {
    console.log(`✅ CRM access: ${crmUser.crm_role}`);
  } else {
    console.log("⚠️  No CRM access");
  }

  console.log("\n✅ Done! User should now see the application switcher.\n");
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
  console.error("❌ Usage: node scripts/create-admin-profile.mjs <user-email>");
  console.error(
    "Example: node scripts/create-admin-profile.mjs arman0sheikh@gmail.com",
  );
  process.exit(1);
}

createAdminProfile(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
