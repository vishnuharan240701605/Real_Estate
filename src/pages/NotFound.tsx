import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageCircle, AlertCircle } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

export const NotFound: React.FC = () => {
  return (
    <div className="py-20 md:py-32 max-w-3xl mx-auto px-4 sm:px-8 text-center space-y-8">
      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs uppercase tracking-widest font-semibold">
        <AlertCircle className="w-4 h-4 text-amber-700" />
        <span>404 - Page Not Located</span>
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#142C38]">
        The Requested Page Does Not Exist
      </h1>

      <p className="text-sm sm:text-base text-[#242424]/75 max-w-xl mx-auto leading-relaxed">
        The link you followed may be outdated, or the property record may have moved. Please return to the homepage or explore available listings.
      </p>

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#142C38] text-[#F7F5F0] border border-[#142C38] font-semibold text-xs uppercase tracking-widest hover:bg-[#C5A46D] hover:border-[#C5A46D] hover:text-[#142C38] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>

        <a
          href={SITE_CONFIG.contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-[#142C38] border border-[#C5A46D] font-semibold text-xs uppercase tracking-widest hover:bg-[#C5A46D] transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-[#C5A46D]" />
          <span>Inquire via WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
