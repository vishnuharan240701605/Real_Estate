import type { AreaOfInterest } from '../types';

/**
 * Prominent geographic areas and corridors across Thanjavur.
 * COMPLIANCE NOTE: These locations are presented strictly as geographic areas of interest
 * for prospective property buyers exploring the region, NOT as confirmed office locations
 * or exclusive business branch locations.
 */
export const THANJAVUR_AREAS_OF_INTEREST: AreaOfInterest[] = [
  {
    id: 'vallam-corridor',
    name: 'Vallam Growth Corridor',
    corridor: 'Thanjavur - Trichy National Highway',
    description: 'A rapidly evolving development belt connecting Thanjavur to Tiruchirappalli. Known for reputed higher educational institutions and emerging residential layouts.',
    highlights: ['Higher education institutions hub', 'Direct NH access toward Trichy', 'Active residential layout developments']
  },
  {
    id: 'medical-college-road',
    name: 'Medical College Road Sector',
    corridor: 'Urban Core Residential Hub',
    description: 'One of the most established and sought-after residential sectors in Thanjavur, featuring peaceful residential streets and direct proximity to major healthcare amenities.',
    highlights: ['Established residential neighborhood', 'Close proximity to healthcare facilities', 'Reliable municipal infrastructure']
  },
  {
    id: 'new-bus-stand-bypass',
    name: 'New Bus Stand & Bypass Corridor',
    corridor: 'Commercial Transit & Ring Road Belt',
    description: 'A major transportation and transit node offering prime road frontage for commercial development, logistics sites, and contemporary retail investments.',
    highlights: ['High-visibility commercial road frontage', 'Key inter-district transit intersection', 'Strategic bypass access']
  },
  {
    id: 'kumbakonam-road',
    name: 'Kumbakonam Highway Corridor',
    corridor: 'Delta Cultural & Connectivity Route',
    description: 'An arterial route connecting Thanjavur to the heritage towns of the Cauvery delta, presenting a mix of suburban plotting opportunities and agricultural land.',
    highlights: ['Scenic delta connectivity belt', 'Suburban plotting opportunities', 'Active road infrastructure improvements']
  },
  {
    id: 'pudukkottai-highway',
    name: 'Pudukkottai Highway Zone',
    corridor: 'Southern Residential Corridor',
    description: 'The southern expansion sector of Thanjavur experiencing gradual residential expansion, affordable house sites, and balanced suburban connectivity.',
    highlights: ['Developing residential expansion zone', 'Affordable plot dimension options', 'Accessible outward road grid']
  },
  {
    id: 'cauvery-delta-belt',
    name: 'Cauvery Delta Farmland Belt',
    corridor: 'Rural & Agricultural Environs',
    description: 'The fertile agricultural surrounding belt of Thanjavur, sought after by investors and families interested in organic farming, agro-holdings, or peaceful rural land.',
    highlights: ['Fertile alluvium soil profile', 'Delta water table advantages', 'Tranquil countryside environment']
  }
];
