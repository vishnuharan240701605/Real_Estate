import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteConfig';

export const WhatsAppButton: React.FC = () => {
  return (
    <aside aria-label="Direct WhatsApp Assistance" className="fixed bottom-6 right-6 z-50">
      <a
        href={SITE_CONFIG.contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat directly with Amman Real Estate on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#142C38] text-[#C5A46D] border border-[#C5A46D]/60 rounded-full shadow-2xl hover:bg-[#1D3B4B] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C5A46D] focus:ring-offset-2"
      >
        {/* Subtle breathing aura */}
        <span className="absolute -inset-1 rounded-full bg-[#C5A46D]/20 animate-ping -z-10 opacity-75" />
        
        {/* Lucide icon */}
        <MessageCircle className="w-7 h-7 text-[#C5A46D] transition-transform duration-300 group-hover:rotate-6" />

        {/* Hover Tooltip for desktop */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#142C38] text-[#F7F5F0] border border-[#C5A46D]/40 text-xs font-medium px-3 py-1.5 rounded-sm whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 hidden md:block">
          Direct WhatsApp: {SITE_CONFIG.contact.phoneDisplay}
        </span>
      </a>
    </aside>
  );
};
