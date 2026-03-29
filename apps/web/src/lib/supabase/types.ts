// ---------------------------------------------------------------------------
// types.ts — Database type definitions for Supabase tables
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          page_type: string;
          current_stage: string;
          pipeline_state: Json;
          status: 'active' | 'paused' | 'completed' | 'archived';
          published_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          page_type: string;
          current_stage?: string;
          pipeline_state?: Json;
          status?: 'active' | 'paused' | 'completed' | 'archived';
          published_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          page_type?: string;
          current_stage?: string;
          pipeline_state?: Json;
          status?: 'active' | 'paused' | 'completed' | 'archived';
          published_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pipeline_artifacts: {
        Row: {
          id: string;
          project_id: string;
          stage: string;
          artifact_type: string;
          content: Json;
          version: number;
          is_current: boolean;
          quality_gate_result: Json | null;
          feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          stage: string;
          artifact_type: string;
          content: Json;
          version?: number;
          is_current?: boolean;
          quality_gate_result?: Json | null;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          stage?: string;
          artifact_type?: string;
          content?: Json;
          version?: number;
          is_current?: boolean;
          quality_gate_result?: Json | null;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pipeline_artifacts_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      generated_sites: {
        Row: {
          id: string;
          project_id: string;
          html_content: string;
          design_tokens: Json;
          meta_title: string;
          meta_description: string;
          version: number;
          is_published: boolean;
          published_url: string | null;
          storage_path: string | null;
          qa_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          html_content: string;
          design_tokens: Json;
          meta_title: string;
          meta_description: string;
          version?: number;
          is_published?: boolean;
          published_url?: string | null;
          storage_path?: string | null;
          qa_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          html_content?: string;
          design_tokens?: Json;
          meta_title?: string;
          meta_description?: string;
          version?: number;
          is_published?: boolean;
          published_url?: string | null;
          storage_path?: string | null;
          qa_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'generated_sites_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          project_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          stage: string | null;
          metadata: Json | null;
          token_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          stage?: string | null;
          metadata?: Json | null;
          token_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          stage?: string | null;
          metadata?: Json | null;
          token_count?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_status: 'active' | 'paused' | 'completed' | 'archived';
      message_role: 'user' | 'assistant' | 'system';
      pipeline_stage: 'briefing' | 'strategy' | 'copy' | 'design' | 'build' | 'qa' | 'deploy';
      stage_status: 'pending' | 'in_progress' | 'needs_review' | 'approved' | 'blocked';
    };
    CompositeTypes: Record<string, never>;
  };
}

// ---------------------------------------------------------------------------
// Convenience type aliases
// ---------------------------------------------------------------------------

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Named row types for direct use
export type Project = Tables<'projects'>;
export type PipelineArtifact = Tables<'pipeline_artifacts'>;
export type GeneratedSite = Tables<'generated_sites'>;
export type Message = Tables<'messages'>;
