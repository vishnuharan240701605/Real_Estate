import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SITE_CONFIG } from '../../data/siteConfig';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Building2,
  Loader2,
  Info,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAdmin, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve destination redirected from (if any)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  // If already authenticated as active admin, redirect to admin area
  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAdmin, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(trimmedEmail, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during login.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-between selection:bg-[#C5A46D]/20 selection:text-[#142C38]">
      {/* Top Header / Public Website Navigation Link */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#142C38] hover:text-[#C5A46D] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Amman Real Estate</span>
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#666666]">
          Thanjavur, Tamil Nadu
        </span>
      </header>

      {/* Main Login Panel */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white border border-[#E5E1D8] shadow-sm rounded-none p-8 sm:p-10 relative">
            {/* Top Gold Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#142C38] via-[#C5A46D] to-[#142C38]" />

            {/* Brand Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#142C38] text-[#C5A46D] mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#142C38] tracking-tight mb-2">
                {SITE_CONFIG.name}
              </h1>
              <p className="text-xs font-sans uppercase tracking-widest text-[#C5A46D] font-medium mb-3">
                {SITE_CONFIG.tagline}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#142C38]/5 border border-[#142C38]/10 text-[#142C38] text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span className="font-medium tracking-wide">Administrator Portal</span>
              </div>
            </div>

            {/* Configuration Advisory (if Supabase env is not configured yet) */}
            {!isSupabaseConfigured && (
              <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-none flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">Configuration Notice</p>
                  <p className="text-amber-800">
                    Supabase credentials are not detected in <code className="bg-amber-100 px-1 py-0.5 font-mono text-[11px]">.env.local</code>. Configure <code className="bg-amber-100 px-1 py-0.5 font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 font-mono text-[11px]">VITE_SUPABASE_PUBLISHABLE_KEY</code> to enable live authentication.
                  </p>
                </div>
              </div>
            )}

            {/* Error Notification Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 bg-red-50 border-l-2 border-red-600 text-red-900 text-xs flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="font-sans leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-2"
                >
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ammanrealestate.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] placeholder:text-[#666666]/60 focus:bg-white focus:outline-none focus:border-[#C5A46D] focus:ring-1 focus:ring-[#C5A46D] transition-all rounded-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] placeholder:text-[#666666]/60 focus:bg-white focus:outline-none focus:border-[#C5A46D] focus:ring-1 focus:ring-[#C5A46D] transition-all rounded-none"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#666666] hover:text-[#142C38] transition-colors focus:outline-none"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#142C38] text-white hover:bg-[#0D1E27] active:bg-[#081319] border border-[#142C38] font-sans text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed rounded-none shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5A46D]" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Security Advisory */}
            <div className="mt-8 pt-6 border-t border-[#E5E1D8] text-center">
              <p className="text-[11px] font-sans text-[#666666] leading-relaxed">
                Protected by PostgreSQL Row Level Security &amp; Supabase Auth. Access is restricted to authorized AMMAN REAL ESTATE personnel.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding Notice */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-[#666666] font-sans">
        &copy; {CURRENT_YEAR} {SITE_CONFIG.name}. All rights reserved.
      </footer>
    </div>
  );
};
