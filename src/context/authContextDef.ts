import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { AdminProfile } from '../types/database';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
