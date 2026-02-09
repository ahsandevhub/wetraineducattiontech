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

async function applyMigrations() {
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = await readFile(filePath, "utf8");
    if (!sql.trim()) continue;

    console.log(`  Applying: ${file}`);
    await client.query(sql);
  }
}

async function seedDatabase() {
  // First, get all existing profiles (created via auth.users trigger or app fallback)
  const existingProfiles = await client.query(
    `SELECT id FROM public.profiles ORDER BY created_at DESC LIMIT 20`,
  );
  const existingProfileIds = existingProfiles.rows.map((row) => row.id);

  // Seed services (5-10 per category: course, software, marketing)
  const services = [
    // Marketing services (8 services)
    {
      title: "WhatsApp Business Service",
      slug: "whatsapp-business-service",
      category: "marketing",
      price: 9999,
      currency: "BDT",
      details:
        "Send messages via WhatsApp Business API with advanced scheduling",
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
      keyFeatures: [
        "SEO",
        "Social Media",
        "Content Creation",
        "Email Marketing",
      ],
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
      title: "Content Marketing Strategy",
      slug: "content-marketing-strategy",
      category: "marketing",
      price: 29999,
      currency: "BDT",
      details: "Strategic content creation and distribution for brand growth",
      keyFeatures: [
        "Blog Posts",
        "Video Content",
        "Social Media",
        "Distribution",
      ],
      featured_image_url:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
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
      title: "Influencer Marketing Campaign",
      slug: "influencer-marketing-campaign",
      category: "marketing",
      price: 34999,
      currency: "BDT",
      details: "Connect with influencers to amplify your brand message",
      keyFeatures: [
        "Influencer Selection",
        "Campaign Planning",
        "Content Creation",
        "ROI Tracking",
      ],
      featured_image_url:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
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
    // Software services (8 services)
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
      title: "Point of Sale System",
      slug: "point-of-sale-system",
      category: "software",
      price: 34999,
      currency: "BDT",
      details: "Modern POS system for retail businesses",
      keyFeatures: [
        "Sales Processing",
        "Payment Gateway",
        "Reports",
        "Inventory Sync",
      ],
      featured_image_url:
        "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=500&h=500&fit=crop",
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
      title: "Learning Management System",
      slug: "learning-management-system",
      category: "software",
      price: 54999,
      currency: "BDT",
      details: "Platform for online learning and course management",
      keyFeatures: [
        "Course Creation",
        "Student Tracking",
        "Assessments",
        "Certificates",
      ],
      featured_image_url:
        "https://images.unsplash.com/photo-1516534775068-bb57cd175440?w=500&h=500&fit=crop",
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
    // Course services (8 services)
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
      keyFeatures: [
        "React Native",
        "iOS/Android",
        "Firebase",
        "App Publishing",
      ],
      featured_image_url:
        "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=500&fit=crop",
    },
    {
      title: "Cloud Architecture & AWS",
      slug: "cloud-architecture-aws",
      category: "course",
      price: 34999,
      currency: "BDT",
      details: "Learn AWS cloud architecture and deployment",
      keyFeatures: ["EC2", "S3", "RDS", "Lambda", "Infrastructure as Code"],
      featured_image_url:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
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
      keyFeatures: [
        "SEO",
        "SEM",
        "Social Media",
        "Analytics",
        "Email Marketing",
      ],
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

  for (const service of services) {
    await client.query(
      `INSERT INTO public.services (title, slug, category, price, discount, currency, details, key_features, featured_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO NOTHING`,
      [
        service.title,
        service.slug,
        service.category,
        service.price,
        null,
        service.currency,
        service.details,
        service.keyFeatures,
        service.featured_image_url,
      ],
    );
  }

  // Seed certifications (8-10 comprehensive certifications)
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
      title: "Advanced SEO Specialist",
      issuer: "HubSpot Academy",
      issued_at: "2024-07-15",
      description: "Advanced search engine optimization techniques",
      credential_id: "SEO-ADV-007",
      verify_url: "https://academy.hubspot.com",
      image_url:
        "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=200&h=200&fit=crop",
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

  for (const cert of certifications) {
    await client.query(
      `INSERT INTO public.certifications (title, issuer, issued_at, description, credential_id, verify_url, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
      [
        cert.title,
        cert.issuer,
        cert.issued_at,
        cert.description,
        cert.credential_id,
        cert.verify_url,
        cert.image_url,
      ],
    );
  }

  // Seed featured projects (8-10 projects)
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
      description:
        "Secure mobile banking application with transaction tracking",
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
      title: "IoT Device Management Portal",
      slug: "iot-device-management",
      category: "software",
      description: "Cloud-based IoT device monitoring and control platform",
      tech_stack: ["Angular", "Node.js", "MongoDB", "MQTT"],
      featured_image_url:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&h=300&fit=crop",
      live_url: "https://example-iot.com",
      github_url: "https://github.com/wetraineducation/iot",
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
      title: "Real Estate Marketplace",
      slug: "real-estate-marketplace",
      category: "web",
      description: "Modern real estate listing platform with virtual tours",
      tech_stack: ["Vue.js", "Django", "PostgreSQL", "Three.js"],
      featured_image_url:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=300&fit=crop",
      live_url: "https://example-realestate.com",
      github_url: "https://github.com/wetraineducation/realestate",
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

  for (const project of projects) {
    await client.query(
      `INSERT INTO public.featured_projects (title, slug, category, description, tech_stack, featured_image_url, live_url, github_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (slug) DO NOTHING`,
      [
        project.title,
        project.slug,
        project.category,
        project.description,
        project.tech_stack,
        project.featured_image_url,
        project.live_url,
        project.github_url,
      ],
    );
  }

  // Seed client stories (8-10 comprehensive stories)
  const stories = [
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
      quote:
        "Excellent courses with real-world applications. Worth every taka!",
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

  for (const story of stories) {
    await client.query(
      `INSERT INTO public.client_stories (name, role, quote, achievement, rating, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [
        story.name,
        story.role,
        story.quote,
        story.achievement,
        story.rating,
        story.image_url,
      ],
    );
  }

  // Seed sample orders for existing profiles
  if (existingProfileIds.length > 0) {
    const orders = [
      {
        profile_id: existingProfileIds[0],
        package_name: "Digital Marketing Course",
        amount: 19999,
        status: "completed",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        package_name: "Web Development Course",
        amount: 24999,
        status: "pending",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        package_name: "SEO Optimization Service",
        amount: 24999,
        status: "completed",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        package_name: "Cloud Migration Service",
        amount: 44999,
        status: "completed",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        package_name: "School Management System",
        amount: 49999,
        status: "pending",
      },
    ];

    for (const order of orders) {
      await client.query(
        `INSERT INTO public.orders (user_id, package_name, amount, status, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT DO NOTHING`,
        [order.profile_id, order.package_name, order.amount, order.status],
      );
    }
  }

  // Seed sample payments for existing profiles
  if (existingProfileIds.length > 0) {
    const payments = [
      {
        profile_id: existingProfileIds[0],
        amount: 19999,
        method: "card",
        status: "paid",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        amount: 24999,
        method: "mobile_banking",
        status: "pending",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        amount: 24999,
        method: "card",
        status: "paid",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        amount: 44999,
        method: "bank_transfer",
        status: "paid",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        amount: 49999,
        method: "card",
        status: "pending",
      },
      {
        profile_id:
          existingProfileIds[
            Math.floor(Math.random() * existingProfileIds.length)
          ],
        amount: 12999,
        method: "mobile_banking",
        status: "paid",
      },
    ];

    for (const payment of payments) {
      await client.query(
        `INSERT INTO public.payments (user_id, amount, method, status, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT DO NOTHING`,
        [payment.profile_id, payment.amount, payment.method, payment.status],
      );
    }
  }
}

async function main() {
  await client.connect();
  try {
    console.log("🌱 Seeding database...\n");

    console.log("📦 Applying migrations...");
    await applyMigrations();

    console.log("\n📝 Seeding sample data...");
    await seedDatabase();

    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
