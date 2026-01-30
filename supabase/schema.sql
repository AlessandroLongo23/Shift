-- ============================================
-- SHIFT - Career & Job Tracking Application
-- Database Schema for Supabase
-- ============================================
-- 
-- Execute this SQL in your Supabase SQL Editor
-- to create the required tables and policies.
--
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES TABLE
-- Stores employer/company details
-- ============================================
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    color_theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- ============================================
-- POSITIONS TABLE
-- Stores job roles/positions linked to companies
-- ============================================
CREATE TABLE positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    contract_type TEXT CHECK (contract_type IN ('full-time', 'part-time', 'freelance')),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL implies 'current position'
    base_salary NUMERIC,
    currency TEXT DEFAULT 'EUR',
    description TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_company_id ON positions(company_id);
CREATE INDEX idx_positions_start_date ON positions(start_date DESC);

-- ============================================
-- WORK_LOGS TABLE
-- Daily logs for hours, leave, mood
-- ============================================
CREATE TABLE work_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    hours_worked NUMERIC DEFAULT 0,
    type TEXT CHECK (type IN ('work', 'vacation', 'sick_leave', 'permit')),
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one log per day per position
    UNIQUE(position_id, date)
);

-- Indexes for faster lookups
CREATE INDEX idx_work_logs_user_id ON work_logs(user_id);
CREATE INDEX idx_work_logs_position_id ON work_logs(position_id);
CREATE INDEX idx_work_logs_date ON work_logs(date DESC);

-- ============================================
-- PAYCHECKS TABLE
-- Monthly salary records with PDF references
-- ============================================
CREATE TABLE paychecks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE NOT NULL,
    reference_date DATE NOT NULL, -- Represents the month/year (use 1st of month)
    net_amount NUMERIC NOT NULL,
    gross_amount NUMERIC,
    bonuses NUMERIC DEFAULT 0,
    pdf_storage_path TEXT,
    is_synced_to_budget BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one paycheck per month per position
    UNIQUE(position_id, reference_date)
);

-- Indexes for faster lookups
CREATE INDEX idx_paychecks_user_id ON paychecks(user_id);
CREATE INDEX idx_paychecks_position_id ON paychecks(position_id);
CREATE INDEX idx_paychecks_reference_date ON paychecks(reference_date DESC);
CREATE INDEX idx_paychecks_sync_status ON paychecks(is_synced_to_budget) WHERE is_synced_to_budget = TRUE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE paychecks ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own companies"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
    ON companies FOR DELETE
    USING (auth.uid() = user_id);

-- Positions policies
CREATE POLICY "Users can view their own positions"
    ON positions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own positions"
    ON positions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions"
    ON positions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own positions"
    ON positions FOR DELETE
    USING (auth.uid() = user_id);

-- Work logs policies
CREATE POLICY "Users can view their own work logs"
    ON work_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work logs"
    ON work_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work logs"
    ON work_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work logs"
    ON work_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Paychecks policies
CREATE POLICY "Users can view their own paychecks"
    ON paychecks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own paychecks"
    ON paychecks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own paychecks"
    ON paychecks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own paychecks"
    ON paychecks FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET
-- For paycheck PDFs
-- ============================================
-- Run this in the Storage section or via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('paychecks', 'paychecks', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the paychecks bucket
CREATE POLICY "Users can upload their own paychecks"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'paychecks' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own paychecks"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'paychecks' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own paychecks"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'paychecks' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- DATABASE WEBHOOK (for FinTrack integration)
-- ============================================
-- 
-- To enable the FinTrack sync, create a Database Webhook
-- in your Supabase dashboard:
--
-- 1. Go to Database > Webhooks
-- 2. Create a new webhook with:
--    - Name: sync-to-fintrack
--    - Table: paychecks
--    - Events: INSERT, UPDATE
--    - HTTP Request: POST to your Edge Function URL
--    - Filter: is_synced_to_budget = true
--
-- The Edge Function code is in: supabase/functions/sync-to-fintrack/index.ts
-- ============================================
