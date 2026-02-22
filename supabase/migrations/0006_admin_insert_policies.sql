-- Allow admin users to insert orders/payments
DO $$
BEGIN
  CREATE POLICY "admin_insert_orders"
    ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "admin_insert_payments"
    ON public.payments
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
