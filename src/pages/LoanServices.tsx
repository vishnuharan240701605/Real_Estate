import React, { useState } from 'react';
import { 
  Building2, 
  MessageCircle, 
  ShieldAlert, 
  Check, 
  FileCheck, 
  ArrowRight, 
  Landmark, 
  Phone,
  HelpCircle
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { LOAN_CATEGORIES, LOAN_DISCLAIMER_TEXT } from '../data/loanServices';
import { 
  buildLoanInquiryWhatsAppLink, 
  buildQuickLoanWhatsAppLink 
} from '../utils/whatsapp';
import type { LoanType } from '../types';

export const LoanServices: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    loanType: 'Home Loan' as LoanType,
    approximateAmount: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form Validation & Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Please provide your full name.';
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      errors.phone = 'Please provide a valid contact phone number.';
    }

    if (!formData.loanType) {
      errors.loanType = 'Please select a loan category.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Generate formatted WhatsApp message
    const url = buildLoanInquiryWhatsAppLink({
      fullName: formData.fullName,
      phone: formData.phone,
      loanType: formData.loanType,
      approximateAmount: formData.approximateAmount,
      message: formData.message
    });

    // In accordance with guidelines: No backend/database storage.
    // Launches WhatsApp with the pre-formatted inquiry.
    window.open(url, '_blank', 'noopener,noreferrer');
    setFormSubmitted(true);
  };

  const handleSelectLoanType = (loanTitle: LoanType) => {
    setFormData(prev => ({ ...prev, loanType: loanTitle }));
    const formElement = document.getElementById('loan-enquiry-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* =========================================================================
          HERO SECTION
          Heading: "Financial Assistance for Your Property Goals"
          Supporting text: "Explore loan assistance for residential and commercial property requirements through banks and financial institutions."
          CTA: "Enquire on WhatsApp"
      ========================================================================= */}
      <section className="relative bg-[#142C38] text-[#F7F5F0] overflow-hidden py-16 md:py-24 border-b border-[#C5A46D]/40">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
            alt="Amman Real Estate Loan Services"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#C5A46D]/15 border border-[#C5A46D]/40 text-[#C5A46D] text-xs uppercase tracking-widest font-semibold backdrop-blur-sm">
            <Landmark className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span>Bank & Financial Institution Assistance</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F7F5F0] leading-tight">
              Financial Assistance for Your Property Goals
            </h1>

            <p className="text-base sm:text-lg text-[#F7F5F0]/85 font-light leading-relaxed">
              Explore loan assistance for residential and commercial property requirements through banks and financial institutions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <a
              href={buildQuickLoanWhatsAppLink('Property Loan')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-[#C5A46D] text-[#142C38] font-bold text-xs uppercase tracking-widest hover:bg-[#D6BC8C] transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enquire on WhatsApp</span>
            </a>

            <a
              href="#loan-categories"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-transparent text-[#F7F5F0] border border-[#F7F5F0]/30 hover:border-[#C5A46D] hover:text-[#C5A46D] font-medium text-xs uppercase tracking-widest transition-colors"
            >
              <span>Explore Loan Categories</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          IMPORTANT MANDATORY DISCLAIMER
          Clear, visible disclosure of role as facilitator, not a bank.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#F7F5F0] border-l-4 border-[#C5A46D] border-y border-r border-[#E5E1D8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-[#C5A46D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#142C38] font-bold">
              Important Lending Disclaimer
            </span>
            <p className="text-xs sm:text-sm text-[#242424]/80 leading-relaxed">
              {LOAN_DISCLAIMER_TEXT}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THREE LOAN CATEGORIES
          Home Loan / Mortgage Loan / Commercial Loan
          Each with professional imagery, title, description, and "Enquire Now" button.
      ========================================================================= */}
      <section id="loan-categories" className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="border-b border-[#E5E1D8] pb-6 space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
            Loan Solutions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142C38]">
            Loan Assistance Categories
          </h2>
          <p className="text-sm text-[#242424]/75 max-w-2xl font-light">
            We assist clients in coordinating with banks and financial institutions for structured property loans tailored to their individual requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LOAN_CATEGORIES.map(category => (
            <article
              key={category.id}
              className="bg-white border border-[#E5E1D8] hover:border-[#C5A46D] transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md group"
            >
              <div>
                {/* Category Image */}
                <div className="relative aspect-[16/10] bg-[#142C38] overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 left-3 bg-[#142C38]/90 text-[#C5A46D] text-[10px] tracking-wider uppercase font-mono px-2.5 py-1 border border-[#C5A46D]/30 backdrop-blur-xs">
                    {category.subtitle}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-2xl font-bold text-[#142C38]">
                      {category.title}
                    </h3>
                    <p className="text-xs text-[#242424]/75 leading-relaxed font-light">
                      {category.description}
                    </p>
                  </div>

                  {/* Key Scope Points */}
                  <ul className="space-y-2 pt-3 border-t border-[#E5E1D8] text-xs text-[#242424]/80">
                    {category.features.map((feat, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 text-[#C5A46D] mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2">
                <a
                  href={buildQuickLoanWhatsAppLink(category.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-[#142C38] text-[#F7F5F0] hover:bg-[#C5A46D] hover:text-[#142C38] font-semibold text-xs uppercase tracking-widest transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire Now</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleSelectLoanType(category.title)}
                  className="w-full py-2 text-center text-xs text-[#142C38] hover:text-[#C5A46D] font-medium transition-colors border border-transparent hover:border-[#E5E1D8]"
                >
                  Fill Inquiry Form Below
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================================
          TRANSPARENT PROCESS HIGHLIGHTS
          Explaining how assistance works without promising approvals or rates.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="bg-[#142C38] text-[#F7F5F0] p-8 md:p-12 border-l-4 border-[#C5A46D] space-y-8">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-mono font-medium">
              Facilitation Procedure
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F7F5F0]">
              How Loan Assistance Works
            </h2>
            <p className="text-xs sm:text-sm text-[#F7F5F0]/75 max-w-2xl font-light">
              We guide you through preparing documentation and connecting with suitable lending institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#F7F5F0]/80">
            <div className="bg-[#0D1E27] border border-[#C5A46D]/20 p-5 space-y-3">
              <span className="w-7 h-7 bg-[#C5A46D] text-[#142C38] font-bold font-mono rounded-full flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif text-base font-bold text-[#F7F5F0]">
                Requirement & Property Review
              </h3>
              <p className="leading-relaxed font-light text-[#F7F5F0]/70">
                We review your intended property purchase or existing collateral details to understand your financing requirements.
              </p>
            </div>

            <div className="bg-[#0D1E27] border border-[#C5A46D]/20 p-5 space-y-3">
              <span className="w-7 h-7 bg-[#C5A46D] text-[#142C38] font-bold font-mono rounded-full flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif text-base font-bold text-[#F7F5F0]">
                Bank Connection & File Assembly
              </h3>
              <p className="leading-relaxed font-light text-[#F7F5F0]/70">
                We connect you with appropriate banking officers and help assemble property documents required for loan processing.
              </p>
            </div>

            <div className="bg-[#0D1E27] border border-[#C5A46D]/20 p-5 space-y-3">
              <span className="w-7 h-7 bg-[#C5A46D] text-[#142C38] font-bold font-mono rounded-full flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif text-base font-bold text-[#F7F5F0]">
                Institutional Evaluation
              </h3>
              <p className="leading-relaxed font-light text-[#F7F5F0]/70">
                The respective bank or financial institution conducts legal scrutiny, property valuation, and determines final eligibility and approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LOAN ENQUIRY FORM SECTION
          Responsive form with Full Name, Phone Number, Loan Type, Approximate Amount,
          and Message. Generates pre-filled WhatsApp link upon validation.
      ========================================================================= */}
      <section id="loan-enquiry-form" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white border border-[#E5E1D8] p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2 border-b border-[#E5E1D8] pb-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
                Direct Submission
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142C38]">
                Request Loan Assistance via WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-[#242424]/70 font-light">
                Fill in your loan requirement details below to generate and launch a pre-formatted inquiry directly on WhatsApp.
              </p>
            </div>

            {formSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>WhatsApp conversation launched!</span>
                </p>
                <p>
                  Please send the pre-filled message in WhatsApp to connect directly with our loan coordination team.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label 
                  htmlFor="fullName" 
                  className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1"
                >
                  Full Name <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={e => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (formErrors.fullName) {
                      setFormErrors(prev => ({ ...prev, fullName: '' }));
                    }
                  }}
                  placeholder="e.g. Anandha Kumar"
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border ${
                    formErrors.fullName ? 'border-red-500' : 'border-[#E5E1D8]'
                  } focus:border-[#C5A46D] focus:outline-none`}
                />
                {formErrors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1"
                >
                  Phone Number <span className="text-amber-700">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={e => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (formErrors.phone) {
                      setFormErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border ${
                    formErrors.phone ? 'border-red-500' : 'border-[#E5E1D8]'
                  } focus:border-[#C5A46D] focus:outline-none`}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Loan Type */}
              <div>
                <label 
                  htmlFor="loanType" 
                  className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1"
                >
                  Loan Type <span className="text-amber-700">*</span>
                </label>
                <select
                  id="loanType"
                  name="loanType"
                  required
                  value={formData.loanType}
                  onChange={e => {
                    setFormData({ ...formData, loanType: e.target.value as LoanType });
                    if (formErrors.loanType) {
                      setFormErrors(prev => ({ ...prev, loanType: '' }));
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border ${
                    formErrors.loanType ? 'border-red-500' : 'border-[#E5E1D8]'
                  } focus:border-[#C5A46D] focus:outline-none`}
                >
                  <option value="Home Loan">Home Loan (Purchase or Construction)</option>
                  <option value="Mortgage Loan">Mortgage Loan (Against Existing Property)</option>
                  <option value="Commercial Loan">Commercial Loan (Commercial Property & Business)</option>
                </select>
                {formErrors.loanType && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.loanType}</p>
                )}
              </div>

              {/* Approximate Loan Amount (Optional) */}
              <div>
                <label 
                  htmlFor="approximateAmount" 
                  className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1"
                >
                  Approximate Loan Amount <span className="text-[#242424]/50 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  id="approximateAmount"
                  name="approximateAmount"
                  value={formData.approximateAmount}
                  onChange={e => setFormData({ ...formData, approximateAmount: e.target.value })}
                  placeholder="e.g. ₹35,00,000"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#E5E1D8] focus:border-[#C5A46D] focus:outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label 
                  htmlFor="message" 
                  className="block text-xs uppercase tracking-wider text-[#242424]/80 font-semibold mb-1"
                >
                  Property / Inquiry Details <span className="text-[#242424]/50 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify property location, employment status (salaried/business), or any specific questions..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F7F5F0] border border-[#E5E1D8] focus:border-[#C5A46D] focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 px-6 bg-[#142C38] text-[#C5A46D] border border-[#C5A46D] hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors font-semibold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Generate Loan Inquiry on WhatsApp</span>
              </button>

              <p className="text-[11px] text-[#242424]/60 text-center pt-1">
                Submission directly formats and launches your message to {SITE_CONFIG.contact.phoneDisplay} on WhatsApp. No data is stored on remote servers.
              </p>
            </form>
          </div>

          {/* Form Right Sidebar: Contact & Assistance Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#142C38] text-[#F7F5F0] p-6 sm:p-8 border-l-4 border-[#C5A46D] space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#F7F5F0]">
                Direct Coordination
              </h3>

              <div className="space-y-4 text-xs text-[#F7F5F0]/80">
                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#F7F5F0]">Consultation Line:</strong>
                    <span>{SITE_CONFIG.contact.phoneDisplay}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#F7F5F0]">Location:</strong>
                    <span>Thanjavur, Tamil Nadu</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileCheck className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#F7F5F0]">Documentation Support:</strong>
                    <span>Patta, parent deed, layout approval copy coordination</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F7F5F0]/15">
                <a
                  href={SITE_CONFIG.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-[#C5A46D] text-[#142C38] font-bold text-xs uppercase tracking-wider hover:bg-[#D6BC8C] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Loan Coordinator</span>
                </a>
              </div>
            </div>

            <div className="bg-[#F7F5F0] border border-[#E5E1D8] p-6 text-xs text-[#242424]/75 space-y-2">
              <h4 className="font-serif text-sm font-bold text-[#142C38] flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-[#C5A46D]" />
                <span>Common Inquiries</span>
              </h4>
              <p className="leading-relaxed">
                Customers frequently enquire about required income documents, bank processing timelines, and property guideline value evaluations. We guide you on document assembly before formal bank submission.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoanServices;
