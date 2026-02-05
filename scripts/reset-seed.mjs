import "dotenv/config";
import { Client } from "pg";

const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] ?? null;
};

const mode = getArg("--mode") || "data-only"; // data-only | full
const withAuth = args.includes("--with-auth");

const isProductionEnv =
  process.env.NODE_ENV === "production" ||
  process.env.SUPABASE_ENV === "production" ||
  process.env.VERCEL_ENV === "production" ||
  process.env.RESET_SEED_ENV === "production";

if (isProductionEnv) {
  throw new Error("Refusing to run in production environment.");
}

if (process.env.RESET_SEED_ALLOW !== "true") {
  throw new Error(
    "RESET_SEED_ALLOW must be set to true to run this script safely.",
  );
}

const databaseUrl = (process.env.DATABASE_URL || "").trim();

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

if (withAuth) {
  throw new Error(
    "--with-auth is disabled. Create demo users in Supabase Dashboard instead.",
  );
}

const seedUsers = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@wetrain.demo",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "nabila@wetrain.demo",
    name: "Nabila Rahman",
    role: "customer",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "farhan@wetrain.demo",
    name: "Farhan Ahmed",
    role: "customer",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "tania@wetrain.demo",
    name: "Tania Islam",
    role: "customer",
  },
];

const seedProfiles = [
  {
    fullName: "Admin User",
    phone: "+8801710000000",
    address: "House 10, Road 12",
    city: "Dhaka",
    state: "Dhaka",
    postalCode: "1207",
    country: "Bangladesh",
  },
  {
    fullName: "Nabila Rahman",
    phone: "+8801811111111",
    address: "22 Gulshan Ave",
    city: "Dhaka",
    state: "Dhaka",
    postalCode: "1212",
    country: "Bangladesh",
  },
  {
    fullName: "Farhan Ahmed",
    phone: "+8801912345678",
    address: "78 Agrabad",
    city: "Chattogram",
    state: "Chattogram",
    postalCode: "4100",
    country: "Bangladesh",
  },
  {
    fullName: "Tania Islam",
    phone: "+8801611122233",
    address: "15 Sonadanga",
    city: "Khulna",
    state: "Khulna",
    postalCode: "9100",
    country: "Bangladesh",
  },
];

const products = [
  // Marketing services
  {
    id: "aaaaaaaa-0000-0000-0000-000000000001",
    name: "WhatsApp Business Service",
    slug: "whatsapp-business-service",
    code: "MKT-WHATSAPP",
    category: "marketing",
    price: 9999,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000002",
    name: "Bulk SMS Service",
    slug: "bulk-sms-service",
    code: "MKT-SMS",
    category: "marketing",
    price: 0.25,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000003",
    name: "Digital Marketing Service",
    slug: "digital-marketing-service",
    code: "MKT-DIGITAL",
    category: "marketing",
    price: 19999,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000004",
    name: "WeSend - Delivery Management",
    slug: "wesend-delivery-management",
    code: "MKT-WESEND",
    category: "marketing",
    price: 14999,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000005",
    name: "Leadpilot - Lead Management",
    slug: "leadpilot-lead-management",
    code: "MKT-LEADPILOT",
    category: "marketing",
    price: 12999,
  },
  {
    id: "aaaaaaaa-0000-0000-0000-000000000006",
    name: "Influencer Marketing",
    slug: "influencer-marketing",
    code: "MKT-INFLUENCER",
    category: "marketing",
    price: null,
  },
  // IT services
  {
    id: "bbbbbbbb-0000-0000-0000-000000000001",
    name: "School Management System",
    slug: "school-management-system",
    code: "IT-SMS",
    category: "it",
    price: 49999,
  },
  {
    id: "bbbbbbbb-0000-0000-0000-000000000002",
    name: "E-Commerce Website",
    slug: "ecommerce-website",
    code: "IT-ECOM",
    category: "it",
    price: 39999,
  },
  {
    id: "bbbbbbbb-0000-0000-0000-000000000003",
    name: "Supershop POS System",
    slug: "supershop-pos-system",
    code: "IT-POS",
    category: "it",
    price: 35999,
  },
  {
    id: "bbbbbbbb-0000-0000-0000-000000000004",
    name: "Corporate Website",
    slug: "corporate-website",
    code: "IT-CORP",
    category: "it",
    price: 24999,
  },
  {
    id: "bbbbbbbb-0000-0000-0000-000000000005",
    name: "Custom Software Solution",
    slug: "custom-software-solution",
    code: "IT-CUSTOM",
    category: "it",
    price: null,
  },
  {
    id: "bbbbbbbb-0000-0000-0000-000000000006",
    name: "Web Application Development",
    slug: "web-application-development",
    code: "IT-WEBAPP",
    category: "it",
    price: 59999,
  },
  // Courses
  {
    id: "cccccccc-0000-0000-0000-000000000001",
    name: "Full-Stack Web Development",
    slug: "full-stack-web-development",
    code: "CRS-FULLSTACK",
    category: "course",
    price: 15999,
  },
  {
    id: "cccccccc-0000-0000-0000-000000000002",
    name: "Digital Marketing Mastery",
    slug: "digital-marketing-mastery",
    code: "CRS-DMARK",
    category: "course",
    price: 12999,
  },
  {
    id: "cccccccc-0000-0000-0000-000000000003",
    name: "Professional Graphic Design",
    slug: "professional-graphic-design",
    code: "CRS-GRAPHIC",
    category: "course",
    price: 13999,
  },
  {
    id: "cccccccc-0000-0000-0000-000000000004",
    name: "Python for Data Science",
    slug: "python-for-data-science",
    code: "CRS-PYTHON",
    category: "course",
    price: 14999,
  },
  {
    id: "cccccccc-0000-0000-0000-000000000005",
    name: "Business Management & Strategy",
    slug: "business-management-strategy",
    code: "CRS-BIZ",
    category: "course",
    price: 11999,
  },
  {
    id: "cccccccc-0000-0000-0000-000000000006",
    name: "Mobile App Development",
    slug: "mobile-app-development",
    code: "CRS-MOBILE",
    category: "course",
    price: 16999,
  },
  // Challenge packages
  {
    id: "dddddddd-0000-0000-0000-000000000001",
    name: "Starter Challenge Package",
    slug: "starter-challenge-package",
    code: "CHL-STARTER",
    category: "challenge",
    price: 3999,
  },
  {
    id: "dddddddd-0000-0000-0000-000000000002",
    name: "Professional Challenge Package",
    slug: "professional-challenge-package",
    code: "CHL-PRO",
    category: "challenge",
    price: 9999,
  },
  {
    id: "dddddddd-0000-0000-0000-000000000003",
    name: "Enterprise Challenge Package",
    slug: "enterprise-challenge-package",
    code: "CHL-ENT",
    category: "challenge",
    price: null,
  },
];

const orders = [
  {
    id: "eeeeeeee-0000-0000-0000-000000000001",
    orderNo: "ORD-1001",
    userIndex: 1,
    packageName: "WhatsApp Business Service",
    amount: 9999,
    status: "completed",
    productId: "aaaaaaaa-0000-0000-0000-000000000001",
  },
  {
    id: "eeeeeeee-0000-0000-0000-000000000002",
    orderNo: "ORD-1002",
    userIndex: 2,
    packageName: "Full-Stack Web Development",
    amount: 15999,
    status: "processing",
    productId: "cccccccc-0000-0000-0000-000000000001",
  },
  {
    id: "eeeeeeee-0000-0000-0000-000000000003",
    orderNo: "ORD-1003",
    userIndex: 0,
    packageName: "School Management System",
    amount: 49999,
    status: "completed",
    productId: "bbbbbbbb-0000-0000-0000-000000000001",
  },
  {
    id: "eeeeeeee-0000-0000-0000-000000000004",
    orderNo: "ORD-1004",
    userIndex: 3,
    packageName: "Professional Challenge Package",
    amount: 9999,
    status: "pending",
    productId: "dddddddd-0000-0000-0000-000000000002",
  },
];

const payments = [
  {
    id: "ffffffff-0000-0000-0000-000000000001",
    userIndex: 1,
    amount: 9999,
    method: "bkash",
    provider: "bkash",
    service: "WhatsApp Business Service",
    status: "paid",
    reference: "BKASH-1001",
  },
  {
    id: "ffffffff-0000-0000-0000-000000000002",
    userIndex: 2,
    amount: 15999,
    method: "nagad",
    provider: "nagad",
    service: "Full-Stack Web Development",
    status: "pending",
    reference: "NAGAD-1002",
  },
  {
    id: "ffffffff-0000-0000-0000-000000000003",
    userIndex: 0,
    amount: 49999,
    method: "bank",
    provider: "bank",
    service: "School Management System",
    status: "paid",
    reference: "BANK-1003",
  },
  {
    id: "ffffffff-0000-0000-0000-000000000004",
    userIndex: 3,
    amount: 9999,
    method: "card",
    provider: "card",
    service: "Professional Challenge Package",
    status: "failed",
    reference: "CARD-1004",
  },
];

async function getExistingAuthUsers(client) {
  const { rows } = await client.query(
    "select id, email from auth.users order by created_at asc limit 5;",
  );
  return rows.map((row) => ({ id: row.id, email: row.email }));
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log("\nReset + seed starting...");
    console.log(`Mode: ${mode}`);
    console.log(`With auth: ${withAuth ? "yes" : "no"}`);

    await client.query(
      "truncate table public.order_items, public.orders, public.payments, public.products, public.profiles restart identity cascade;",
    );

    if (mode === "full") {
      await client.query("delete from auth.users;");
    }

    const authUsers = await getExistingAuthUsers(client);

    if (!authUsers.length) {
      throw new Error(
        "No auth users available. Create users first in Supabase Auth.",
      );
    }

    for (let index = 0; index < authUsers.length; index += 1) {
      const user = authUsers[index];
      const profile = seedProfiles[index % seedProfiles.length];
      const role = seedUsers[index]?.role || "customer";

      await client.query(
        `insert into public.profiles
          (id, email, full_name, phone, avatar_url, role, address, city, state, postal_code, country, created_at, updated_at)
         values
          ($1, $2, $3, $4, null, $5, $6, $7, $8, $9, $10, now(), now())
         on conflict (id) do update set
          email = excluded.email,
          full_name = excluded.full_name,
          phone = excluded.phone,
          role = excluded.role,
          address = excluded.address,
          city = excluded.city,
          state = excluded.state,
          postal_code = excluded.postal_code,
          country = excluded.country,
          updated_at = now();`,
        [
          user.id,
          user.email,
          profile.fullName,
          profile.phone,
          role,
          profile.address,
          profile.city,
          profile.state,
          profile.postalCode,
          profile.country,
        ],
      );
    }

    for (const product of products) {
      await client.query(
        `insert into public.products
          (id, name, slug, code, category, price, currency, created_at, updated_at)
         values
          ($1, $2, $3, $4, $5, $6, 'BDT', now(), now())
         on conflict (slug) do update set
          name = excluded.name,
          code = excluded.code,
          category = excluded.category,
          price = excluded.price,
          currency = excluded.currency,
          updated_at = now();`,
        [
          product.id,
          product.name,
          product.slug,
          product.code,
          product.category,
          product.price,
        ],
      );
    }

    for (const order of orders) {
      const user = authUsers[order.userIndex % authUsers.length];
      await client.query(
        `insert into public.orders
          (id, user_id, order_no, package_name, amount, status, currency, created_at, updated_at)
         values
          ($1, $2, $3, $4, $5, $6, 'BDT', now(), now())
         on conflict (order_no) do update set
          package_name = excluded.package_name,
          amount = excluded.amount,
          status = excluded.status,
          currency = excluded.currency,
          updated_at = now();`,
        [
          order.id,
          user.id,
          order.orderNo,
          order.packageName,
          order.amount,
          order.status,
        ],
      );

      await client.query(
        `insert into public.order_items
          (id, order_id, product_id, quantity, unit_price, created_at, updated_at)
         values
          (gen_random_uuid(), $1, $2, $3, $4, now(), now())
         on conflict (order_id, product_id) do update set
          quantity = excluded.quantity,
          unit_price = excluded.unit_price,
          updated_at = now();`,
        [order.id, order.productId, 1, order.amount],
      );
    }

    for (const payment of payments) {
      const user = authUsers[payment.userIndex % authUsers.length];
      await client.query(
        `insert into public.payments
          (id, user_id, amount, method, provider, service, status, reference, currency, created_at, updated_at)
         values
          ($1, $2, $3, $4, $5, $6, $7, $8, 'BDT', now(), now())
         on conflict (id) do update set
          amount = excluded.amount,
          method = excluded.method,
          provider = excluded.provider,
          service = excluded.service,
          status = excluded.status,
          reference = excluded.reference,
          currency = excluded.currency,
          updated_at = now();`,
        [
          payment.id,
          user.id,
          payment.amount,
          payment.method,
          payment.provider,
          payment.service,
          payment.status,
          payment.reference,
        ],
      );
    }

    const { rows } = await client.query(
      `select
        (select count(*)::int from public.profiles) as profiles,
        (select count(*)::int from public.products) as products,
        (select count(*)::int from public.orders) as orders,
        (select count(*)::int from public.order_items) as order_items,
        (select count(*)::int from public.payments) as payments;`,
    );

    console.log("\nSeed complete. Counts:");
    console.table(rows[0]);
    console.log("\nDone.");
  } catch (error) {
    console.error("Reset + seed failed:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
