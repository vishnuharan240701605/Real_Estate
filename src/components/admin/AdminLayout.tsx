import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SITE_CONFIG } from '../../data/siteConfig';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Building2,
  LayoutDashboard,
  Building,
  PlusCircle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  User,
  AlertTriangle,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const AdminLayout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/admin/properties',
      label: 'Manage Properties',
      icon: Building,
      end: true,
    },
    {
      to: '/admin/properties/new',
      label: 'Add Property',
      icon: PlusCircle,
      end: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans text-[#242424] selection:bg-[#C5A46D]/20 selection:text-[#142C38]">
      {/* Top Gold Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-[#142C38] via-[#C5A46D] to-[#142C38] w-full" />

      {/* Main Admin Header */}
      <header className="bg-white border-b border-[#E5E1D8] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-[#142C38] text-[#C5A46D] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#142C38] block leading-tight">
                    {SITE_CONFIG.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Administrator Portal</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `px-3 py-2 text-xs uppercase tracking-widest font-medium transition-all flex items-center gap-2 border-b-2 ${
                        isActive
                          ? 'border-[#C5A46D] text-[#142C38] font-semibold bg-[#F7F5F0]/60'
                          : 'border-transparent text-[#666666] hover:text-[#142C38] hover:border-[#C5A46D]/40'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-[#C5A46D]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: User Profile & Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Admin Identity Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F5F0] border border-[#E5E1D8] text-xs">
                <User className="w-3.5 h-3.5 text-[#C5A46D]" />
                <div className="text-left">
                  <span className="font-semibold text-[#142C38] block leading-none">
                    {profile?.full_name || 'Admin'}
                  </span>
                  <span className="text-[10px] text-[#666666] uppercase tracking-wider block mt-0.5">
                    {profile?.role === 'owner' ? 'Owner' : 'Administrator'}
                  </span>
                </div>
              </div>

              {/* View Public Site Link */}
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Public Real Estate Catalog"
                className="p-2 text-[#666666] hover:text-[#142C38] hover:bg-[#F7F5F0] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#142C38] text-white hover:bg-[#0D1E27] text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#142C38] hover:text-[#C5A46D] focus:outline-none"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E1D8] bg-white px-4 pt-3 pb-6 space-y-3">
            {/* Mobile Admin Profile Card */}
            <div className="p-3 bg-[#F7F5F0] border border-[#E5E1D8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#142C38] text-[#C5A46D] flex items-center justify-center font-bold text-xs">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#142C38]">{profile?.full_name || 'Admin'}</p>
                  <p className="text-[10px] text-[#666666]">{user?.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#C5A46D]/15 text-[#142C38] px-2 py-0.5 border border-[#C5A46D]/30">
                {profile?.role || 'Admin'}
              </span>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider font-medium transition-all ${
                        isActive
                          ? 'bg-[#142C38] text-white font-semibold'
                          : 'text-[#666666] hover:bg-[#F7F5F0] hover:text-[#142C38]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-[#C5A46D]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-[#E5E1D8] space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#F7F5F0] border border-[#E5E1D8] text-xs uppercase tracking-wider text-[#142C38] hover:bg-white"
              >
                <ExternalLink className="w-4 h-4 text-[#C5A46D]" />
                <span>View Public Website</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#142C38] text-white text-xs uppercase tracking-wider font-semibold disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 text-[#C5A46D]" />
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Configuration Warning Notice (if Supabase credentials are missing) */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Offline / Placeholder Mode:</strong> Supabase credentials are not configured in{' '}
                <code className="font-mono bg-amber-100 px-1 py-0.5">.env.local</code>. Property database
                modifications require active Supabase connection.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Body (Outlet) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-[#E5E1D8] py-4 text-center text-xs text-[#666666]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {CURRENT_YEAR} {SITE_CONFIG.name}. Thanjavur, Tamil Nadu.
          </span>
          <span className="text-[11px] text-[#888888]">
            Property Management System — PostgreSQL &amp; Supabase Auth Protected
          </span>
        </div>
      </footer>
    </div>
  );
};
