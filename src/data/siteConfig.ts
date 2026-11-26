import type { SiteConfig } from '../types';

export const SITE_CONFIG: SiteConfig = {
  name: "AMMAN REAL ESTATE",
  shortName: "Amman Real Estate",
  tagline: "FIND YOUR PROPERTY. BUILD YOUR FUTURE.",
  location: {
    city: "Thanjavur",
    state: "Tamil Nadu",
    country: "India",
    addressNotice: "Thanjavur, Tamil Nadu (Direct consultation and property visits coordinated via WhatsApp)",
    prominentRegions: [
      "Vallam Growth Corridor",
      "Medical College Road",
      "New Bus Stand & Bypass",
      "Kumbakonam Highway Corridor",
      "Pudukkottai Highway Corridor",
      "Trichy Highway Bypass"
    ],
  },
  contact: {
    phoneDisplay: "+91 98942 15932",
    phoneRaw: "+919894215932",
    whatsappUrl: "https://wa.me/919894215932",
    emailPlaceholder: "consultation@ammanrealestate.com [Placeholder - Direct WhatsApp preferred]",
  },
  hoursPlaceholder: "Consultation available Monday through Saturday. Site visits coordinated upon request.",
  disclaimer: {
    previewNotice: "These are demonstration listings. Actual property details, documentation, approvals and pricing should be confirmed directly before making a decision.",
    legalNote: "Prospective buyers should independently confirm all property details, documentation, approvals and pricing directly before entering into any transaction or making a decision."
  }
};
