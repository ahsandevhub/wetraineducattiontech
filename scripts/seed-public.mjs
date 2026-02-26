/**
 * Public / Landing Page Seeder
 *
 * Seeds content for the public-facing parts of the website:
 *   - services       (courses, software, marketing)
 *   - certifications
 *   - featured_projects
 *   - client_stories
 *   - orders + payments  (linked to existing auth profiles)
 *
 * Run: node scripts/seed-public.mjs
 * Requires: DATABASE_URL in .env.local
 */

import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const _require = createRequire(import.meta.url);
const dotenv = _require("dotenv");
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const { Client } = _require("pg");

const databaseUrl = (process.env.DATABASE_URL || "").trim();
if (!databaseUrl) {
  console.error("❌  Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const services = [
  // Marketing services
  {
    title: "WhatsApp Business Service",
    slug: "whatsapp-business-service",
    category: "marketing",
    price: 9999,
    currency: "BDT",
    details: "Send messages via WhatsApp Business API with advanced scheduling",
    keyFeatures: [
      "Message Scheduling",
      "Bulk Send",
      "Analytics",
      "Team Management",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500&h=500&fit=crop",
  },
  {
    title: "Digital Marketing Service",
    slug: "digital-marketing-service",
    category: "marketing",
    price: 19999,
    currency: "BDT",
    details: "Complete digital marketing solutions for business growth",
    keyFeatures: ["SEO", "Social Media", "Content Creation", "Email Marketing"],
    featured_image_url:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=500&fit=crop",
  },
  {
    title: "Facebook Ads Management",
    slug: "facebook-ads-management",
    category: "marketing",
    price: 14999,
    currency: "BDT",
    details:
      "Expert management of Facebook and Instagram advertising campaigns",
    keyFeatures: ["Campaign Setup", "Targeting", "Optimization", "Reporting"],
    featured_image_url:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
  },
  {
    title: "SEO Optimization Service",
    slug: "seo-optimization-service",
    category: "marketing",
    price: 24999,
    currency: "BDT",
    details: "Comprehensive SEO strategy to boost your online visibility",
    keyFeatures: [
      "Keyword Research",
      "On-Page SEO",
      "Backlink Building",
      "Analytics",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop",
  },
  {
    title: "Email Marketing Automation",
    slug: "email-marketing-automation",
    category: "marketing",
    price: 12999,
    currency: "BDT",
    details: "Automated email campaigns for customer engagement",
    keyFeatures: [
      "Automation Setup",
      "Template Design",
      "List Management",
      "Analytics",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=500&fit=crop",
  },
  {
    title: "Google Ads Specialist",
    slug: "google-ads-specialist",
    category: "marketing",
    price: 16999,
    currency: "BDT",
    details: "Professional Google Ads management for maximum conversions",
    keyFeatures: [
      "Keyword Strategy",
      "Ad Copy",
      "Bid Management",
      "Conversion Tracking",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=500&fit=crop",
  },
  // Software services
  {
    title: "School Management System",
    slug: "school-management-system",
    category: "software",
    price: 49999,
    currency: "BDT",
    details: "Complete school management software solution",
    keyFeatures: [
      "Student Records",
      "Attendance",
      "Reporting",
      "Parent Portal",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=500&h=500&fit=crop",
  },
  {
    title: "Hospital Management System",
    slug: "hospital-management-system",
    category: "software",
    price: 69999,
    currency: "BDT",
    details: "Integrated healthcare management platform",
    keyFeatures: [
      "Patient Records",
      "Appointment Scheduling",
      "Billing",
      "Medical Reports",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=500&h=500&fit=crop",
  },
  {
    title: "Inventory Management System",
    slug: "inventory-management-system",
    category: "software",
    price: 39999,
    currency: "BDT",
    details: "Real-time inventory tracking and management",
    keyFeatures: [
      "Stock Tracking",
      "Purchase Orders",
      "Analytics",
      "Multi-Location",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
  },
  {
    title: "CRM Software Solution",
    slug: "crm-software-solution",
    category: "software",
    price: 44999,
    currency: "BDT",
    details: "Customer relationship management for businesses",
    keyFeatures: [
      "Contact Management",
      "Sales Pipeline",
      "Email Integration",
      "Reporting",
    ],
    featured_image_url:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
  },
  {
    title: "ERP System",
    slug: "erp-system",
    category: "software",
    price: 99999,
    currency: "BDT",
    details: "Enterprise resource planning solution",
    keyFeatures: ["Finance", "HR Management", "Supply Chain", "Analytics"],
    featured_image_url:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
  },
  // Course services
  {
    title: "Complete Web Development Bootcamp",
    slug: "web-development-bootcamp",
    category: "course",
    price: 24999,
    currency: "BDT",
    details: "Learn full-stack web development from scratch",
    keyFeatures: ["HTML/CSS/JS", "React", "Node.js", "Database Design"],
    featured_image_url:
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500&h=500&fit=crop",
  },
  {
    title: "Advanced Python Programming",
    slug: "advanced-python-programming",
    category: "course",
    price: 19999,
    currency: "BDT",
    details: "Master Python for web development and data science",
    keyFeatures: ["OOP", "Web Frameworks", "Data Analysis", "Automation"],
    featured_image_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop",
  },
  {
    title: "Mobile App Development with React Native",
    slug: "react-native-mobile-development",
    category: "course",
    price: 29999,
    currency: "BDT",
    details: "Build cross-platform mobile apps with React Native",
    keyFeatures: ["React Native", "iOS/Android", "Firebase", "App Publishing"],
    featured_image_url:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=500&fit=crop",
  },
  {
    title: "Data Science & Machine Learning",
    slug: "data-science-machine-learning",
    category: "course",
    price: 44999,
    currency: "BDT",
    details: "Complete data science and ML training",
    keyFeatures: ["Python", "NumPy/Pandas", "Scikit-learn", "TensorFlow"],
    featured_image_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop",
  },
  {
    title: "Digital Marketing Mastery",
    slug: "digital-marketing-mastery",
    category: "course",
    price: 16999,
    currency: "BDT",
    details: "Master all aspects of digital marketing",
    keyFeatures: ["SEO", "SEM", "Social Media", "Analytics", "Email Marketing"],
    featured_image_url:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=500&fit=crop",
  },
  {
    title: "UI/UX Design Principles",
    slug: "ui-ux-design-principles",
    category: "course",
    price: 14999,
    currency: "BDT",
    details: "Learn modern UI/UX design principles and tools",
    keyFeatures: ["Figma", "Prototyping", "User Research", "Design Systems"],
    featured_image_url:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=500&fit=crop",
  },
];

const certifications = [
  {
    title: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    issued_at: "2024-01-15",
    description: "Professional level certification for cloud architecture",
    credential_id: "AWS-SA-001",
    verify_url: "https://aws.amazon.com/certification",
    image_url:
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=200&h=200&fit=crop",
  },
  {
    title: "Google Cloud Professional",
    issuer: "Google Cloud",
    issued_at: "2024-02-20",
    description: "Data Engineer certification for cloud platforms",
    credential_id: "GCP-DE-002",
    verify_url: "https://cloud.google.com/certification",
    image_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop",
  },
  {
    title: "Microsoft Azure Administrator",
    issuer: "Microsoft",
    issued_at: "2024-03-10",
    description: "Azure cloud administration and management",
    credential_id: "AZ-104-003",
    verify_url: "https://learn.microsoft.com/en-us/certifications",
    image_url:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop",
  },
  {
    title: "Kubernetes Administrator",
    issuer: "Cloud Native Computing Foundation",
    issued_at: "2024-04-05",
    description: "Certified Kubernetes Administrator (CKA) credential",
    credential_id: "CKA-004",
    verify_url: "https://www.cncf.io/certification/cka",
    image_url:
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=200&h=200&fit=crop",
  },
  {
    title: "Docker Certified Associate",
    issuer: "Docker",
    issued_at: "2024-05-12",
    description: "Containerization and Docker platform expertise",
    credential_id: "DCA-005",
    verify_url: "https://docs.docker.com/get-started",
    image_url:
      "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=200&h=200&fit=crop",
  },
  {
    title: "Certified Information Systems Security Professional",
    issuer: "ISC²",
    issued_at: "2024-06-08",
    description: "CISSP cybersecurity professional certification",
    credential_id: "CISSP-006",
    verify_url: "https://www.isc2.org/certifications/cissp",
    image_url:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=200&h=200&fit=crop",
  },
  {
    title: "Digital Marketing Professional",
    issuer: "Google Digital Garage",
    issued_at: "2024-08-20",
    description: "Comprehensive digital marketing certification",
    credential_id: "DM-PRO-008",
    verify_url: "https://learndigital.withgoogle.com",
    image_url:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&h=200&fit=crop",
  },
  {
    title: "Project Management Professional",
    issuer: "Project Management Institute",
    issued_at: "2024-09-10",
    description: "PMP certification for project management",
    credential_id: "PMP-009",
    verify_url: "https://www.pmi.org/certifications/project-management-pmp",
    image_url:
      "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=200&h=200&fit=crop",
  },
  {
    title: "Full Stack Web Development",
    issuer: "freeCodeCamp",
    issued_at: "2024-10-05",
    description: "Complete full stack web development mastery",
    credential_id: "FSWD-010",
    verify_url: "https://freecodecamp.org",
    image_url:
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=200&h=200&fit=crop",
  },
];

const projects = [
  {
    title: "E-Commerce Platform",
    slug: "ecommerce-platform",
    category: "web",
    description:
      "Full-featured e-commerce platform with payments and inventory management",
    tech_stack: ["Next.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    featured_image_url:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=300&fit=crop",
    live_url: "https://example-ecommerce.com",
    github_url: "https://github.com/wetraineducation/ecommerce",
  },
  {
    title: "School Management System",
    slug: "school-management",
    category: "software",
    description:
      "Comprehensive desktop and web-based school management solution",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Electron"],
    featured_image_url:
      "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=500&h=300&fit=crop",
    live_url: "https://example-school.com",
    github_url: null,
  },
  {
    title: "AI-Powered Analytics Dashboard",
    slug: "ai-analytics-dashboard",
    category: "web",
    description:
      "Real-time data analytics with AI-powered insights and predictions",
    tech_stack: ["Vue.js", "Python", "TensorFlow", "Firebase"],
    featured_image_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    live_url: "https://example-analytics.com",
    github_url: "https://github.com/wetraineducation/analytics",
  },
  {
    title: "Mobile Banking App",
    slug: "mobile-banking-app",
    category: "mobile",
    description: "Secure mobile banking application with transaction tracking",
    tech_stack: ["React Native", "Node.js", "MongoDB", "AWS"],
    featured_image_url:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=300&fit=crop",
    live_url: null,
    github_url: "https://github.com/wetraineducation/banking-app",
  },
  {
    title: "Social Media Management Tool",
    slug: "social-media-management",
    category: "web",
    description:
      "All-in-one platform for managing multiple social media accounts",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Redis"],
    featured_image_url:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    live_url: "https://example-socials.com",
    github_url: null,
  },
  {
    title: "Video Learning Platform",
    slug: "video-learning-platform",
    category: "web",
    description:
      "Interactive video-based learning platform with course management",
    tech_stack: ["Next.js", "Firebase", "FFmpeg", "Stripe"],
    featured_image_url:
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500&h=300&fit=crop",
    live_url: "https://example-learn.com",
    github_url: null,
  },
  {
    title: "Healthcare Appointment System",
    slug: "healthcare-appointment",
    category: "web",
    description:
      "HIPAA-compliant healthcare appointment and patient management",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Twilio"],
    featured_image_url:
      "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=500&h=300&fit=crop",
    live_url: "https://example-healthcare.com",
    github_url: null,
  },
  {
    title: "Logistics Tracking System",
    slug: "logistics-tracking",
    category: "software",
    description: "Real-time shipment tracking with GPS integration",
    tech_stack: ["Flutter", "Node.js", "PostgreSQL", "Google Maps API"],
    featured_image_url:
      "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=300&fit=crop",
    live_url: "https://example-logistics.com",
    github_url: "https://github.com/wetraineducation/logistics",
  },
];

const clientStories = [
  {
    name: "Nabila Rahman",
    role: "Founder, Beauty Salon Chain",
    quote:
      "WeTrainEducation transformed our business with digital marketing skills. Excellent instructors!",
    achievement: "3x revenue growth in 6 months",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=20",
  },
  {
    name: "Farhan Ahmed",
    role: "Tech Entrepreneur",
    quote:
      "Learned modern web development from industry experts. Life-changing experience.",
    achievement: "Launched successful SaaS product",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=21",
  },
  {
    name: "Tania Islam",
    role: "Freelance Developer",
    quote:
      "Professional training that made me confident. The curriculum is outstanding!",
    achievement: "10+ successful projects delivered",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=22",
  },
  {
    name: "Mohammad Karim",
    role: "Digital Marketing Manager",
    quote:
      "The marketing course was comprehensive and practical. Highly recommended!",
    achievement: "Tripled marketing ROI",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=23",
  },
  {
    name: "Priya Nandi",
    role: "Startup Founder",
    quote:
      "Best investment I made for my business. Expert mentorship throughout.",
    achievement: "Raised $500K funding",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=24",
  },
  {
    name: "Rashed Hossain",
    role: "Senior Software Engineer",
    quote:
      "Enhanced my skills significantly. The instructors are industry veterans.",
    achievement: "Promoted to Team Lead",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=25",
  },
  {
    name: "Sophia Chakraborty",
    role: "E-Commerce Manager",
    quote:
      "Transformed my career path. Knowledge and support are unparalleled.",
    achievement: "Built 3 successful online stores",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=26",
  },
  {
    name: "Arjun Singh",
    role: "Business Analyst",
    quote: "Excellent courses with real-world applications. Worth every taka!",
    achievement: "Career salary increase by 60%",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=27",
  },
  {
    name: "Maha Begum",
    role: "Content Creator",
    quote:
      "The social media and content strategy courses are incredibly valuable.",
    achievement: "Built 500K followers community",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=28",
  },
  {
    name: "Hassan Khan",
    role: "IT Project Manager",
    quote:
      "Professional development at its finest. Highly interactive and engaging.",
    achievement: "Leading 30+ person team",
    rating: 5,
    image_url: "https://i.pravatar.cc/150?img=29",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function seedServices() {
  console.log("  📦 Seeding services...");
  let count = 0;
  for (const s of services) {
    const { rowCount } = await client.query(
      `INSERT INTO public.services
         (title, slug, category, price, discount, currency, details, key_features, featured_image_url)
       VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8)
       ON CONFLICT (slug) DO UPDATE SET
         title              = EXCLUDED.title,
         category           = EXCLUDED.category,
         price              = EXCLUDED.price,
         currency           = EXCLUDED.currency,
         details            = EXCLUDED.details,
         key_features       = EXCLUDED.key_features,
         featured_image_url = EXCLUDED.featured_image_url`,
      [
        s.title,
        s.slug,
        s.category,
        s.price,
        s.currency,
        s.details,
        s.keyFeatures,
        s.featured_image_url,
      ],
    );
    if (rowCount > 0) count++;
  }
  console.log(`  ✓ ${count} services upserted`);
}

async function seedCertifications() {
  console.log("  🏅 Seeding certifications...");
  for (const c of certifications) {
    await client.query(
      `INSERT INTO public.certifications
         (title, issuer, issued_at, description, credential_id, verify_url, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (credential_id) DO UPDATE SET
         title       = EXCLUDED.title,
         issuer      = EXCLUDED.issuer,
         issued_at   = EXCLUDED.issued_at,
         description = EXCLUDED.description,
         verify_url  = EXCLUDED.verify_url,
         image_url   = EXCLUDED.image_url`,
      [
        c.title,
        c.issuer,
        c.issued_at,
        c.description,
        c.credential_id,
        c.verify_url,
        c.image_url,
      ],
    );
  }
  console.log(`  ✓ ${certifications.length} certifications upserted`);
}

async function seedProjects() {
  console.log("  🗂️  Seeding featured projects...");
  for (const p of projects) {
    await client.query(
      `INSERT INTO public.featured_projects
         (title, slug, category, description, tech_stack, featured_image_url, live_url, github_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (slug) DO UPDATE SET
         title              = EXCLUDED.title,
         category           = EXCLUDED.category,
         description        = EXCLUDED.description,
         tech_stack         = EXCLUDED.tech_stack,
         featured_image_url = EXCLUDED.featured_image_url,
         live_url           = EXCLUDED.live_url,
         github_url         = EXCLUDED.github_url`,
      [
        p.title,
        p.slug,
        p.category,
        p.description,
        p.tech_stack,
        p.featured_image_url,
        p.live_url,
        p.github_url,
      ],
    );
  }
  console.log(`  ✓ ${projects.length} projects upserted`);
}

async function seedClientStories() {
  console.log("  💬 Seeding client stories...");
  for (const s of clientStories) {
    await client.query(
      `INSERT INTO public.client_stories (name, role, quote, achievement, rating, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [s.name, s.role, s.quote, s.achievement, s.rating, s.image_url],
    );
  }
  console.log(`  ✓ ${clientStories.length} client stories seeded`);
}

async function seedOrdersAndPayments() {
  // Only seed orders/payments if real profiles exist
  const { rows } = await client.query(
    `SELECT id FROM public.profiles ORDER BY created_at DESC LIMIT 10`,
  );

  if (rows.length === 0) {
    console.log("  ⚠️  No profiles found — skipping orders & payments");
    console.log(
      "     Run seed:hrm or seed:crm first, then re-run seed:public to add them.",
    );
    return;
  }

  const profileIds = rows.map((r) => r.id);
  const pick = () => profileIds[Math.floor(Math.random() * profileIds.length)];

  const sampleOrders = [
    {
      package_name: "Digital Marketing Course",
      amount: 19999,
      status: "completed",
    },
    {
      package_name: "Web Development Bootcamp",
      amount: 24999,
      status: "pending",
    },
    {
      package_name: "SEO Optimization Service",
      amount: 24999,
      status: "completed",
    },
    {
      package_name: "School Management System",
      amount: 49999,
      status: "pending",
    },
    { package_name: "ERP System", amount: 99999, status: "completed" },
  ];

  console.log("  🛒 Seeding orders...");
  for (const o of sampleOrders) {
    await client.query(
      `INSERT INTO public.orders (user_id, package_name, amount, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT DO NOTHING`,
      [pick(), o.package_name, o.amount, o.status],
    );
  }

  const samplePayments = [
    { amount: 19999, method: "card", status: "paid" },
    { amount: 24999, method: "mobile_banking", status: "pending" },
    { amount: 24999, method: "card", status: "paid" },
    { amount: 49999, method: "mobile_banking", status: "paid" },
    { amount: 99999, method: "bank_transfer", status: "paid" },
    { amount: 14999, method: "card", status: "pending" },
  ];

  console.log("  💳 Seeding payments...");
  for (const p of samplePayments) {
    await client.query(
      `INSERT INTO public.payments (user_id, amount, method, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT DO NOTHING`,
      [pick(), p.amount, p.method, p.status],
    );
  }

  console.log(
    `  ✓ Seeded ${sampleOrders.length} orders and ${samplePayments.length} payments for ${profileIds.length} profiles`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  await client.connect();
  try {
    console.log("\n🌱  Seeding Public / Landing page data...\n");
    await seedServices();
    await seedCertifications();
    await seedProjects();
    await seedClientStories();
    await seedOrdersAndPayments();
    console.log("\n✅  Public data seeded successfully!");
  } catch (err) {
    console.error("\n❌  Public seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
