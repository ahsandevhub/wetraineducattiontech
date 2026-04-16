-- Compact local development seed for WeTrainEducation & Tech
-- Purpose: enough realistic data to test Landing, Education, CRM, HRM, and Store
-- Sample password for all seeded accounts: Seed@1234!

SET session_replication_role = replica;
SET row_security = off;

BEGIN;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, phone_change, phone_change_token,
  email_change_token_current, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('00000000-0000-0000-0000-000000000000','43a33217-066a-4d28-b71a-4d7b092162b4','authenticated','authenticated','hrm.super@seed.local','$2a$10$U2w326z6xiNgCoQw4qjBd.iQ73KrdDcsUvTPL9boBToIuRcFaOBEe','2026-04-16 00:00:00+00','','','','','','','','','{"provider":"email","providers":["email"]}','{"full_name":"Super Admin (Seed)","email_verified":true}','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000000','5b356628-dc05-44d3-909a-71c6955bf0e0','authenticated','authenticated','crm.admin@seed.local','$2a$10$ykx5XBk3lOY0NcV9iGZOVOyDej7RL1zjQ8mKpiPqqVJOdJINODiOa','2026-04-16 00:00:00+00','','','','','','','','','{"provider":"email","providers":["email"]}','{"full_name":"CRM Admin (Seed)","email_verified":true}','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000000','8d198822-3d59-40c8-99e3-512bfe50faeb','authenticated','authenticated','crm.marketer1@seed.local','$2a$10$1ujAPWwQY57s9YIJIsWZmOoyGK8fejFMiapHnOjCcJhuAJJl2gNCC','2026-04-16 00:00:00+00','','','','','','','','','{"provider":"email","providers":["email"]}','{"full_name":"Marketer One (Seed)","email_verified":true}','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000000','dbbf2e82-144b-4c12-be34-e81007a5844f','authenticated','authenticated','hrm.admin1@seed.local','$2a$10$j7xvBTQBtEjqPlRWUMclTuGMbdOCDy0dtt5WIqfW.1m.SkW9Gy1Uy','2026-04-16 00:00:00+00','','','','','','','','','{"provider":"email","providers":["email"]}','{"full_name":"HRM Admin One (Seed)","email_verified":true}','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000000','e4fd55ea-2785-4a49-b847-071d6bffa6f3','authenticated','authenticated','hrm.employee1@seed.local','$2a$10$Nf1GRs6Tl0TmuOeMfqFQwefTRrdsMdHCY3tMjzqqStRU4729jXkc.','2026-04-16 00:00:00+00','','','','','','','','','{"provider":"email","providers":["email"]}','{"full_name":"Employee One (Seed)","email_verified":true}','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000000','11111111-1111-4111-8111-111111111111','authenticated','authenticated','customer@seed.local','$2a$10$U2w326z6xiNgCoQw4qjBd.iQ73KrdDcsUvTPL9boBToIuRcFaOBEe','2026-04-16 00:00:00+00','','','','','','','','','{"provider":"email","providers":["email"]}','{"full_name":"Customer Demo (Seed)","email_verified":true}','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000000','22222222-2222-4222-8222-222222222222','authenticated','authenticated','store.user@seed.local','$2a$10$U2w326z6xiNgCoQw4qjBd.iQ73KrdDcsUvTPL9boBToIuRcFaOBEe','2026-04-16 00:00:00+00','','','','','','','','','{"provider":"email","providers":["email"]}','{"full_name":"Store User (Seed)","email_verified":true}','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00')
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = EXCLUDED.updated_at;

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider, created_at, updated_at
)
VALUES
  ('90000000-0000-4000-8000-000000000001','43a33217-066a-4d28-b71a-4d7b092162b4','43a33217-066a-4d28-b71a-4d7b092162b4','{"sub":"43a33217-066a-4d28-b71a-4d7b092162b4","email":"hrm.super@seed.local","email_verified":true}','email','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('90000000-0000-4000-8000-000000000002','5b356628-dc05-44d3-909a-71c6955bf0e0','5b356628-dc05-44d3-909a-71c6955bf0e0','{"sub":"5b356628-dc05-44d3-909a-71c6955bf0e0","email":"crm.admin@seed.local","email_verified":true}','email','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('90000000-0000-4000-8000-000000000003','8d198822-3d59-40c8-99e3-512bfe50faeb','8d198822-3d59-40c8-99e3-512bfe50faeb','{"sub":"8d198822-3d59-40c8-99e3-512bfe50faeb","email":"crm.marketer1@seed.local","email_verified":true}','email','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('90000000-0000-4000-8000-000000000004','dbbf2e82-144b-4c12-be34-e81007a5844f','dbbf2e82-144b-4c12-be34-e81007a5844f','{"sub":"dbbf2e82-144b-4c12-be34-e81007a5844f","email":"hrm.admin1@seed.local","email_verified":true}','email','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('90000000-0000-4000-8000-000000000005','e4fd55ea-2785-4a49-b847-071d6bffa6f3','e4fd55ea-2785-4a49-b847-071d6bffa6f3','{"sub":"e4fd55ea-2785-4a49-b847-071d6bffa6f3","email":"hrm.employee1@seed.local","email_verified":true}','email','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('90000000-0000-4000-8000-000000000006','11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','{"sub":"11111111-1111-4111-8111-111111111111","email":"customer@seed.local","email_verified":true}','email','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00'),
  ('90000000-0000-4000-8000-000000000007','22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222','{"sub":"22222222-2222-4222-8222-222222222222","email":"store.user@seed.local","email_verified":true}','email','2026-04-16 00:00:00+00','2026-04-16 00:00:00+00')
ON CONFLICT (id) DO UPDATE
SET identity_data = EXCLUDED.identity_data,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.profiles (id, full_name, phone, role, email, city, country, created_at, updated_at)
VALUES
  ('43a33217-066a-4d28-b71a-4d7b092162b4','Super Admin (Seed)','8801700000001','admin','hrm.super@seed.local','Dhaka','Bangladesh',now(),now()),
  ('5b356628-dc05-44d3-909a-71c6955bf0e0','CRM Admin (Seed)','8801700000002','admin','crm.admin@seed.local','Dhaka','Bangladesh',now(),now()),
  ('8d198822-3d59-40c8-99e3-512bfe50faeb','Marketer One (Seed)','8801700000003','customer','crm.marketer1@seed.local','Chattogram','Bangladesh',now(),now()),
  ('dbbf2e82-144b-4c12-be34-e81007a5844f','HRM Admin One (Seed)','8801700000004','admin','hrm.admin1@seed.local','Rajshahi','Bangladesh',now(),now()),
  ('e4fd55ea-2785-4a49-b847-071d6bffa6f3','Employee One (Seed)','8801700000005','customer','hrm.employee1@seed.local','Khulna','Bangladesh',now(),now()),
  ('11111111-1111-4111-8111-111111111111','Customer Demo (Seed)','8801700000006','customer','customer@seed.local','Dhaka','Bangladesh',now(),now()),
  ('22222222-2222-4222-8222-222222222222','Store User (Seed)','8801700000007','customer','store.user@seed.local','Dhaka','Bangladesh',now(),now())
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    updated_at = now();

INSERT INTO public.services (id, title, slug, category, price, currency, details, key_features, featured_image_url, created_at, updated_at)
VALUES
  ('10000000-0000-4000-8000-000000000001','Complete Web Development Bootcamp','web-development-bootcamp','course',24999,'BDT','Hands-on full-stack training for beginners.',ARRAY['HTML','React','Node.js','Supabase'],'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',now(),now()),
  ('10000000-0000-4000-8000-000000000002','Digital Marketing Service','digital-marketing-service','marketing',19999,'BDT','Campaign strategy, creatives, and reporting for growth.',ARRAY['SEO','Ads','Content','Analytics'],'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',now(),now()),
  ('10000000-0000-4000-8000-000000000003','School Management System','school-management-system','software',49999,'BDT','Admin, attendance, reports, and parent portal in one system.',ARRAY['Students','Attendance','Billing','Reports'],'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200',now(),now()),
  ('10000000-0000-4000-8000-000000000004','WhatsApp Business Service','whatsapp-business-service','marketing',9999,'BDT','Managed WhatsApp outreach with templates and scheduling.',ARRAY['Broadcasts','Templates','Analytics'],'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1200',now(),now())
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    details = EXCLUDED.details,
    key_features = EXCLUDED.key_features,
    featured_image_url = EXCLUDED.featured_image_url,
    updated_at = now();

INSERT INTO public.featured_projects (id, title, slug, category, description, tech_stack, featured_image_url, live_url, github_url, created_at, updated_at)
VALUES
  ('10000000-0000-4000-8000-000000000101','Learning Portal','learning-portal','education','A modern education portal with course sales and dashboards.',ARRAY['Next.js','Supabase','Tailwind'],'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200','https://example.com/demo-learning','https://github.com/example/learning',now(),now()),
  ('10000000-0000-4000-8000-000000000102','Store Operations Dashboard','store-ops-dashboard','internal-tools','Internal store, reporting, and stock management workflow.',ARRAY['Next.js','Postgres','Charts'],'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200','https://example.com/demo-store','https://github.com/example/store',now(),now())
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    tech_stack = EXCLUDED.tech_stack,
    featured_image_url = EXCLUDED.featured_image_url,
    live_url = EXCLUDED.live_url,
    github_url = EXCLUDED.github_url,
    updated_at = now();

INSERT INTO public.certifications (id, title, issuer, issued_at, description, credential_id, verify_url, image_url, created_at, updated_at)
VALUES
  ('10000000-0000-4000-8000-000000000201','Advanced Web Development','WeTrain Education','2026-01','Project-based full-stack completion certificate.','WTE-AWD-001','https://example.com/verify/awd-001','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',now(),now()),
  ('10000000-0000-4000-8000-000000000202','Digital Marketing Specialist','WeTrain Education','2026-02','Certification for digital marketing campaigns and reporting.','WTE-DMS-002','https://example.com/verify/dms-002','https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',now(),now())
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    issuer = EXCLUDED.issuer,
    issued_at = EXCLUDED.issued_at,
    description = EXCLUDED.description,
    credential_id = EXCLUDED.credential_id,
    verify_url = EXCLUDED.verify_url,
    image_url = EXCLUDED.image_url,
    updated_at = now();

INSERT INTO public.client_stories (id, name, role, quote, achievement, rating, image_url, created_at, updated_at)
VALUES
  ('10000000-0000-4000-8000-000000000301','Nusrat Jahan','Business Owner','The training and support helped us launch faster than expected.','Scaled online enrollments in 6 weeks',5,'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200',now(),now()),
  ('10000000-0000-4000-8000-000000000302','Tanvir Ahmed','Operations Lead','The team delivered a practical system we could use from day one.','Improved internal workflow visibility',5,'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200',now(),now())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    quote = EXCLUDED.quote,
    achievement = EXCLUDED.achievement,
    rating = EXCLUDED.rating,
    image_url = EXCLUDED.image_url,
    updated_at = now();

INSERT INTO public.orders (id, user_id, package_name, amount, status, currency, created_at, updated_at, order_no)
VALUES
  ('20000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','Complete Web Development Bootcamp',24999,'completed','BDT',now() - interval '10 days',now() - interval '9 days','ORD-SEED-001'),
  ('20000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','Digital Marketing Service',19999,'pending','BDT',now() - interval '2 days',now() - interval '1 day','ORD-SEED-002')
ON CONFLICT (id) DO UPDATE
SET user_id = EXCLUDED.user_id,
    package_name = EXCLUDED.package_name,
    amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    currency = EXCLUDED.currency,
    updated_at = EXCLUDED.updated_at,
    order_no = EXCLUDED.order_no;

INSERT INTO public.payments (id, user_id, amount, method, status, reference, provider, service, currency, created_at, updated_at)
VALUES
  ('20000000-0000-4000-8000-000000000101','11111111-1111-4111-8111-111111111111',24999,'Card','paid','pi_seed_paid_001','stripe','Complete Web Development Bootcamp','BDT',now() - interval '10 days',now() - interval '9 days'),
  ('20000000-0000-4000-8000-000000000102','11111111-1111-4111-8111-111111111111',19999,'Bank','pending','bank_seed_pending_002','manual','Digital Marketing Service','BDT',now() - interval '2 days',now() - interval '1 day')
ON CONFLICT (id) DO UPDATE
SET user_id = EXCLUDED.user_id,
    amount = EXCLUDED.amount,
    method = EXCLUDED.method,
    status = EXCLUDED.status,
    reference = EXCLUDED.reference,
    provider = EXCLUDED.provider,
    service = EXCLUDED.service,
    currency = EXCLUDED.currency,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.crm_users (id, crm_role, created_at, updated_at)
VALUES
  ('43a33217-066a-4d28-b71a-4d7b092162b4','ADMIN',now(),now()),
  ('5b356628-dc05-44d3-909a-71c6955bf0e0','ADMIN',now(),now()),
  ('8d198822-3d59-40c8-99e3-512bfe50faeb','MARKETER',now(),now())
ON CONFLICT (id) DO UPDATE
SET crm_role = EXCLUDED.crm_role,
    updated_at = now();

INSERT INTO public.crm_leads (id, name, email, phone, company, owner_id, notes, status, source, created_by, created_at, updated_at)
VALUES
  ('30000000-0000-4000-8000-000000000001','Rahim Uddin','rahim@example.com','8801711000001','Rahim Traders','8d198822-3d59-40c8-99e3-512bfe50faeb','Interested in the marketing package.','NEW','WEBSITE','5b356628-dc05-44d3-909a-71c6955bf0e0',now() - interval '7 days',now()),
  ('30000000-0000-4000-8000-000000000002','Sumaiya Akter','sumaiya@example.com','8801711000002','Sumaiya Boutique','8d198822-3d59-40c8-99e3-512bfe50faeb','Needs a follow-up call next week.','CONTACTED','REFERRAL','5b356628-dc05-44d3-909a-71c6955bf0e0',now() - interval '6 days',now()),
  ('30000000-0000-4000-8000-000000000003','Tanvir Ahmed','tanvir@example.com','8801711000003','Tanvir IT Solutions','5b356628-dc05-44d3-909a-71c6955bf0e0','Requested a product demo.','INTERESTED','SOCIAL_MEDIA','43a33217-066a-4d28-b71a-4d7b092162b4',now() - interval '4 days',now()),
  ('30000000-0000-4000-8000-000000000004','Nasrin Islam','nasrin@example.com','8801711000004','Islam Academy','8d198822-3d59-40c8-99e3-512bfe50faeb','Converted to a paying client.','SOLD','ADMIN','43a33217-066a-4d28-b71a-4d7b092162b4',now() - interval '3 days',now())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    company = EXCLUDED.company,
    owner_id = EXCLUDED.owner_id,
    notes = EXCLUDED.notes,
    status = EXCLUDED.status,
    source = EXCLUDED.source,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO public.crm_contact_logs (id, lead_id, user_id, contact_type, notes, created_at, updated_at)
VALUES
  ('30000000-0000-4000-8000-000000000101','30000000-0000-4000-8000-000000000001','8d198822-3d59-40c8-99e3-512bfe50faeb','CALL','Initial discovery call completed.',now() - interval '6 days',now()),
  ('30000000-0000-4000-8000-000000000102','30000000-0000-4000-8000-000000000002','8d198822-3d59-40c8-99e3-512bfe50faeb','EMAIL','Shared the proposal and pricing sheet.',now() - interval '5 days',now()),
  ('30000000-0000-4000-8000-000000000103','30000000-0000-4000-8000-000000000004','5b356628-dc05-44d3-909a-71c6955bf0e0','NOTE','Lead marked as sold after confirmation.',now() - interval '2 days',now())
ON CONFLICT (id) DO UPDATE
SET lead_id = EXCLUDED.lead_id,
    user_id = EXCLUDED.user_id,
    contact_type = EXCLUDED.contact_type,
    notes = EXCLUDED.notes,
    updated_at = now();

INSERT INTO public.crm_lead_requests (id, requester_id, lead_payload, status, admin_note, reviewed_by, reviewed_at, lead_id, created_at, updated_at)
VALUES
  ('30000000-0000-4000-8000-000000000201','8d198822-3d59-40c8-99e3-512bfe50faeb','{"name":"Mitu Rahman","phone":"8801711999999","company":"Mitu Fashion House","source":"WEBSITE"}'::jsonb,'PENDING','Awaiting admin review.',null,null,null,now() - interval '1 day',now())
ON CONFLICT (id) DO UPDATE
SET requester_id = EXCLUDED.requester_id,
    lead_payload = EXCLUDED.lead_payload,
    status = EXCLUDED.status,
    admin_note = EXCLUDED.admin_note,
    reviewed_by = EXCLUDED.reviewed_by,
    reviewed_at = EXCLUDED.reviewed_at,
    lead_id = EXCLUDED.lead_id,
    updated_at = now();

INSERT INTO public.hrm_users (id, hrm_role, created_at, updated_at)
VALUES
  ('43a33217-066a-4d28-b71a-4d7b092162b4','SUPER_ADMIN',now(),now()),
  ('dbbf2e82-144b-4c12-be34-e81007a5844f','ADMIN',now(),now()),
  ('e4fd55ea-2785-4a49-b847-071d6bffa6f3','EMPLOYEE',now(),now())
ON CONFLICT (id) DO UPDATE
SET hrm_role = EXCLUDED.hrm_role,
    updated_at = now();

INSERT INTO public.hrm_criteria (id, key, name, default_scale_max, description, created_at, updated_at)
VALUES
  ('40000000-0000-4000-8000-000000000001','attendance','Attendance',10,'Attendance and punctuality',now(),now()),
  ('40000000-0000-4000-8000-000000000002','behavior','Behavior',10,'Professional conduct and teamwork',now(),now()),
  ('40000000-0000-4000-8000-000000000003','self_learning','Self Learning',10,'Initiative in learning new skills',now(),now()),
  ('40000000-0000-4000-8000-000000000004','task_productivity','Task Productivity',10,'Delivery quality and consistency',now(),now())
ON CONFLICT (id) DO UPDATE
SET key = EXCLUDED.key,
    name = EXCLUDED.name,
    default_scale_max = EXCLUDED.default_scale_max,
    description = EXCLUDED.description,
    updated_at = now();

INSERT INTO public.hrm_weeks (id, week_key, friday_date, status, created_at, updated_at)
VALUES
  ('40000000-0000-4000-8000-000000000101','2026-W16','2026-04-17','OPEN',now(),now())
ON CONFLICT (id) DO UPDATE
SET week_key = EXCLUDED.week_key,
    friday_date = EXCLUDED.friday_date,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO public.hrm_kpi_submissions (id, week_id, marker_admin_id, subject_user_id, total_score, comment, submitted_at, created_at, updated_at)
VALUES
  ('40000000-0000-4000-8000-000000000201','40000000-0000-4000-8000-000000000101','dbbf2e82-144b-4c12-be34-e81007a5844f','e4fd55ea-2785-4a49-b847-071d6bffa6f3',34.5,'Consistent progress and clean reporting.',now() - interval '1 day',now(),now())
ON CONFLICT (id) DO UPDATE
SET week_id = EXCLUDED.week_id,
    marker_admin_id = EXCLUDED.marker_admin_id,
    subject_user_id = EXCLUDED.subject_user_id,
    total_score = EXCLUDED.total_score,
    comment = EXCLUDED.comment,
    submitted_at = EXCLUDED.submitted_at,
    updated_at = now();

INSERT INTO public.hrm_kpi_submission_items (id, submission_id, criteria_id, score_raw, created_at, updated_at)
VALUES
  ('40000000-0000-4000-8000-000000000301','40000000-0000-4000-8000-000000000201','40000000-0000-4000-8000-000000000001',9,now(),now()),
  ('40000000-0000-4000-8000-000000000302','40000000-0000-4000-8000-000000000201','40000000-0000-4000-8000-000000000002',8.5,now(),now()),
  ('40000000-0000-4000-8000-000000000303','40000000-0000-4000-8000-000000000201','40000000-0000-4000-8000-000000000003',8,now(),now()),
  ('40000000-0000-4000-8000-000000000304','40000000-0000-4000-8000-000000000201','40000000-0000-4000-8000-000000000004',9,now(),now())
ON CONFLICT (id) DO UPDATE
SET submission_id = EXCLUDED.submission_id,
    criteria_id = EXCLUDED.criteria_id,
    score_raw = EXCLUDED.score_raw,
    updated_at = now();

INSERT INTO public.hrm_weekly_results (id, week_id, subject_user_id, weekly_avg_score, expected_markers_count, submitted_markers_count, is_complete, computed_at)
VALUES
  ('40000000-0000-4000-8000-000000000401','40000000-0000-4000-8000-000000000101','e4fd55ea-2785-4a49-b847-071d6bffa6f3',86.25,1,1,true,now())
ON CONFLICT (id) DO UPDATE
SET week_id = EXCLUDED.week_id,
    subject_user_id = EXCLUDED.subject_user_id,
    weekly_avg_score = EXCLUDED.weekly_avg_score,
    expected_markers_count = EXCLUDED.expected_markers_count,
    submitted_markers_count = EXCLUDED.submitted_markers_count,
    is_complete = EXCLUDED.is_complete,
    computed_at = EXCLUDED.computed_at;

INSERT INTO public.hrm_months (id, month_key, start_date, end_date, status, created_at, updated_at)
VALUES
  ('40000000-0000-4000-8000-000000000501','2026-04','2026-04-01','2026-04-30','OPEN',now(),now())
ON CONFLICT (id) DO UPDATE
SET month_key = EXCLUDED.month_key,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    updated_at = now();

INSERT INTO public.hrm_monthly_results (id, month_id, subject_user_id, monthly_score, tier, action_type, base_fine, month_fine_count, final_fine, gift_amount, computed_at)
VALUES
  ('40000000-0000-4000-8000-000000000601','40000000-0000-4000-8000-000000000501','e4fd55ea-2785-4a49-b847-071d6bffa6f3',86.25,'BONUS','BONUS',0,0,0,500,now())
ON CONFLICT (id) DO UPDATE
SET month_id = EXCLUDED.month_id,
    subject_user_id = EXCLUDED.subject_user_id,
    monthly_score = EXCLUDED.monthly_score,
    tier = EXCLUDED.tier,
    action_type = EXCLUDED.action_type,
    base_fine = EXCLUDED.base_fine,
    month_fine_count = EXCLUDED.month_fine_count,
    final_fine = EXCLUDED.final_fine,
    gift_amount = EXCLUDED.gift_amount,
    computed_at = EXCLUDED.computed_at;

INSERT INTO public.hrm_notifications (id, user_id, type, title, message, link, is_read, created_at)
VALUES
  ('40000000-0000-4000-8000-000000000701','e4fd55ea-2785-4a49-b847-071d6bffa6f3','MONTH_RESULT_READY','Monthly score published','Your latest HRM monthly result is ready to review.','/dashboard/hrm',false,now())
ON CONFLICT (id) DO UPDATE
SET user_id = EXCLUDED.user_id,
    type = EXCLUDED.type,
    title = EXCLUDED.title,
    message = EXCLUDED.message,
    link = EXCLUDED.link,
    is_read = EXCLUDED.is_read,
    created_at = EXCLUDED.created_at;

INSERT INTO public.hrm_task_reports (id, author_user_id, category, task_title, proof_url, notes, reported_at, updated_at)
VALUES
  ('40000000-0000-4000-8000-000000000801','e4fd55ea-2785-4a49-b847-071d6bffa6f3','Development','Prepared landing page content updates','https://example.com/proof/task-001','Seeded example report for QA testing.',now() - interval '12 hours',now())
ON CONFLICT (id) DO UPDATE
SET author_user_id = EXCLUDED.author_user_id,
    category = EXCLUDED.category,
    task_title = EXCLUDED.task_title,
    proof_url = EXCLUDED.proof_url,
    notes = EXCLUDED.notes,
    reported_at = EXCLUDED.reported_at,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.store_users (id, store_role, created_at, updated_at)
VALUES
  ('43a33217-066a-4d28-b71a-4d7b092162b4','ADMIN',now(),now()),
  ('22222222-2222-4222-8222-222222222222','USER',now(),now())
ON CONFLICT (id) DO UPDATE
SET store_role = EXCLUDED.store_role,
    updated_at = now();

INSERT INTO public.store_admin_permissions (user_id, permission_key, granted_by)
VALUES
  ('43a33217-066a-4d28-b71a-4d7b092162b4','owner_purchase_manage','43a33217-066a-4d28-b71a-4d7b092162b4'),
  ('43a33217-066a-4d28-b71a-4d7b092162b4','balance_add','43a33217-066a-4d28-b71a-4d7b092162b4'),
  ('43a33217-066a-4d28-b71a-4d7b092162b4','stock_manage','43a33217-066a-4d28-b71a-4d7b092162b4'),
  ('43a33217-066a-4d28-b71a-4d7b092162b4','product_manage','43a33217-066a-4d28-b71a-4d7b092162b4'),
  ('43a33217-066a-4d28-b71a-4d7b092162b4','invoice_manage','43a33217-066a-4d28-b71a-4d7b092162b4'),
  ('43a33217-066a-4d28-b71a-4d7b092162b4','permissions_manage','43a33217-066a-4d28-b71a-4d7b092162b4')
ON CONFLICT (user_id, permission_key) DO UPDATE
SET granted_by = EXCLUDED.granted_by,
    updated_at = now();

INSERT INTO public.store_products (id, name, sku, barcode, unit_price, is_active, tracks_stock, created_by, updated_by, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000001','Tea Box','SKU-TEA-001','100000000001',30,true,true,'43a33217-066a-4d28-b71a-4d7b092162b4','43a33217-066a-4d28-b71a-4d7b092162b4',now(),now()),
  ('50000000-0000-4000-8000-000000000002','Notebook','SKU-NOTE-001','100000000002',60,true,true,'43a33217-066a-4d28-b71a-4d7b092162b4','43a33217-066a-4d28-b71a-4d7b092162b4',now(),now()),
  ('50000000-0000-4000-8000-000000000003','Snacks Pack','SKU-SNACK-001','100000000003',45,true,true,'43a33217-066a-4d28-b71a-4d7b092162b4','43a33217-066a-4d28-b71a-4d7b092162b4',now(),now())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    unit_price = EXCLUDED.unit_price,
    is_active = EXCLUDED.is_active,
    tracks_stock = EXCLUDED.tracks_stock,
    updated_by = EXCLUDED.updated_by,
    updated_at = now();

INSERT INTO public.store_stock_entries (id, product_id, quantity, unit_cost, note, reference_type, reference_number, entered_by, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000101','50000000-0000-4000-8000-000000000001',40,18,'Initial testing stock','SEED','STOCK-001','43a33217-066a-4d28-b71a-4d7b092162b4',now(),now()),
  ('50000000-0000-4000-8000-000000000102','50000000-0000-4000-8000-000000000002',25,42,'Initial testing stock','SEED','STOCK-002','43a33217-066a-4d28-b71a-4d7b092162b4',now(),now()),
  ('50000000-0000-4000-8000-000000000103','50000000-0000-4000-8000-000000000003',30,28,'Initial testing stock','SEED','STOCK-003','43a33217-066a-4d28-b71a-4d7b092162b4',now(),now())
ON CONFLICT (id) DO UPDATE
SET product_id = EXCLUDED.product_id,
    quantity = EXCLUDED.quantity,
    unit_cost = EXCLUDED.unit_cost,
    note = EXCLUDED.note,
    reference_type = EXCLUDED.reference_type,
    reference_number = EXCLUDED.reference_number,
    entered_by = EXCLUDED.entered_by,
    updated_at = now();

INSERT INTO public.store_invoices (id, user_id, invoice_date, month_key, status, total_amount, confirmed_at, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000201','22222222-2222-4222-8222-222222222222','2026-04-16','2026-04-01','CONFIRMED',135,now(),now(),now())
ON CONFLICT (id) DO UPDATE
SET user_id = EXCLUDED.user_id,
    invoice_date = EXCLUDED.invoice_date,
    month_key = EXCLUDED.month_key,
    status = EXCLUDED.status,
    total_amount = EXCLUDED.total_amount,
    confirmed_at = EXCLUDED.confirmed_at,
    updated_at = now();

INSERT INTO public.store_invoice_items (id, invoice_id, product_id, quantity, unit_price, line_total, created_at)
VALUES
  ('50000000-0000-4000-8000-000000000301','50000000-0000-4000-8000-000000000201','50000000-0000-4000-8000-000000000001',1,30,30,now()),
  ('50000000-0000-4000-8000-000000000302','50000000-0000-4000-8000-000000000201','50000000-0000-4000-8000-000000000002',1,60,60,now()),
  ('50000000-0000-4000-8000-000000000303','50000000-0000-4000-8000-000000000201','50000000-0000-4000-8000-000000000003',1,45,45,now())
ON CONFLICT (id) DO UPDATE
SET invoice_id = EXCLUDED.invoice_id,
    product_id = EXCLUDED.product_id,
    quantity = EXCLUDED.quantity,
    unit_price = EXCLUDED.unit_price,
    line_total = EXCLUDED.line_total,
    created_at = EXCLUDED.created_at;

INSERT INTO public.store_stock_movements (id, product_id, stock_entry_id, invoice_item_id, reversed_from_movement_id, movement_type, quantity_delta, reason, actor_user_id, created_at)
VALUES
  ('50000000-0000-4000-8000-000000000401','50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000101',null,null,'RESTOCK',40,'Initial seed restock','43a33217-066a-4d28-b71a-4d7b092162b4',now()),
  ('50000000-0000-4000-8000-000000000402','50000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000102',null,null,'RESTOCK',25,'Initial seed restock','43a33217-066a-4d28-b71a-4d7b092162b4',now()),
  ('50000000-0000-4000-8000-000000000403','50000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000103',null,null,'RESTOCK',30,'Initial seed restock','43a33217-066a-4d28-b71a-4d7b092162b4',now()),
  ('50000000-0000-4000-8000-000000000404','50000000-0000-4000-8000-000000000001',null,'50000000-0000-4000-8000-000000000301',null,'SALE',-1,'Seed invoice sale','22222222-2222-4222-8222-222222222222',now()),
  ('50000000-0000-4000-8000-000000000405','50000000-0000-4000-8000-000000000002',null,'50000000-0000-4000-8000-000000000302',null,'SALE',-1,'Seed invoice sale','22222222-2222-4222-8222-222222222222',now()),
  ('50000000-0000-4000-8000-000000000406','50000000-0000-4000-8000-000000000003',null,'50000000-0000-4000-8000-000000000303',null,'SALE',-1,'Seed invoice sale','22222222-2222-4222-8222-222222222222',now())
ON CONFLICT (id) DO UPDATE
SET product_id = EXCLUDED.product_id,
    stock_entry_id = EXCLUDED.stock_entry_id,
    invoice_item_id = EXCLUDED.invoice_item_id,
    reversed_from_movement_id = EXCLUDED.reversed_from_movement_id,
    movement_type = EXCLUDED.movement_type,
    quantity_delta = EXCLUDED.quantity_delta,
    reason = EXCLUDED.reason,
    actor_user_id = EXCLUDED.actor_user_id,
    created_at = EXCLUDED.created_at;

INSERT INTO public.store_account_entries (id, user_id, entry_date, month_key, amount, category, reason, invoice_id, reversed_from_entry_id, created_by, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000501','22222222-2222-4222-8222-222222222222','2026-04-01','2026-04-01',600,'MONTHLY_ALLOCATION','Monthly cafeteria allocation',null,null,'43a33217-066a-4d28-b71a-4d7b092162b4',now(),now()),
  ('50000000-0000-4000-8000-000000000502','22222222-2222-4222-8222-222222222222','2026-04-16','2026-04-01',-135,'PURCHASE','Seed purchase invoice','50000000-0000-4000-8000-000000000201',null,'43a33217-066a-4d28-b71a-4d7b092162b4',now(),now())
ON CONFLICT (id) DO UPDATE
SET user_id = EXCLUDED.user_id,
    entry_date = EXCLUDED.entry_date,
    month_key = EXCLUDED.month_key,
    amount = EXCLUDED.amount,
    category = EXCLUDED.category,
    reason = EXCLUDED.reason,
    invoice_id = EXCLUDED.invoice_id,
    reversed_from_entry_id = EXCLUDED.reversed_from_entry_id,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO public.store_month_closures (id, month_key, status, opening_balance, closing_balance, closed_at, closed_by, note, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000601','2026-04-01','OPEN',600,null,null,null,'Current testing month',now(),now())
ON CONFLICT (id) DO UPDATE
SET month_key = EXCLUDED.month_key,
    status = EXCLUDED.status,
    opening_balance = EXCLUDED.opening_balance,
    closing_balance = EXCLUDED.closing_balance,
    closed_at = EXCLUDED.closed_at,
    closed_by = EXCLUDED.closed_by,
    note = EXCLUDED.note,
    updated_at = now();

INSERT INTO public.store_owner_purchases (id, purchase_date, month_key, title, amount, vendor, note, created_by, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000701','2026-04-10','2026-04-01','Bulk snack refill',1200,'Local Supplier','Owner purchase seed record for reporting.','43a33217-066a-4d28-b71a-4d7b092162b4',now(),now())
ON CONFLICT (id) DO UPDATE
SET purchase_date = EXCLUDED.purchase_date,
    month_key = EXCLUDED.month_key,
    title = EXCLUDED.title,
    amount = EXCLUDED.amount,
    vendor = EXCLUDED.vendor,
    note = EXCLUDED.note,
    created_by = EXCLUDED.created_by,
    updated_at = now();

INSERT INTO public.store_owner_month_closures (id, month_key, status, opening_amount, closing_amount, closed_at, closed_by, note, created_at, updated_at)
VALUES
  ('50000000-0000-4000-8000-000000000801','2026-04-01','OPEN',0,null,null,null,'Owner month kept open for dev testing.',now(),now())
ON CONFLICT (id) DO UPDATE
SET month_key = EXCLUDED.month_key,
    status = EXCLUDED.status,
    opening_amount = EXCLUDED.opening_amount,
    closing_amount = EXCLUDED.closing_amount,
    closed_at = EXCLUDED.closed_at,
    closed_by = EXCLUDED.closed_by,
    note = EXCLUDED.note,
    updated_at = now();

COMMIT;

SET session_replication_role = origin;
