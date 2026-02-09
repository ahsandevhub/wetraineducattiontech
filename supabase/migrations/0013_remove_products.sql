-- Migration: Remove products system
-- Created: 2026-02-07
-- Description: Drop products, order_items tables and product_category enum

-- Drop order_items table first (has FK to products and orders)
DROP TABLE IF EXISTS public.order_items CASCADE;

-- Drop products table
DROP TABLE IF EXISTS public.products CASCADE;

-- Drop product_category enum
DROP TYPE IF EXISTS public.product_category CASCADE;
