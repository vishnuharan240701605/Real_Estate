import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteConfig';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#142C38] text-[#F7F5F0] border-t-2 border-[#C5A46D] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top 4-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-[#F7F5F0]/10">
          {/* Column 1: Brand & Positioning */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-serif text-2xl font-bold tracking-wider text-[#F7F5F0]">
                {SITE_CONFIG.name}
              </span>
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-medium">
                Thanjavur • Tamil Nadu
              </p>
            </div>
            
            <p className="text-sm text-[#F7F5F0]/75 leading-relaxed font-light">
              {SITE_CONFIG.tagline}
            </p>
            
            <p className="text-xs text-[#F7F5F0]/60 leading-relaxed">
              Dedicated real estate advisory for residential plots, farmland, and commercial investments across Thanjavur's growth corridors.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C5A46D] font-semibold">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-[#F7F5F0]/80 hover:text-[#C5A46D] transition-colors flex items-center space-x-1">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-[#F7F5F0]/80 hover:text-[#C5A46D] transition-colors flex items-center space-x-1">
                  <span>Properties Catalog</span>
                </Link>
              </li>
              <li>
                <Link to="/loan-services" className="text-[#F7F5F0]/80 hover:text-[#C5A46D] transition-colors flex items-center space-x-1">
                  <span>Loan Services</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#F7F5F0]/80 hover:text-[#C5A46D] transition-colors flex items-center space-x-1">
                  <span>About Our Agency</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#F7F5F0]/80 hover:text-[#C5A46D] transition-colors flex items-center space-x-1">
                  <span>Contact & Consultation</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Regional Corridors */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C5A46D] font-semibold">
              Thanjavur Corridors
            </h3>
            <ul className="space-y-2 text-xs text-[#F7F5F0]/70">
              {SITE_CONFIG.location.prominentRegions.map(region => (
                <li key={region} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-[#C5A46D]/60 rounded-full" />
                  <span>{region}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Hotline & Direct WhatsApp */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C5A46D] font-semibold">
              Direct Contact
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2.5 text-[#F7F5F0]/80">
                <MapPin className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                <span className="text-xs leading-relaxed text-[#F7F5F0]/70">
                  {SITE_CONFIG.location.addressNotice}
                </span>
              </div>

              <div className="flex items-center space-x-2.5 text-[#F7F5F0]/90">
                <Phone className="w-4 h-4 text-[#C5A46D] shrink-0" />
                <span className="text-xs tracking-wide">
                  {SITE_CONFIG.contact.phoneDisplay}
                </span>
              </div>

              <div className="pt-2">
                <a
                  href={SITE_CONFIG.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-[#C5A46D] text-[#142C38] font-semibold text-xs uppercase tracking-wider hover:bg-[#D6BC8C] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency & Disclaimer Box */}
        <div className="my-8 p-4 bg-[#0D1E27] border border-[#C5A46D]/20 text-xs text-[#F7F5F0]/65 space-y-2">
          <div className="flex items-center space-x-2 text-[#C5A46D] font-semibold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#C5A46D]" />
            <span>Transparency & Verification Disclosure</span>
          </div>
          <p className="leading-relaxed">
            {SITE_CONFIG.disclaimer.previewNotice}
          </p>
          <p className="leading-relaxed text-[#F7F5F0]/50 text-[11px]">
            {SITE_CONFIG.disclaimer.legalNote}
          </p>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F5F0]/50 pt-4">
          <p>
            © {CURRENT_YEAR} {SITE_CONFIG.name}. Thanjavur, Tamil Nadu. All rights reserved.
          </p>
          <p className="text-[11px] text-[#F7F5F0]/40">
            Initial Static Deployment Architecture • Budget ₹0 Free Hosting
          </p>
        </div>
      </div>
    </footer>
  );
};
