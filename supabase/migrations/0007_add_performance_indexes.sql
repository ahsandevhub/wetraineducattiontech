-- Add performance indexes to prevent query timeouts and improve RLS performance

-- Orders table indexes
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at_desc on public.orders(created_at desc);

-- Payments table indexes
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_method on public.payments(method);
create index if not exists idx_payments_created_at_desc on public.payments(created_at desc);

-- Profiles table indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_created_at_desc on public.profiles(created_at desc);

-- Order items table indexes (if exists)
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- Products table indexes (if exists)
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_code on public.products(code);
create index if not exists idx_products_category on public.products(category);
