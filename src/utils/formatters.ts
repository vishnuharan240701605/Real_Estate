import type { SizeMeasurement } from '../types';

/**
 * Currency & Measurement utility formatters
 * IMPORTANT: All pricing formatters format complete Total Price in Indian Rupees.
 * Price per sq.ft is never calculated or displayed.
 */

export function formatPriceINR(amount?: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 'Price on Consultation';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatTotalPriceINR(price?: number): string | null {
  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    return null;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

export function formatSizeMeasurement(size?: SizeMeasurement | string): string | null {
  if (!size) return null;
  if (typeof size === 'string') {
    return size.trim() || null;
  }
  if (typeof size.value === 'undefined' || size.value === null || size.value === '') {
    return null;
  }
  const formattedVal = typeof size.value === 'number'
    ? size.value.toLocaleString('en-IN')
    : size.value;
  return `${formattedVal} ${size.unit}`;
}

export function formatBorewell(val?: boolean | 'Yes' | 'No' | null): 'Yes' | 'No' | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return val;
}

export function formatArea(sqft?: number): string {
  if (!sqft) return 'Area on Request';
  return `${sqft.toLocaleString('en-IN')} Sq.Ft`;
}
