-- Grant full access to orders and payments tables for authenticated users
-- This is required when RLS is disabled - standard PostgreSQL permissions apply

-- Grant all permissions on orders table
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT SELECT ON public.orders TO anon;

-- Grant all permissions on payments table
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
GRANT SELECT ON public.payments TO anon;

-- Also grant sequence permissions if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
