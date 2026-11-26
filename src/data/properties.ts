import type { Property } from '../types';

/**
 * Centralized property database.
 * STRICT CONTENT COMPLIANCE:
 * - Never invent real property prices, customer reviews, legal approvals, or statistics.
 * - All entries are clearly labeled demonstration items flagged with `isDemoPlaceholder: true`
 *   and explicit `[Sample Listing - For Demonstration]` tags.
 * - Total Price represents the complete property price in Indian Rupees.
 * - Price per sq.ft is never used or calculated.
 */
export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'prop-plot-01',
    title: 'Residential Layout Plot in Vallam Growth Corridor',
    category: 'land-plots',
    categoryDisplay: 'Land & Plots',
    location: 'Vallam, Thanjavur',
    areaSector: 'Vallam - Trichy Highway Sector',
    priceEstimateDisplay: '₹28,00,000 [Sample Total Price]',
    sizeDisplay: '2,400 sq.ft (Sample)',
    dimensions: '40 x 60 ft (Sample)',
    facing: 'East Facing (Sample)',
    roadWidth: '30 Ft Blacktop Approach Road',
    isDemoPlaceholder: true,
    shortDescription: 'Sample surveyed layout plot located along the growing educational and residential corridor of Vallam.',
    fullDescription: '[SAMPLE LISTING FOR DEMONSTRATION ONLY] Representative layout plot illustrating offerings in the Thanjavur region. These are demonstration listings. Actual property details, documentation, approvals and pricing should be confirmed directly before making a decision.',
    highlights: [
      'Sample entry for website design review',
      'Fast-developing residential zone',
      'Proximity to higher educational institutions',
      'Clear approach road connectivity'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    specifications: {
      plotSize: { value: 2400, unit: 'sq.ft' },
      borewell: false,
      totalPrice: 2800000
    }
  },
  {
    id: 'prop-house-02',
    title: 'Contemporary Independent House near Medical College Road',
    category: 'residential-houses',
    categoryDisplay: 'Residential House',
    location: 'Medical College Road, Thanjavur',
    areaSector: 'Medical College Residential Sector',
    priceEstimateDisplay: '₹65,00,000 [Sample Total Price]',
    sizeDisplay: '1,850 sq.ft Built-up (Sample)',
    dimensions: '30 x 50 ft Site (Sample)',
    facing: 'North Facing (Sample)',
    roadWidth: '33 Ft Tar Road',
    isDemoPlaceholder: true,
    shortDescription: 'Sample prime residential home in the established Medical College residential hub of Thanjavur.',
    fullDescription: '[SAMPLE LISTING FOR DEMONSTRATION ONLY] Representative residential house demonstrating property presentation in Thanjavur. These are demonstration listings. Actual property details, documentation, approvals and pricing should be confirmed directly before making a decision.',
    highlights: [
      'Sample entry for website design review',
      'Established residential neighborhood',
      'Reliable municipal infrastructure',
      'Convenient access to hospital and urban amenities'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    specifications: {
      plotSize: { value: 1500, unit: 'sq.ft' },
      buildingSize: { value: 1850, unit: 'sq.ft' },
      borewell: true,
      numberOfRooms: 4,
      numberOfToilets: 3,
      totalPrice: 6500000
    }
  },
  {
    id: 'prop-comm-03',
    title: 'Commercial Frontage Site near New Bus Stand Bypass',
    category: 'commercial',
    categoryDisplay: 'Commercial Property',
    location: 'New Bus Stand Bypass, Thanjavur',
    areaSector: 'Transit & Commercial Zone',
    priceEstimateDisplay: '₹1,20,00,000 [Sample Total Price]',
    sizeDisplay: '4,800 sq.ft (Sample)',
    facing: 'Main Highway Frontage',
    roadWidth: '60 Ft Highway / Bypass',
    isDemoPlaceholder: true,
    shortDescription: 'Sample high-visibility commercial plot ideal for showrooms, logistics, or commercial construction.',
    fullDescription: '[SAMPLE LISTING FOR DEMONSTRATION ONLY] Representative commercial property illustrating listing structure. These are demonstration listings. Actual property details, documentation, approvals and pricing should be confirmed directly before making a decision.',
    highlights: [
      'Sample entry for website design review',
      'High vehicular movement corridor',
      'Substantial road frontage',
      'Direct connectivity to Trichy - Nagapattinam arterial route'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    specifications: {
      plotSize: { value: 4800, unit: 'sq.ft' },
      buildingSize: { value: 3200, unit: 'sq.ft' },
      borewell: true,
      numberOfRooms: 6,
      numberOfToilets: 4,
      totalPrice: 12000000
    }
  },
  {
    id: 'prop-plot-04',
    title: 'Surveyed Layout Plot near Kumbakonam Highway',
    category: 'land-plots',
    categoryDisplay: 'Land & Plots',
    location: 'Kumbakonam Road, Thanjavur',
    areaSector: 'Kumbakonam Highway Corridor',
    priceEstimateDisplay: 'Price on Consultation [Sample Listing]',
    sizeDisplay: '5.5 cents (Sample)',
    dimensions: 'Surveyed Boundaries (Sample)',
    facing: 'East Facing (Sample)',
    roadWidth: '30 Ft Approach Road',
    isDemoPlaceholder: true,
    shortDescription: 'Sample surveyed plot in a scenic suburban setting with easy access to Thanjavur town.',
    fullDescription: '[SAMPLE LISTING FOR DEMONSTRATION ONLY] Representative layout plot demonstrating property presentation in suburban Thanjavur. These are demonstration listings. Actual property details, documentation, approvals and pricing should be confirmed directly before making a decision.',
    highlights: [
      'Sample entry for website design review',
      'Peaceful suburban ambiance',
      'Close to Thanjavur-Kumbakonam artery',
      'Well-demarcated boundary markers'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80',
    specifications: {
      plotSize: { value: 5.5, unit: 'cents' },
      borewell: false
      // totalPrice omitted intentionally to verify that missing price is cleanly hidden
    }
  },
  {
    id: 'prop-house-05',
    title: 'Independent Family Home in Pudukkottai Road Sector',
    category: 'residential-houses',
    categoryDisplay: 'Residential House',
    location: 'Pudukkottai Road, Thanjavur',
    areaSector: 'Pudukkottai Highway Zone',
    priceEstimateDisplay: '₹78,00,000 [Sample Total Price]',
    sizeDisplay: '2,100 sq.ft Built-up (Sample)',
    dimensions: '40 x 50 ft Site (Sample)',
    facing: 'South / East (Sample)',
    roadWidth: '30 Ft Concrete Road',
    isDemoPlaceholder: true,
    shortDescription: 'Sample modern family home situated in the expanding southern residential sector of Thanjavur.',
    fullDescription: '[SAMPLE LISTING FOR DEMONSTRATION ONLY] Representative independent house entry demonstrating listing structure. These are demonstration listings. Actual property details, documentation, approvals and pricing should be confirmed directly before making a decision.',
    highlights: [
      'Sample entry for website design review',
      'Spacious layout suited for families',
      'Ample natural ventilation and parking space',
      'Direct connectivity to southern bypass'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    specifications: {
      plotSize: { value: 2000, unit: 'sq.ft' },
      buildingSize: { value: 2100, unit: 'sq.ft' },
      borewell: true,
      numberOfRooms: 5,
      numberOfToilets: 3,
      totalPrice: 7800000
    }
  },
  {
    id: 'prop-comm-06',
    title: 'Arterial Road Commercial Building Site on Trichy Bypass',
    category: 'commercial',
    categoryDisplay: 'Commercial Property',
    location: 'Trichy Bypass Corridor, Thanjavur',
    areaSector: 'Highway Commercial Sector',
    priceEstimateDisplay: '₹95,00,000 [Sample Total Price]',
    sizeDisplay: '3,600 sq.ft (Sample)',
    facing: 'High-Visibility Frontage',
    roadWidth: '80 Ft National Highway Corridor',
    isDemoPlaceholder: true,
    shortDescription: 'Sample road-facing commercial site suitable for corporate offices, warehousing, or retail facilities.',
    fullDescription: '[SAMPLE LISTING FOR DEMONSTRATION ONLY] Illustrates commercial property presentations. These are demonstration listings. Actual property details, documentation, approvals and pricing should be confirmed directly before making a decision.',
    highlights: [
      'Sample entry for website design review',
      'Prominent arterial visibility',
      'Heavy freight and passenger movement',
      'Wide turning radius approach'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
    specifications: {
      plotSize: { value: 3600, unit: 'sq.ft' },
      buildingSize: { value: 2800, unit: 'sq.ft' },
      borewell: true,
      // numberOfRooms omitted intentionally to test optional field hiding
      numberOfToilets: 2,
      totalPrice: 9500000
    }
  }
];
