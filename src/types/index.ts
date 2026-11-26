export type PropertyCategory = 'residential-houses' | 'land-plots' | 'commercial';

export type PropertyType =
  | 'HOUSE'
  | 'APARTMENT'
  | 'RESIDENTIAL_PLOT'
  | 'AGRICULTURAL_LAND'
  | 'COMMERCIAL_PROPERTY';

export type SizeUnit = 'sq.ft' | 'cents' | 'acres';

export interface SizeMeasurement {
  value: number | string;
  unit: SizeUnit;
}

export interface PropertySpecifications {
  plotSize?: SizeMeasurement | string;
  buildingSize?: SizeMeasurement | string;
  borewell?: boolean | 'Yes' | 'No' | null;
  numberOfRooms?: number | string;
  roomConfiguration?: string | null;
  numberOfToilets?: number | string;
  totalPrice?: number; // Total property price in INR
}

export interface PropertyCategoryMeta {
  id: PropertyCategory;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  features: string[];
}

export interface PropertyImageItem {
  id: string;
  image_url: string;
  storage_key: string;
  is_cover: boolean;
  display_order: number;
  created_at?: string;
}

export interface Property {
  id: string;
  slug?: string;
  title: string;
  category: PropertyCategory;
  categoryDisplay: string;
  propertyType?: PropertyType | null;
  propertyTypeDisplay?: string;
  location: string;
  areaSector: string;
  priceEstimateDisplay: string;
  sizeDisplay: string;
  dimensions?: string;
  facing?: string;
  roadWidth?: string;
  isDemoPlaceholder: boolean;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  imageUrl: string;
  images?: PropertyImageItem[];
  specifications?: PropertySpecifications;
}

export type LoanType = 'Home Loan' | 'Mortgage Loan' | 'Commercial Loan';

export interface LoanCategory {
  id: string;
  title: LoanType;
  subtitle: string;
  description: string;
  imageUrl: string;
  features: string[];
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  location: {
    city: string;
    state: string;
    country: string;
    addressNotice: string;
    prominentRegions: string[];
  };
  contact: {
    phoneDisplay: string;
    phoneRaw: string;
    whatsappUrl: string;
    emailPlaceholder: string;
  };
  hoursPlaceholder: string;
  disclaimer: {
    previewNotice: string;
    legalNote: string;
  };
}

export interface NavItem {
  name: string;
  path: string;
}

export interface AreaOfInterest {
  id: string;
  name: string;
  corridor: string;
  description: string;
  highlights: string[];
}
