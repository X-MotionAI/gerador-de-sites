// ---------------------------------------------------------------------------
// server.ts — Server Supabase client for server components and API routes
// ---------------------------------------------------------------------------

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'A variavel de ambiente NEXT_PUBLIC_SUPABASE_URL nao esta definida. ' +
      'Configure-a no arquivo .env.local com a URL do seu projeto Supabase.'
    );
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'A variavel de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY nao esta definida. ' +
      'Configure-a no arquivo .env.local com a chave anonima do seu projeto Supabase.'
    );
  }
  return key;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This is expected when the middleware
            // refreshes the session — the call can be safely ignored here
            // because the middleware will handle setting the updated cookies.
          }
        },
      },
    }
  );
}
