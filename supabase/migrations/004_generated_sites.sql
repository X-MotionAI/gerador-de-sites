-- ============================================================
-- Migration 004: Generated Sites
-- ============================================================
-- Stores the final generated site output for each project,
-- including the full HTML content, design tokens, sharing
-- configuration, and SEO metadata.
-- Row Level Security allows owners full control and public
-- read access for sites marked as public.
-- ============================================================

-- Create the generated_sites table
CREATE TABLE IF NOT EXISTS public.generated_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    html_content TEXT NOT NULL DEFAULT '',
    design_tokens JSONB DEFAULT '{}'::jsonb,
    share_slug TEXT UNIQUE,
    is_public BOOLEAN NOT NULL DEFAULT false,
    og_image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a comment describing the table
COMMENT ON TABLE public.generated_sites IS 'Stores the final generated HTML site, design tokens, sharing slug, and SEO metadata for each project.';

-- Create an index on project_id for faster lookups
CREATE INDEX idx_generated_sites_project_id ON public.generated_sites(project_id);

-- Create an index on share_slug for public page lookups
CREATE INDEX idx_generated_sites_share_slug ON public.generated_sites(share_slug);

-- Enable Row Level Security
ALTER TABLE public.generated_sites ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view their own generated sites
CREATE POLICY "Owners can view their own generated sites"
    ON public.generated_sites
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_sites.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Anyone can view public generated sites
CREATE POLICY "Anyone can view public generated sites"
    ON public.generated_sites
    FOR SELECT
    USING (is_public = true);

-- Policy: Owners can insert generated sites for their projects
CREATE POLICY "Owners can insert generated sites"
    ON public.generated_sites
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_sites.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Owners can update their own generated sites
CREATE POLICY "Owners can update their own generated sites"
    ON public.generated_sites
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_sites.project_id
              AND projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_sites.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Owners can delete their own generated sites
CREATE POLICY "Owners can delete their own generated sites"
    ON public.generated_sites
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_sites.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Attach the updated_at trigger (function created in 001_users.sql)
CREATE TRIGGER set_generated_sites_updated_at
    BEFORE UPDATE ON public.generated_sites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
