import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { AdminProfile } from '../types/database';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabase';
import { AuthContext } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  // Synchronization references to prevent race conditions and coordinate lifecycle
  const authSeqRef = useRef<number>(0);
  const lastVerifiedUserIdRef = useRef<string | null>(null);
  const profileRef = useRef<AdminProfile | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const inFlightSignInRef = useRef<boolean>(false);
  const latestActionRef = useRef<{
    type: 'SIGN_IN' | 'SIGN_OUT' | 'AUTH_EVENT';
    sequence: number;
    userId?: string;
  }>({ type: 'AUTH_EVENT', sequence: 0 });

  // Synchronize profileRef whenever profile changes
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  /**
   * Asynchronously verifies the admin profile for an active session.
   * Completely decoupled from the onAuthStateChange callback to prevent mutex deadlocks.
   */
  const verifySessionProfile = useCallback(
    async (targetSession: Session, sequence: number) => {
      try {
        const result = await authService.getAdminProfile(targetSession.user.id);

        // Discard stale responses if a newer event arrived or component unmounted
        if (!isMountedRef.current || sequence !== authSeqRef.current) {
          return;
        }

        if (result.status === 'SUCCESS') {
          if (result.profile.active) {
            setUser(targetSession.user);
            setSession(targetSession);
            setProfile(result.profile);
            profileRef.current = result.profile;
            lastVerifiedUserIdRef.current = targetSession.user.id;
            setAuthError(null);
          } else {
            // Deactivated account: revoke session and disallow access
            setUser(null);
            setSession(null);
            setProfile(null);
            profileRef.current = null;
            lastVerifiedUserIdRef.current = null;
            setAuthError('Access denied. Your administrator account has been deactivated.');
            await authService.signOut();
          }
        } else if (result.status === 'NOT_FOUND') {
          // Unauthorized: user authenticated in Supabase but not in admin_profiles
          setUser(null);
          setSession(null);
          setProfile(null);
          profileRef.current = null;
          lastVerifiedUserIdRef.current = null;
          setAuthError('Access denied. This account is not registered as an authorized administrator.');
          await authService.signOut();
        } else {
          // Database or network connectivity error (result.status === 'ERROR'):
          // Never grant access, but do NOT treat network failure as proof of unauthorized account.
          // Do not call signOut to avoid destroying valid offline tokens unnecessarily.
          setUser(null);
          setSession(null);
          setProfile(null);
          profileRef.current = null;
          lastVerifiedUserIdRef.current = null;
          setAuthError(`Verification error: ${result.message}. Please check your connection.`);
        }
      } catch (err) {
        if (!isMountedRef.current || sequence !== authSeqRef.current) return;
        setUser(null);
        setSession(null);
        setProfile(null);
        profileRef.current = null;
        lastVerifiedUserIdRef.current = null;
        setAuthError(
          err instanceof Error ? err.message : 'An unexpected error occurred during verification.'
        );
      } finally {
        if (isMountedRef.current && sequence === authSeqRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Initialize auth state and subscribe to session updates
  useEffect(() => {
    isMountedRef.current = true;

    if (!isSupabaseConfigured) {
      return () => {
        isMountedRef.current = false;
      };
    }

    // Subscribe to Supabase auth events.
    // The callback is kept strictly synchronous to prevent GoTrue mutex deadlocks.
    const { unsubscribe } = authService.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMountedRef.current) return;

        // 1. INITIAL_SESSION handling:
        // Requirement 1: INITIAL_SESSION with a null session must NOT be treated as an explicit SIGNED_OUT action.
        // It must not increment authSeqRef or cancel an in-flight sign-in.
        if (event === 'INITIAL_SESSION') {
          if (!newSession?.user) {
            if (inFlightSignInRef.current) {
              return;
            }
            setUser(null);
            setSession(null);
            setProfile(null);
            profileRef.current = null;
            lastVerifiedUserIdRef.current = null;
            setIsLoading(false);
            return;
          }
          // If newSession has a user, fall through to session verification below
        }

        // 2. Active in-flight sign-in handling:
        // When an explicit signIn() is currently in flight, it coordinates its own verification and error handling.
        // Internal GoTrue events must not cancel the active sign-in or increment the sequence counter.
        if (inFlightSignInRef.current) {
          if (event === 'SIGNED_OUT' || !newSession?.user) {
            setUser(null);
            setSession(null);
          } else {
            setSession(newSession);
          }
          return;
        }

        // 3. SIGNED_OUT or session removed (when no sign-in is in flight)
        if (event === 'SIGNED_OUT' || !newSession?.user) {
          // Requirement 2: Preserve explicit user-initiated SIGN_OUT sequencing.
          // If latestActionRef is already SIGN_OUT (user clicked logout), preserve that sequence.
          if (latestActionRef.current.type !== 'SIGN_OUT') {
            const sequence = ++authSeqRef.current;
            latestActionRef.current = { type: 'SIGN_OUT', sequence };
          }
          setUser(null);
          setSession(null);
          setProfile(null);
          profileRef.current = null;
          lastVerifiedUserIdRef.current = null;
          setAuthError(null);
          setIsLoading(false);
          return;
        }

        // 4. Handle TOKEN_REFRESHED for an already verified active admin
        if (event === 'TOKEN_REFRESHED') {
          if (
            lastVerifiedUserIdRef.current === newSession.user.id &&
            profileRef.current &&
            profileRef.current.active
          ) {
            // Update session reference seamlessly without resetting loading state or wiping profile
            setSession(newSession);
            return;
          }
        }

        // 5. Handle USER_UPDATED or matching verified user session
        if (
          lastVerifiedUserIdRef.current === newSession.user.id &&
          profileRef.current &&
          profileRef.current.active
        ) {
          setSession(newSession);
          setUser(newSession.user);
          setIsLoading(false);
          return;
        }

        // 6. Schedule async verification outside the synchronous callback to prevent GoTrue deadlocks
        const sequence = ++authSeqRef.current;
        latestActionRef.current = {
          type: 'AUTH_EVENT',
          sequence,
          userId: newSession.user.id,
        };
        setIsLoading(true);

        queueMicrotask(() => {
          if (!isMountedRef.current || sequence !== authSeqRef.current) return;
          verifySessionProfile(newSession, sequence);
        });
      }
    );

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [verifySessionProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setAuthError(null);
      inFlightSignInRef.current = true;
      const sequence = ++authSeqRef.current;
      latestActionRef.current = {
        type: 'SIGN_IN',
        sequence,
      };

      try {
        const result = await authService.signIn(email, password);

        // Requirement 4 & Requirement 3: Never replace a meaningful result.error with a generic cancellation message.
        if (result.error || !result.user || !result.profile) {
          setUser(null);
          setSession(null);
          setProfile(null);
          profileRef.current = null;
          lastVerifiedUserIdRef.current = null;
          const errorMessage = result.error || 'Authentication failed.';
          if (isMountedRef.current && sequence === authSeqRef.current) {
            setAuthError(errorMessage);
          }
          return { success: false, error: errorMessage };
        }

        // Credentials and active admin profile verified successfully.
        // Check if a genuine superseding user action occurred while awaiting response:
        if (!isMountedRef.current || sequence !== authSeqRef.current) {
          // A newer action occurred while this sign-in was in flight.
          // Only revoke if:
          // 1. This superseded attempt actually established a session/user, AND
          // 2. The superseding action was an explicit sign-out (NEVER revoke if another sign-in was initiated), AND
          // 3. Safe identity checks confirm the currently active session in the client strictly matches this superseded attempt.
          if (result.session && result.user) {
            const supersededToken = result.session.access_token;
            const supersededUserId = result.user.id;
            const currentAction = latestActionRef.current;

            if (currentAction.type === 'SIGN_OUT') {
              const targetSignOutSeq = currentAction.sequence;

              authService
                .getSession()
                .then((activeSession) => {
                  if (
                    activeSession &&
                    activeSession.access_token === supersededToken &&
                    activeSession.user.id === supersededUserId &&
                    latestActionRef.current.type === 'SIGN_OUT' &&
                    latestActionRef.current.sequence === targetSignOutSeq
                  ) {
                    authService.signOut().catch(() => {});
                  }
                })
                .catch(() => {});
            }
          }
          return { success: false, error: 'Authentication was cancelled or superseded.' };
        }

        // Successfully verified and sequence still active
        setUser(result.user);
        setSession(result.session);
        setProfile(result.profile);
        profileRef.current = result.profile;
        lastVerifiedUserIdRef.current = result.user.id;
        setAuthError(null);
        return { success: true };
      } catch (err) {
        if (!isMountedRef.current || sequence !== authSeqRef.current) {
          return { success: false, error: 'Authentication was cancelled or superseded.' };
        }
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred during login.';
        setAuthError(message);
        return { success: false, error: message };
      } finally {
        if (sequence === authSeqRef.current) {
          inFlightSignInRef.current = false;
          if (isMountedRef.current) {
            setIsLoading(false);
          }
        }
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<{ error?: string }> => {
    inFlightSignInRef.current = false; // Cancel any in-flight sign-in
    const sequence = ++authSeqRef.current; // Invalidate any pending async verification
    latestActionRef.current = { type: 'SIGN_OUT', sequence };
    profileRef.current = null;
    lastVerifiedUserIdRef.current = null;
    setIsLoading(true);
    setAuthError(null);

    let signOutError: string | undefined;

    try {
      const result = await authService.signOut();
      if (result.error) {
        signOutError = result.error;
        setAuthError(`Sign-out error: ${result.error}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out.';
      signOutError = message;
      setAuthError(`Sign-out error: ${message}`);
    } finally {
      // Always clear local authentication state regardless of remote sign-out outcome
      if (isMountedRef.current && sequence === authSeqRef.current) {
        setUser(null);
        setSession(null);
        setProfile(null);
        profileRef.current = null;
        lastVerifiedUserIdRef.current = null;
        setIsLoading(false);
      }
    }

    return signOutError ? { error: signOutError } : {};
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const sequence = ++authSeqRef.current;
    latestActionRef.current = { type: 'AUTH_EVENT', sequence, userId: user.id };

    try {
      const result = await authService.getAdminProfile(user.id);
      if (!isMountedRef.current || sequence !== authSeqRef.current) return;

      if (result.status === 'SUCCESS') {
        if (result.profile.active) {
          setProfile(result.profile);
          profileRef.current = result.profile;
        } else {
          // Deactivated while active: sign out
          await signOut();
        }
      } else if (result.status === 'NOT_FOUND') {
        // Record deleted: sign out
        await signOut();
      } else {
        // Network or DB error: do not sign out active session, retain existing profile
        console.warn('Profile refresh deferred due to network/database error:', result.message);
      }
    } catch (err) {
      console.warn('Unexpected error during profile refresh:', err);
    }
  }, [user, signOut]);

  const isAdmin = useMemo(() => {
    return Boolean(user && profile && profile.active);
  }, [user, profile]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isAdmin,
      authError,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, isLoading, isAdmin, authError, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
