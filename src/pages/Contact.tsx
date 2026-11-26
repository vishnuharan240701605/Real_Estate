import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Send, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { buildWhatsAppLink } from '../utils/whatsapp';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'residential-plots',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In strict compliance with rule: Contact forms generate a WhatsApp direct message
    // and do not claim to save enquiries on a remote server.
    const url = buildWhatsAppLink({
      senderName: formData.name,
      senderPhone: formData.phone,
      category: formData.category,
      customMessage: formData.message
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E5E1D8] pb-8 space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C5A46D] font-semibold">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#142C38]">
          Direct Consultation & Inquiries
        </h1>
        <p className="text-sm text-[#242424]/75 max-w-2xl font-light">
          Connect directly with Amman Real Estate for property queries, plot verification, and scheduled on-site inspections in Thanjavur.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Contact Form that launches WhatsApp message */}
        <div className="bg-white border border-[#E5E1D8] p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#142C38]">
              Send an Inquiry via WhatsApp
            </h2>
            <p className="text-xs text-[#242424]/70">
              Complete the form below to automatically generate and send your inquiry via WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#E5E1D8] focus:border-[#C5A46D] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#E5E1D8] focus:border-[#C5A46D] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1">
                Property Interest
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#E5E1D8] focus:border-[#C5A46D] focus:outline-none"
              >
                <option value="Residential Plot">Residential Plot (House Site)</option>
                <option value="Villa / Independent House">Villa / Independent House</option>
                <option value="Agricultural Farmland">Agricultural Farmland</option>
                <option value="Commercial Land">Commercial Land / Highway Site</option>
                <option value="General Consultation">General Consultation</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1">
                Inquiry Details
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Specify preferred locality, budget range, or plot dimension..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#E5E1D8] focus:border-[#C5A46D] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#142C38] text-[#C5A46D] border border-[#C5A46D] hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors font-semibold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Generate & Launch WhatsApp Message</span>
            </button>

            <div className="flex items-center space-x-2 text-[11px] text-[#242424]/60 pt-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C5A46D] shrink-0" />
              <span>No data is stored on remote servers; submission launches WhatsApp with your inquiry.</span>
            </div>
          </form>
        </div>

        {/* Right: Direct Contact Cards */}
        <div className="space-y-6">
          <div className="bg-[#142C38] text-[#F7F5F0] p-8 border-l-4 border-[#C5A46D] space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#F7F5F0]">
              Direct Channels
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3 text-[#F7F5F0]/85">
                <MapPin className="w-5 h-5 text-[#C5A46D] mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-[#F7F5F0]">Office & Site Visits:</strong>
                  <span className="text-xs text-[#F7F5F0]/70 leading-relaxed">
                    {SITE_CONFIG.location.addressNotice}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-[#F7F5F0]/85">
                <Phone className="w-5 h-5 text-[#C5A46D] mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-[#F7F5F0]">Hotline Phone:</strong>
                  <span className="text-xs text-[#F7F5F0]/70">
                    {SITE_CONFIG.contact.phoneDisplay}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-[#F7F5F0]/85">
                <MessageCircle className="w-5 h-5 text-[#C5A46D] mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-[#F7F5F0]">Official WhatsApp:</strong>
                  <span className="text-xs text-[#F7F5F0]/70">
                    https://wa.me/919894215932
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F7F5F0]/10">
              <a
                href={SITE_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-[#C5A46D] text-[#142C38] font-bold text-xs uppercase tracking-wider hover:bg-[#D6BC8C] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Immediately</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-white border border-[#E5E1D8] p-6 text-xs text-[#242424]/75 space-y-2">
            <h3 className="font-serif text-base font-bold text-[#142C38]">
              Operating Hours & Consultations
            </h3>
            <p className="leading-relaxed">
              {SITE_CONFIG.hoursPlaceholder}
            </p>
            <p className="leading-relaxed text-[#242424]/60">
              Prospective buyers and land investors are encouraged to message on WhatsApp to schedule property inspections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
