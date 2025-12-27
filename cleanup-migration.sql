-- ============================================
-- Cleanup Migration: Remove Backup Tables and Orphaned Mux Function
-- Run this in Supabase SQL Editor
-- ============================================
-- 
-- This migration removes:
-- 1. Backup tables created during Mux->IVS migration (security issue: no RLS)
-- 2. Orphaned Mux webhook function (no longer used)
--
-- Date: 2025-12-22
-- Related: migrate-to-ivs.sql

-- Drop backup tables (they don't have RLS enabled, which is a security issue)
DROP TABLE IF EXISTS events_backup CASCADE;
DROP TABLE IF EXISTS submissions_backup CASCADE;

-- Drop orphaned Mux webhook function (no longer used after migration to IVS)
DROP FUNCTION IF EXISTS public.update_submission_from_mux_webhook CASCADE;

-- Verify cleanup
SELECT 
  'Backup tables and Mux function removed successfully' as status;

