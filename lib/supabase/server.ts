import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client authenticated with the secret/service-role key.
 * Bypasses Row Level Security — never import this into a client component.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server credentials are not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}
