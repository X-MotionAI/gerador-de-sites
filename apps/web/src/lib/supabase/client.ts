// ---------------------------------------------------------------------------
// client.ts — Browser Supabase client for client-side components
// ---------------------------------------------------------------------------

import { createBrowserClient } from '@supabase/ssr';
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

export function createClient() {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  );
}
