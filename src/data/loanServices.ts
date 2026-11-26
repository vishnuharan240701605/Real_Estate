import type { LoanCategory } from '../types';

/**
 * Centralized Loan Services content.
 * COMPLIANCE NOTE:
 * - Amman Real Estate assists customers in arranging loans through banks and financial institutions.
 * - Amman Real Estate is not a bank or direct lender.
 * - Final approval, eligibility, interest rates and terms are determined solely by the respective lending institution.
 */
export const LOAN_CATEGORIES: LoanCategory[] = [
  {
    id: 'home-loan',
    title: 'Home Loan',
    subtitle: 'Residential Purchase & Construction',
    description: 'Assistance in arranging bank loans for customers looking to purchase or construct residential properties.',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
    features: [
      'House construction financing assistance',
      'Independent villa and home acquisition',
      'Guidance through bank application documentation'
    ]
  },
  {
    id: 'mortgage-loan',
    title: 'Mortgage Loan',
    subtitle: 'Loan Against Eligible Property',
    description: 'Assistance in exploring loan options against eligible existing properties through banks and financial institutions.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Facilitation against existing clear-title property',
      'Assistance for capital and personal commitments',
      'Preliminary document organization support'
    ]
  },
  {
    id: 'commercial-loan',
    title: 'Commercial Loan',
    subtitle: 'Commercial Property & Business Financing',
    description: 'Assistance in arranging bank financing for eligible commercial property and business-related requirements.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Commercial building & retail site financing',
      'Business space acquisition facilitation',
      'Coordinating with institutional lending officers'
    ]
  }
];

export const LOAN_DISCLAIMER_TEXT = 
  "AMMAN REAL ESTATE provides loan assistance by connecting customers with banks and financial institutions. Loan approval, eligibility, interest rates, terms and conditions are determined solely by the respective lending institution.";
