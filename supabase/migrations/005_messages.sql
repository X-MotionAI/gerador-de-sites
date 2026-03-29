-- ============================================================
-- Migration 005: Messages (Per-Stage Chat)
-- ============================================================
-- Stores the conversation messages for each pipeline stage
-- within a project. Supports both plain text and rendered
-- HTML content for assistant responses.
-- Row Level Security is enforced through project ownership.
-- ============================================================

-- Create the message role enum
CREATE TYPE public.message_role AS ENUM (
    'user',
    'assistant'
);

-- Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    stage public.pipeline_stage NOT NULL,
    role public.message_role NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a comment describing the table
COMMENT ON TABLE public.messages IS 'Stores per-stage chat messages between the user and the assistant within a project pipeline.';

-- Create an index on project_id for faster lookups
CREATE INDEX idx_messages_project_id ON public.messages(project_id);

-- Create a composite index for querying messages by project and stage
CREATE INDEX idx_messages_project_stage ON public.messages(project_id, stage);

-- Create an index on created_at for chronological ordering
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages of their own projects
CREATE POLICY "Users can view messages of their own projects"
    ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = messages.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Users can insert messages into their own projects
CREATE POLICY "Users can insert messages into their own projects"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = messages.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Users can update messages of their own projects
CREATE POLICY "Users can update messages of their own projects"
    ON public.messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = messages.project_id
              AND projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = messages.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- Policy: Users can delete messages of their own projects
CREATE POLICY "Users can delete messages of their own projects"
    ON public.messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = messages.project_id
              AND projects.user_id = auth.uid()
        )
    );
