// Supabase Edge Functions Shared Administrator Authorization Utility
import { createClient, type User, type SupabaseClient } from 'npm:@supabase/supabase-js@^2.49.1';

export interface AdminAuthSuccess {
  user: User;
  profile: {
    id: string;
    active: boolean;
    role: string;
  };
  supabaseAdmin: SupabaseClient;
}

export interface AdminAuthFailure {
  error: string;
  status: number;
}

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

export function isAdminAuthFailure(result: AdminAuthResult): result is AdminAuthFailure {
  return 'error' in result;
}

/**
 * Validates the Supabase JWT token in the Authorization header and verifies
 * that the user exists in public.admin_profiles with active = true.
 */
export async function verifyAdmin(req: Request): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header.', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return { error: 'Empty bearer token.', status: 401 };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return { error: 'Server misconfiguration: missing Supabase internal keys.', status: 500 };
  }

  // Create service-role client for internal administrative checks
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // 1. Verify user token
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { error: userError?.message || 'Invalid or expired user session token.', status: 401 };
  }

  // 2. Verify active admin profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('admin_profiles')
    .select('id, active, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return { error: `Failed to query admin profile: ${profileError.message}`, status: 500 };
  }

  if (!profile || !profile.active) {
    return { error: 'Access denied: Active administrator profile required.', status: 403 };
  }

  return { user, profile, supabaseAdmin };
}
