import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MessageCircle, 
  MapPin, 
  Check, 
  ShieldCheck, 
  Compass, 
  Scale, 
  PhoneCall, 
  Building2, 
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { PROPERTY_CATEGORIES } from '../data/categories';
import { THANJAVUR_AREAS_OF_INTEREST } from '../data/thanjavurAreas';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { propertyService } from '../services/propertyService';
import type { Property } from '../types';

export const Home: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  // Update document title for SEO on homepage mount
  useEffect(() => {
    document.title = `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`;
  }, []);

  // Fetch real published listings for the homepage featured showcase
  useEffect(() => {
    let isMounted = true;

    propertyService
      .getFeaturedPublishedProperties(3)
      .then((res) => {
        if (!isMounted) return;
        if (res.error && res.properties.length === 0) {
          setFeaturedError(res.error);
        } else {
          setFeaturedProperties(res.properties);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setFeaturedError(err instanceof Error ? err.message : 'Failed to fetch featured properties.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingFeatured(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-20 md:space-y-28 pb-16">
      {/* =========================================================================
          SECTION 1 – PREMIUM HERO
          Large high-quality architectural background, Playfair Display serif headline,
          short supporting text, and two clear, working CTAs.
      ========================================================================= */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center bg-[#142C38] text-[#F7F5F0] overflow-hidden">
        {/* Background Architectural Photography */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt="Amman Real Estate Thanjavur Architectural Property"
            className="w-full h-full object-cover object-center opacity-30 sm:opacity-35 scale-105 transition-transform duration-1000"
          />
          {/* Editorial Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#142C38] via-[#142C38]/90 to-[#142C38]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#142C38] via-transparent to-transparent opacity-80" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20 md:py-28 w-full">
          <div className="max-w-3xl space-y-8">
            {/* Location & Brand Micro-Badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 bg-[#C5A46D]/15 border border-[#C5A46D]/40 text-[#C5A46D] text-xs uppercase tracking-widest font-semibold backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span>Thanjavur, Tamil Nadu, India</span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F7F5F0] leading-[1.12]">
              Find Your Property. <br />
              <span className="text-[#C5A46D] italic font-normal">Build Your Future.</span>
            </h1>

            {/* Short, Professional Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-[#F7F5F0]/85 font-light leading-relaxed max-w-2xl">
              Welcome to <strong className="font-medium text-[#F7F5F0]">{SITE_CONFIG.name}</strong>, a real estate consultancy based in Thanjavur, Tamil Nadu. We assist clients in exploring residential houses, land plots, and commercial properties across local growth corridors.
            </p>

            {/* Two Clear, Accessible CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Primary CTA */}
              <Link
                to="/properties"
                className="inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-[#C5A46D] text-[#142C38] font-bold text-xs uppercase tracking-widest hover:bg-[#D6BC8C] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Secondary CTA */}
              <a
                href={SITE_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-transparent text-[#F7F5F0] border border-[#C5A46D]/80 hover:border-[#C5A46D] hover:bg-[#C5A46D]/15 font-semibold text-xs uppercase tracking-widest transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 text-[#C5A46D]" />
                <span>Contact on WhatsApp</span>
              </a>
            </div>

            {/* Reassurance Features Bar */}
            <div className="pt-8 border-t border-[#F7F5F0]/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#F7F5F0]/75">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#C5A46D] rounded-full shrink-0" />
                <span>Direct WhatsApp Consultation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#C5A46D] rounded-full shrink-0" />
                <span>Thanjavur Growth Corridors</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#C5A46D] rounded-full shrink-0" />
                <span>Due Diligence Guidance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delicate Gold Baseline Stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A46D]/40" />
      </section>


      {/* =========================================================================
          SECTION 2 – EXPLORE PROPERTY CATEGORIES
          Three image-based category cards (Residential Houses, Land & Plots,
          Commercial Properties) linking directly to /properties?category=...
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E1D8] pb-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
              Property Discovery
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142C38]">
              Explore by Property Type
            </h2>
            <p className="text-sm text-[#242424]/75 max-w-2xl font-light">
              Select a category to browse tailored opportunities across Thanjavur's prime residential, plotting, and commercial sectors.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest font-semibold text-[#142C38] hover:text-[#C5A46D] transition-colors pb-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Visually Attractive Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROPERTY_CATEGORIES.map(category => (
            <div
              key={category.id}
              className="group bg-white border border-[#E5E1D8] hover:border-[#C5A46D] transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Category Image with Consistent Ratio & Subtle Zoom */}
              <div className="relative aspect-[16/11] bg-[#142C38] overflow-hidden">
                <img
                  src={category.imageUrl}
                  alt={category.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142C38]/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <span className="absolute bottom-3 left-4 text-[11px] uppercase tracking-widest font-mono text-[#F7F5F0] bg-[#142C38]/85 px-2.5 py-1 backdrop-blur-xs border border-[#C5A46D]/30">
                  {category.subtitle}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-[#142C38] group-hover:text-[#1D3B4B] transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-xs text-[#242424]/75 leading-relaxed font-light">
                    {category.description}
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="pt-2 border-t border-[#E5E1D8] space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {category.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] uppercase tracking-wider bg-[#F7F5F0] text-[#142C38] px-2 py-0.5 border border-[#E5E1D8]"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Functional Navigation Link to Filtered Properties */}
                  <Link
                    to={`/properties?category=${category.id}`}
                    className="w-full inline-flex items-center justify-between py-3 px-4 bg-[#F7F5F0] text-[#142C38] group-hover:bg-[#142C38] group-hover:text-[#C5A46D] border border-[#E5E1D8] group-hover:border-[#142C38] font-semibold text-xs uppercase tracking-wider transition-all duration-300"
                  >
                    <span>Explore {category.title}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* =========================================================================
          SECTION 3 – FEATURED PROPERTIES
          Live published properties from Supabase directory.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E1D8] pb-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
              Featured Selections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142C38]">
              Published Property Highlights
            </h2>
            <p className="text-sm text-[#242424]/75 max-w-2xl font-light">
              Explore active property opportunities in Thanjavur, sourced directly from our verified inventory.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest font-semibold text-[#142C38] hover:text-[#C5A46D] transition-colors pb-1"
          >
            <span>View Complete Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clear Transparency Alert */}
        <div className="bg-[#142C38] text-[#F7F5F0] p-4 text-xs border-l-4 border-[#C5A46D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#C5A46D] shrink-0" />
            <span className="font-light">
              Actual property details, documentation, survey boundaries, approvals and pricing should be confirmed directly with Amman Real Estate.
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[#C5A46D] font-mono shrink-0">
            [Verification Notice]
          </span>
        </div>

        {/* Property Cards Grid */}
        {isLoadingFeatured ? (
          <div className="bg-white border border-[#E5E1D8] p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#C5A46D] animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-wider text-[#142C38] font-semibold">
              Loading Featured Properties...
            </p>
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((prop) => (
              <article
                key={prop.id}
                className="bg-white border border-[#E5E1D8] flex flex-col group hover:border-[#C5A46D] transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] bg-[#142C38] overflow-hidden">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Category / Type Badge */}
                  <span className="absolute top-3 left-3 bg-[#142C38] text-[#C5A46D] text-xs tracking-wider uppercase font-medium px-2.5 py-1">
                    {prop.propertyTypeDisplay || prop.categoryDisplay}
                  </span>

                  {/* Verification Marker */}
                  {prop.isDemoPlaceholder ? (
                    <span className="absolute top-3 right-3 bg-black/85 text-white text-[10px] tracking-wider uppercase px-2 py-0.5 font-mono border border-white/20">
                      Sample
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-emerald-900/90 text-emerald-100 text-[10px] tracking-wider uppercase px-2 py-0.5 font-mono border border-emerald-500/30">
                      Verified
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs text-[#C5A46D] font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{prop.location}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#142C38] group-hover:text-[#1D3B4B] transition-colors line-clamp-2">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-[#242424]/70 leading-relaxed line-clamp-2 font-light">
                      {prop.shortDescription}
                    </p>
                  </div>

                  {/* Specification Highlights */}
                  <div className="space-y-3 pt-3 border-t border-[#E5E1D8]">
                    <div className="flex items-center justify-between text-xs text-[#242424]/80">
                      <span className="font-medium text-[#242424]/60">Area / Extent:</span>
                      <span className="font-mono font-medium text-[#142C38]">
                        {prop.sizeDisplay}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#242424]/80">
                      <span className="font-medium text-[#242424]/60">Pricing Status:</span>
                      <span className="text-[#C5A46D] font-semibold">
                        {prop.priceEstimateDisplay}
                      </span>
                    </div>

                    {/* Functional Action Buttons */}
                    <div className="pt-2 flex items-center space-x-2">
                      <Link
                        to={`/properties/${prop.slug || prop.id}`}
                        className="flex-1 py-2.5 text-center text-xs uppercase tracking-wider font-semibold bg-[#142C38] text-[#F7F5F0] hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors inline-flex items-center justify-center space-x-1.5"
                      >
                        <span>Inspect Property</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={buildWhatsAppLink({
                          propertyId: prop.id,
                          propertyTitle: prop.title,
                          category: prop.propertyTypeDisplay || prop.categoryDisplay,
                          totalPrice:
                            prop.priceEstimateDisplay !== 'Price on Consultation'
                              ? prop.priceEstimateDisplay
                              : undefined,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 border border-[#C5A46D] text-[#142C38] hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors"
                        aria-label={`Inquire about ${prop.title} on WhatsApp`}
                      >
                        <MessageCircle className="w-4 h-4 text-[#C5A46D] group-hover:text-[#142C38]" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty or Loading Error State */
          <div className="bg-white border border-[#E5E1D8] p-12 text-center space-y-4">
            <Building2 className="w-12 h-12 text-[#C5A46D]/40 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#142C38]">
              Property Listings Being Updated
            </h3>
            <p className="text-sm text-[#242424]/70 max-w-md mx-auto font-light">
              {featuredError
                ? 'Unable to load featured highlights at this time. Please explore our full directory or reach out directly.'
                : 'Browse our full properties directory to explore available residential, plot, and commercial options across Thanjavur.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/properties"
                className="px-6 py-2.5 bg-[#142C38] text-[#C5A46D] text-xs uppercase tracking-wider font-semibold hover:bg-[#0D1E27] transition-colors"
              >
                Browse All Properties
              </Link>
            </div>
          </div>
        )}
      </section>


      {/* =========================================================================
          SECTION 4 – ABOUT AMMAN REAL ESTATE
          Truthful, neutral business introduction.
          No invented history, awards, or statistics.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white border border-[#E5E1D8] p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Neutral Business Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
                About Our Consultancy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142C38] leading-tight">
                About Amman Real Estate
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#242424]/80 leading-relaxed font-light">
              Based in Thanjavur, Tamil Nadu, <strong>{SITE_CONFIG.name}</strong> provides real estate facilitation, land identification, and property consulting. Our role is to assist buyers, families, and commercial investors in navigating the property landscape of the delta capital with clarity and confidence.
            </p>

            <p className="text-sm sm:text-base text-[#242424]/80 leading-relaxed font-light">
              We focus on understanding your specific requirements—whether you are looking for an independent residential house, a surveyed plot ready for construction, or a commercial development site. We prioritize open communication and encourage comprehensive legal verification before any purchase commitment.
            </p>

            {/* Truthful Operational Commitments */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#242424]/80">
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                <span>On-site visits coordinated across Thanjavur</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                <span>Independent document verification recommended</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                <span>Direct WhatsApp consultation channels</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                <span>Zero fabricated sales statistics or claims</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-[#142C38] hover:text-[#C5A46D] transition-colors border-b border-[#142C38] hover:border-[#C5A46D] pb-1"
              >
                <span>Read Full Agency Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Architectural Visual Framing */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] bg-[#142C38] overflow-hidden border border-[#E5E1D8]">
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
                alt="Amman Real Estate Thanjavur Consultation"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#142C38]/10" />
            </div>

            {/* Decorative Gold Accent Badge */}
            <div className="absolute -bottom-4 -left-4 bg-[#142C38] text-[#F7F5F0] border border-[#C5A46D] p-4 shadow-xl max-w-xs hidden sm:block">
              <p className="text-xs uppercase tracking-widest text-[#C5A46D] font-mono font-medium">
                Thanjavur, Tamil Nadu
              </p>
              <p className="font-serif text-sm font-semibold mt-1 text-[#F7F5F0]">
                {SITE_CONFIG.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 5 – WHY CHOOSE US
          Highlighting transparent communication, understanding customer requirements,
          and due diligence assistance. Strictly no invented statistics or claims.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
            Our Advisory Principles
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142C38]">
            Why Work With Amman Real Estate
          </h2>
          <p className="text-sm text-[#242424]/75 font-light leading-relaxed">
            Our approach is built on transparency, thorough legal examination, and finding properties that genuinely align with your expectations.
          </p>
        </div>

        {/* 4 Clean Principle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-[#E5E1D8] p-6 space-y-4 hover:border-[#C5A46D] transition-colors">
            <div className="w-10 h-10 bg-[#142C38] text-[#C5A46D] flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#142C38]">
              Transparent Communication
            </h3>
            <p className="text-xs text-[#242424]/75 leading-relaxed font-light">
              Direct, honest advice without artificial pressure. We discuss property realities, road widths, and connectivity openly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#E5E1D8] p-6 space-y-4 hover:border-[#C5A46D] transition-colors">
            <div className="w-10 h-10 bg-[#142C38] text-[#C5A46D] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#142C38]">
              Requirement Matching
            </h3>
            <p className="text-xs text-[#242424]/75 leading-relaxed font-light">
              We listen to your specific investment parameters—budget, plot dimension, facing, or proximity to schools and transport corridors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#E5E1D8] p-6 space-y-4 hover:border-[#C5A46D] transition-colors">
            <div className="w-10 h-10 bg-[#142C38] text-[#C5A46D] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#142C38]">
              Due Diligence Guidance
            </h3>
            <p className="text-xs text-[#242424]/75 leading-relaxed font-light">
              We encourage buyers to conduct thorough independent checks of title documents, revenue records, encumbrance certificates, and relevant approvals.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#E5E1D8] p-6 space-y-4 hover:border-[#C5A46D] transition-colors">
            <div className="w-10 h-10 bg-[#142C38] text-[#C5A46D] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#142C38]">
              Direct WhatsApp Access
            </h3>
            <p className="text-xs text-[#242424]/75 leading-relaxed font-light">
              Quick, hassle-free communication directly with our team on WhatsApp. Easily schedule property viewings or ask questions.
            </p>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 6 – THANJAVUR PROPERTY AREAS (AREAS OF INTEREST)
          Introduces Thanjavur and property-location exploration.
          Presented strictly as geographic areas of interest, NOT confirmed office locations.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="border-b border-[#E5E1D8] pb-6 space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
            Regional Exploration
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#142C38]">
            Thanjavur Areas of Interest
          </h2>
          <p className="text-sm text-[#242424]/75 max-w-3xl font-light leading-relaxed">
            Thanjavur combines deep cultural heritage with strategic infrastructure growth. Below are prominent geographic sectors and transit corridors frequently explored by prospective property buyers.
          </p>
        </div>

        {/* Areas of Interest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {THANJAVUR_AREAS_OF_INTEREST.map(area => (
            <div
              key={area.id}
              className="bg-white border border-[#E5E1D8] p-6 space-y-4 flex flex-col justify-between hover:border-[#C5A46D] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A46D] font-semibold bg-[#142C38] px-2 py-0.5">
                    Area of Interest
                  </span>
                  <span className="text-[#242424]/50 font-mono text-[11px]">
                    Thanjavur
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#142C38]">
                  {area.name}
                </h3>

                <p className="text-xs font-mono text-[#C5A46D] font-medium">
                  {area.corridor}
                </p>

                <p className="text-xs text-[#242424]/75 leading-relaxed font-light">
                  {area.description}
                </p>

                {/* Highlights List */}
                <ul className="space-y-1.5 pt-2 border-t border-[#E5E1D8]/60 text-xs text-[#242424]/80">
                  {area.highlights.map((h, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#C5A46D] rounded-full mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inquire on WhatsApp about this specific area */}
              <div className="pt-4 border-t border-[#E5E1D8]">
                <a
                  href={buildWhatsAppLink({
                    customMessage: `Hello Amman Real Estate, I am interested in exploring property options in the ${area.name} area (${area.corridor}) in Thanjavur.`
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between py-2.5 px-3 bg-[#F7F5F0] hover:bg-[#142C38] text-[#142C38] hover:text-[#C5A46D] text-xs uppercase tracking-wider font-semibold transition-colors"
                >
                  <span>Inquire About This Area</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Geographic Disclaimer Notice */}
        <div className="p-4 bg-[#F7F5F0] border border-[#E5E1D8] text-[11px] text-[#242424]/65 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#142C38] font-medium">Geographic Notice:</strong> The corridors listed above are featured strictly as general geographic areas of interest in Thanjavur for property research. They do not represent branch office locations. All client consultations and property viewings are coordinated through our centralized direct contact.
          </p>
        </div>
      </section>


      {/* =========================================================================
          SECTION 7 – STRONG WHATSAPP ENQUIRY CTA
          Clear, compelling final call-to-action using the existing WhatsApp utility
          and siteConfig.
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative bg-[#142C38] text-[#F7F5F0] p-8 sm:p-14 lg:p-16 border-2 border-[#C5A46D] shadow-2xl overflow-hidden">
          {/* Subtle architectural background texture */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none select-none text-[#F7F5F0]">
            <Building2 className="w-96 h-96" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#C5A46D] font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span>Direct Property Advisory</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F7F5F0] leading-tight">
              Ready to Explore Properties in Thanjavur?
            </h2>

            <p className="text-sm sm:text-base text-[#F7F5F0]/80 leading-relaxed font-light">
              Connect directly with <strong>{SITE_CONFIG.name}</strong>. Share your specific property criteria, budget, or preferred locality in Thanjavur, and we will help you explore suitable property options.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={SITE_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-[#C5A46D] text-[#142C38] font-bold text-xs uppercase tracking-widest hover:bg-[#D6BC8C] transition-all duration-300 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp: {SITE_CONFIG.contact.phoneDisplay}</span>
              </a>

              <Link
                to="/properties"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-transparent text-[#F7F5F0] border border-[#F7F5F0]/40 hover:border-[#C5A46D] hover:text-[#C5A46D] font-medium text-xs uppercase tracking-widest transition-colors"
              >
                <span>Browse All Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Reassurance Micro-Copy */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#F7F5F0]/65 border-t border-[#F7F5F0]/15">
              <span>Direct Consultant Response</span>
              <span>•</span>
              <span>Zero Automated Bots</span>
              <span>•</span>
              <span>No Pressure Advisory</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
