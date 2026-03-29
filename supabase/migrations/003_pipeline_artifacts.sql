-- ============================================================
-- Migration 003: Pipeline Artifacts
-- ============================================================
-- Stores the output of each pipeline stage for a project.
-- Each artifact has a version number so the system can track
-- iterations and quality gate results per stage.
-- Row Level Security is enforced through project ownership.
-- ============================================================

-- Create the pipeline_artifacts table
CREATE TABLE IF NOT EXISTS public.pipeline_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    stage public.pipeline_stage NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    quality_gate JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a comment describing the table
COMMENT ON TABLE public.pipeline_artifacts IS 'Stores versioned artifacts produced at each pipeline stage, including quality gate evaluation results.';

-- Create an index on project_id for faster lookups
CREATE INDEX idx_pipeline_artifacts_project_id ON public.pipeline_artifacts(project_id);

-- Create a composite index for querying artifacts by project and stage
CREATE INDEX idx_pipeline_artifacts_project_stage ON public.pipeline_artifacts(project_id, stage);

-- Ensure unique version per project per stage
CREATE UNIQUE INDEX idx_pipeline_artifacts_unique_version
    ON public.pipeline_artifacts(project_id, stage, version);

-- Enable Row Level Security
ALTER TABLE public.pipeline_artifacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view artifacts of their own projects
CREATE POLICY "Users can view artifacts of their own projects"
    ON public.pipeline_artifacts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = pipeline_artifacts.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Users can insert artifacts into their own projects
CREATE POLICY "Users can insert artifacts into their own projects"
    ON public.pipeline_artifacts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = pipeline_artifacts.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Users can update artifacts of their own projects
CREATE POLICY "Users can update artifacts of their own projects"
    ON public.pipeline_artifacts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = pipeline_artifacts.project_id
              AND projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = pipeline_artifacts.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Users can delete artifacts of their own projects
CREATE POLICY "Users can delete artifacts of their own projects"
    ON public.pipeline_artifacts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = pipeline_artifacts.project_id
              AND projects.user_id = auth.uid()
        )
    );
