import type { PropertyCategoryMeta } from '../types';

export const PROPERTY_CATEGORIES: PropertyCategoryMeta[] = [
  {
    id: 'residential-houses',
    title: 'Residential Houses',
    subtitle: 'Independent Houses & Villas',
    description: 'Explore individual houses, private residential villas, and planned family homes situated across Thanjavur’s tranquil neighborhoods.',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    features: ['Independent Homes', 'Modern Villas', 'Peaceful Neighborhoods']
  },
  {
    id: 'land-plots',
    title: 'Land & Plots',
    subtitle: 'Residential Plots & Vacant Land',
    description: 'Carefully demarcated layout plots, residential house sites, and investment land parcels situated along key growth highways in Thanjavur.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    features: ['Surveyed Layout Plots', 'House Construction Sites', 'Highway Growth Zones']
  },
  {
    id: 'commercial',
    title: 'Commercial Properties',
    subtitle: 'Shops & Business Sites',
    description: 'Commercial buildings, retail shop frontage sites, and high-visibility road-facing investment land across transit and business corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    features: ['Highway Frontage', 'Retail & Office Spaces', 'Commercial Investment']
  }
];
