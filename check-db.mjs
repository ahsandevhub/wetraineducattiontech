import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("Checking database...\n");

    // Check profiles
    const profileCount = await prisma.profile.count();
    console.log(`✓ Profiles table exists: ${profileCount} records`);

    // Check orders
    const orderCount = await prisma.order.count();
    console.log(`✓ Orders table exists: ${orderCount} records`);

    // Check payments
    const paymentCount = await prisma.payment.count();
    console.log(`✓ Payments table exists: ${paymentCount} records`);

    // Check services
    const serviceCount = await prisma.services.count();
    console.log(`✓ Services table exists: ${serviceCount} records`);

    // Check certifications
    const certCount = await prisma.certifications.count();
    console.log(`✓ Certifications table exists: ${certCount} records`);

    // Check projects
    const projectCount = await prisma.featured_projects.count();
    console.log(`✓ Featured Projects table exists: ${projectCount} records`);

    // Check client stories
    const storyCount = await prisma.client_stories.count();
    console.log(`✓ Client Stories table exists: ${storyCount} records`);

    console.log("\n✅ All tables exist and are accessible!");

    // Show sample profile data if any exists
    if (profileCount > 0) {
      console.log("\nSample profile data:");
      const sampleProfile = await prisma.profile.findFirst({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          country: true,
        },
      });
      console.log(sampleProfile);
    }
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
