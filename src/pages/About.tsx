import React from 'react';
import { Shield, MapPin, MessageCircle, Scale, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

export const About: React.FC = () => {
  return (
    <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      {/* Editorial Header */}
      <div className="border-b border-[#E5E1D8] pb-8 space-y-3">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C5A46D] font-semibold">
          About Amman Real Estate
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#142C38]">
          Find Your Property. Build Your Future.
        </h1>
        <p className="text-sm sm:text-base text-[#242424]/75 max-w-3xl leading-relaxed font-light">
          Rooted in Thanjavur, Tamil Nadu, Amman Real Estate provides reliable real estate facilitation, land identification, and investment consultation for clients seeking genuine property in the delta capital.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-[#E5E1D8] p-8 space-y-4">
          <Scale className="w-8 h-8 text-[#C5A46D]" />
          <h2 className="font-serif text-xl font-bold text-[#142C38]">
            Legal Scrutiny First
          </h2>
          <p className="text-xs text-[#242424]/75 leading-relaxed">
            Every transaction is preceded by rigorous examination of title deeds, encumbrance certificates (EC), and municipal or DTCP planning statuses.
          </p>
        </div>

        <div className="bg-white border border-[#E5E1D8] p-8 space-y-4">
          <MapPin className="w-8 h-8 text-[#C5A46D]" />
          <h2 className="font-serif text-xl font-bold text-[#142C38]">
            Thanjavur Market Insight
          </h2>
          <p className="text-xs text-[#242424]/75 leading-relaxed">
            Direct knowledge of Thanjavur's prime growth corridors, including Vallam, Medical College Road, Kumbakonam Road, and New Bus Stand bypass sectors.
          </p>
        </div>

        <div className="bg-white border border-[#E5E1D8] p-8 space-y-4">
          <Shield className="w-8 h-8 text-[#C5A46D]" />
          <h2 className="font-serif text-xl font-bold text-[#142C38]">
            Transparent Facilitation
          </h2>
          <p className="text-xs text-[#242424]/75 leading-relaxed">
            Zero inflated claims or fictitious marketing statistics. We offer straightforward direct communication directly via WhatsApp and personal consultation.
          </p>
        </div>
      </div>

      {/* Regional Focus */}
      <div className="bg-[#142C38] text-[#F7F5F0] p-8 sm:p-12 border-l-4 border-[#C5A46D] space-y-6">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F7F5F0]">
            Our Geographic Coverage in Thanjavur
          </h2>
          <p className="text-xs sm:text-sm text-[#F7F5F0]/80">
            Facilitating residential layouts, agricultural holdings, and commercial opportunities across:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          {SITE_CONFIG.location.prominentRegions.map(region => (
            <div key={region} className="flex items-center space-x-2 bg-[#0D1E27] p-3 border border-[#C5A46D]/20">
              <CheckCircle2 className="w-4 h-4 text-[#C5A46D] shrink-0" />
              <span>{region}</span>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <a
            href={SITE_CONFIG.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#C5A46D] text-[#142C38] font-semibold text-xs uppercase tracking-widest hover:bg-[#D6BC8C] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consult on WhatsApp: {SITE_CONFIG.contact.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
