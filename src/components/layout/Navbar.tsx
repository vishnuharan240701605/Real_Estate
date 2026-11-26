import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, MessageSquare, MapPin, Phone } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteConfig';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Properties', path: '/properties' },
  { name: 'Loan Services', path: '/loan-services' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#E5E1D8] transition-all">
      {/* Top micro-bar: Location and WhatsApp Direct Contact */}
      <div className="bg-[#142C38] text-[#F7F5F0] text-xs py-1.5 px-4 sm:px-8 border-b border-[#C5A46D]/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[#C5A46D]">
            <MapPin className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span className="text-[#F7F5F0]/90 tracking-wide font-normal">
              Thanjavur, Tamil Nadu, India
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-[#C5A46D]/80 italic">
              "{SITE_CONFIG.tagline}"
            </span>
            <a
              href={SITE_CONFIG.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-[#C5A46D] hover:text-[#D6BC8C] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#C5A46D]" />
              <span className="font-medium tracking-wide">
                WhatsApp: {SITE_CONFIG.contact.phoneDisplay}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Editorial Typography */}
        <Link 
          to="/" 
          onClick={closeMobileMenu}
          className="flex flex-col group focus:outline-none"
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#142C38] group-hover:text-[#1D3B4B] transition-colors">
            {SITE_CONFIG.name}
          </span>
          <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.2em] text-[#C5A46D] uppercase font-medium">
            Thanjavur • Tamil Nadu
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm tracking-wider uppercase transition-colors relative py-1 ${
                  isActive
                    ? 'text-[#142C38] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#C5A46D]'
                    : 'text-[#242424]/80 hover:text-[#142C38] font-medium'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Action CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href={SITE_CONFIG.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest px-4 py-2.5 bg-[#142C38] text-[#F7F5F0] border border-[#C5A46D] hover:bg-[#C5A46D] hover:text-[#142C38] transition-all duration-200 font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consult via WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 text-[#142C38] hover:text-[#C5A46D] focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F5F0] border-b border-[#E5E1D8] px-6 py-6 space-y-4 animate-in fade-in duration-200">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-3">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `text-base tracking-wider uppercase py-2 border-b border-[#E5E1D8]/60 ${
                    isActive
                      ? 'text-[#142C38] font-bold border-[#C5A46D]'
                      : 'text-[#242424]/80 font-medium hover:text-[#142C38]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="pt-2">
            <a
              href={SITE_CONFIG.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="flex items-center justify-center space-x-2 w-full py-3 bg-[#142C38] text-[#F7F5F0] border border-[#C5A46D] text-xs uppercase tracking-widest font-medium hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#C5A46D]" />
              <span>Direct WhatsApp Inquiry</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
