import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AdminProfile } from '../types/database';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export type AdminProfileResult =
  | { status: 'SUCCESS'; profile: AdminProfile }
  | { status: 'NOT_FOUND' }
  | { status: 'ERROR'; message: string };

export interface AuthResult {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  error?: string;
  isVerificationError?: boolean;
}

/**
 * Authentication Service for AMMAN REAL ESTATE.
 * Handles Supabase Auth email/password authentication and verifies
 * corresponding active administrator profile status in admin_profiles.
 */
export const authService = {
  /**
   * Authenticate administrator with email and password.
   * If credentials match but the user does not have an active admin profile,
   * access is rejected and the Supabase session is immediately terminated.
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        session: null,
        profile: null,
        error: 'Supabase credentials are not configured. Please check your environment variables.',
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return {
        user: null,
        session: null,
        profile: null,
        error: authError?.message || 'Invalid email or password.',
      };
    }

    // Helper to safely clean up an unverified session without terminating a newer session
    const cleanupUnverifiedSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const activeSession = data.session;
        // Only evict if the active session still strictly matches this unverified attempt
        if (
          activeSession &&
          activeSession.access_token === authData.session.access_token &&
          activeSession.user.id === authData.user.id
        ) {
          await supabase.auth.signOut({ scope: 'local' });
        }
      } catch {
        // Fallback: ignore cleanup errors so the original verification error is not suppressed
      }
    };

    // 2. Fetch and verify corresponding administrator profile
    const profileResult = await this.getAdminProfile(authData.user.id);

    if (profileResult.status === 'ERROR') {
      // Database/network failure: do NOT treat as unauthorized user!
      // Evict unverified session safely without interfering with any newer action
      await cleanupUnverifiedSession();
      return {
        user: null,
        session: null,
        profile: null,
        error: `Administrator verification failed: ${profileResult.message}. Please check your connection and try again.`,
        isVerificationError: true,
      };
    }

    if (profileResult.status === 'NOT_FOUND') {
      // User authenticated via Supabase Auth, but has NO admin profile row
      await cleanupUnverifiedSession();
      return {
        user: null,
        session: null,
        profile: null,
        error: 'Access denied. This account is not registered as an authorized administrator.',
      };
    }

    const profile = profileResult.profile;

    if (!profile.active) {
      // User has an admin profile, but it has been deactivated
      await cleanupUnverifiedSession();
      return {
        user: null,
        session: null,
        profile: null,
        error: 'Access denied. Your administrator account has been deactivated.',
      };
    }

    return {
      user: authData.user,
      session: authData.session,
      profile,
    };
  },

  /**
   * Terminate current Supabase authenticated session.
   * Uses local scope eviction if remote sign-out fails to guarantee
   * that unauthorized or deactivated sessions cannot linger in browser storage.
   */
  async signOut(): Promise<{ error?: string }> {
    if (!isSupabaseConfigured) return {};

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Fallback to local scope to guarantee that browser storage is cleared
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          // Local fallback exhausted
        }
        return { error: error.message };
      }
      return {};
    } catch (err) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Local fallback exhausted
      }
      return { error: err instanceof Error ? err.message : 'Failed to sign out.' };
    }
  },

  /**
   * Retrieve current active session from Supabase client.
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Retrieve and verify admin profile for a specific authenticated user.
   * Explicitly distinguishes between missing profile (NOT_FOUND) and
   * database/network connectivity errors (ERROR).
   */
  async getAdminProfile(userId: string): Promise<AdminProfileResult> {
    if (!isSupabaseConfigured) {
      return { status: 'ERROR', message: 'Supabase credentials are not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        return { status: 'ERROR', message: error.message };
      }

      if (!data) {
        return { status: 'NOT_FOUND' };
      }

      return { status: 'SUCCESS', profile: data as AdminProfile };
    } catch (err) {
      return {
        status: 'ERROR',
        message: err instanceof Error ? err.message : 'Failed to query administrator profile.',
      };
    }
  },

  /**
   * Subscribe to authentication state changes (TOKEN_REFRESHED, SIGNED_OUT, etc.).
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
