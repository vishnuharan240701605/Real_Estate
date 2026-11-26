import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SITE_CONFIG } from '../../data/siteConfig';
import { Link } from 'react-router-dom';
import {
  Building2,
  LogOut,
  ShieldCheck,
  User,
  Mail,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPlaceholder: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans text-[#242424]">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#142C38] text-white border-b border-[#C5A46D]/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C5A46D] text-[#142C38] flex items-center justify-center font-serif font-bold text-lg">
              A
            </div>
            <div>
              <span className="font-serif text-lg tracking-wide block leading-tight">
                {SITE_CONFIG.name}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#C5A46D] block">
                Administrative Control Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs uppercase tracking-wider text-gray-300 hover:text-white transition-colors hidden sm:inline-block"
            >
              Public Site
            </Link>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider text-[#C5A46D] hover:text-white border border-[#C5A46D]/40 hover:border-[#C5A46D] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Banner */}
        <div className="bg-white border border-[#E5E1D8] p-6 sm:p-8 mb-8 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#C5A46D]" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#C5A46D] mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Active Administrator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#142C38] tracking-tight">
                Welcome, {profile?.full_name || 'Administrator'}
              </h1>
              <p className="text-xs text-[#666666] mt-1">
                Authorized for property inventory management across Thanjavur listings.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#F7F5F0] p-3 border border-[#E5E1D8]">
              <div className="w-10 h-10 rounded-full bg-[#142C38] text-[#C5A46D] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-[#142C38]">{profile?.full_name}</p>
                <p className="text-[#666666] flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{profile?.email}</span>
                </p>
                <p className="text-[#C5A46D] uppercase tracking-widest font-mono text-[10px] mt-0.5 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>Role: {profile?.role}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status / Roadmap Notice for Milestone 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#E5E1D8] p-6">
            <div className="w-10 h-10 bg-[#142C38]/5 text-[#142C38] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-[#C5A46D]" />
            </div>
            <h3 className="font-serif text-lg text-[#142C38] mb-1">Milestone 2A Complete</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Supabase Auth and active profile verification are fully operational with session persistence and secure auto-logout.
            </p>
          </div>

          <div className="bg-white border border-[#E5E1D8] p-6">
            <div className="w-10 h-10 bg-[#142C38]/5 text-[#142C38] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-[#C5A46D]" />
            </div>
            <h3 className="font-serif text-lg text-[#142C38] mb-1">Row Level Security Active</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              11 PostgreSQL RLS policies guarantee public callers see only published listings while authorized admins retain full management rights.
            </p>
          </div>

          <div className="bg-white border border-[#E5E1D8] p-6">
            <div className="w-10 h-10 bg-[#142C38]/5 text-[#142C38] flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5 text-[#C5A46D]" />
            </div>
            <h3 className="font-serif text-lg text-[#142C38] mb-1">Property Inventory</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Listing CRUD, category specifications, image management, and publish/unpublish controls will be wired in the upcoming milestones.
            </p>
          </div>
        </div>

        {/* Public Website Preview Link */}
        <div className="bg-[#142C38] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-serif text-lg text-[#C5A46D] mb-1">
              Public Portal Status
            </h4>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              The public real estate catalog and Thanjavur property showcase are operational and isolated from unauthenticated administrative changes.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A46D] text-[#142C38] font-semibold text-xs uppercase tracking-wider hover:bg-[#D6BC8C] transition-colors whitespace-nowrap"
          >
            <span>View Public Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E1D8] py-4 text-center text-xs text-[#666666]">
        AMMAN REAL ESTATE &bull; Administrative Portal &bull; Thanjavur, Tamil Nadu
      </footer>
    </div>
  );
};
