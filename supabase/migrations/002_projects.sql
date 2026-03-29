-- ============================================================
-- Migration 002: Projects
-- ============================================================
-- Creates the projects table that stores each site generation
-- project with its type, pipeline stage, and status.
-- Includes Row Level Security so users can only access their
-- own projects.
-- ============================================================

-- Create custom enum types for constrained fields
CREATE TYPE public.page_type AS ENUM (
    'landing',
    'sales',
    'squeeze',
    'webinar',
    'thankyou'
);

CREATE TYPE public.pipeline_stage AS ENUM (
    'briefing',
    'research',
    'strategy',
    'copy',
    'design',
    'code',
    'review',
    'deploy'
);

CREATE TYPE public.project_status AS ENUM (
    'draft',
    'generating',
    'review',
    'published'
);

-- Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    page_type public.page_type NOT NULL DEFAULT 'landing',
    pipeline_stage public.pipeline_stage NOT NULL DEFAULT 'briefing',
    status public.project_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a comment describing the table
COMMENT ON TABLE public.projects IS 'Stores site generation projects. Each project represents one page being created through the pipeline.';

-- Create an index on user_id for faster lookups
CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- Create an index on status for filtering
CREATE INDEX idx_projects_status ON public.projects(status);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own projects
CREATE POLICY "Users can view their own projects"
    ON public.projects
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create projects for themselves
CREATE POLICY "Users can create their own projects"
    ON public.projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own projects
CREATE POLICY "Users can update their own projects"
    ON public.projects
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own projects
CREATE POLICY "Users can delete their own projects"
    ON public.projects
    FOR DELETE
    USING (auth.uid() = user_id);

-- Attach the updated_at trigger (function created in 001_users.sql)
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
