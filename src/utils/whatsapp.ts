import { SITE_CONFIG } from '../data/siteConfig';

export interface WhatsAppInquiryParams {
  propertyId?: string;
  propertyTitle?: string;
  category?: string;
  totalPrice?: string;
  customMessage?: string;
  senderName?: string;
  senderPhone?: string;
}

export interface LoanInquiryWhatsAppParams {
  fullName: string;
  phone: string;
  loanType: string;
  approximateAmount?: string;
  message?: string;
}

/**
 * Builds a direct WhatsApp link to +919894215932 with an appropriately formatted, URL-encoded greeting.
 * Contact forms generate a WhatsApp direct message and do not store enquiries on any remote server.
 */
export function buildWhatsAppLink(params?: WhatsAppInquiryParams): string {
  const base = SITE_CONFIG.contact.whatsappUrl;
  
  if (!params) {
    const defaultText = `Hello Amman Real Estate, I would like to inquire about properties and plots in Thanjavur.`;
    return `${base}?text=${encodeURIComponent(defaultText)}`;
  }

  const lines: string[] = [];
  lines.push(`*Inquiry for Amman Real Estate (Thanjavur)*`);
  lines.push(`----------------------------------------`);

  if (params.senderName && params.senderName.trim()) {
    lines.push(`*Name:* ${params.senderName.trim()}`);
  }
  if (params.senderPhone && params.senderPhone.trim()) {
    lines.push(`*Phone:* ${params.senderPhone.trim()}`);
  }
  if (params.propertyTitle && params.propertyTitle.trim()) {
    lines.push(`*Property:* ${params.propertyTitle.trim()}${params.propertyId ? ` (Ref: ${params.propertyId})` : ''}`);
  }
  if (params.category && params.category.trim()) {
    lines.push(`*Category:* ${params.category.trim()}`);
  }
  if (params.totalPrice && params.totalPrice.trim()) {
    lines.push(`*Total Price:* ${params.totalPrice.trim()}`);
  }
  if (params.customMessage && params.customMessage.trim()) {
    lines.push(`*Message:* ${params.customMessage.trim()}`);
  } else {
    lines.push(`*Inquiry:* Please share details regarding available properties and consultation scheduling.`);
  }

  const fullText = lines.join('\n');
  return `${base}?text=${encodeURIComponent(fullText)}`;
}

/**
 * Builds a direct WhatsApp link specifically for Loan Services inquiries.
 */
export function buildLoanInquiryWhatsAppLink(params: LoanInquiryWhatsAppParams): string {
  const base = SITE_CONFIG.contact.whatsappUrl;
  const lines: string[] = [];
  lines.push(`*Loan Assistance Inquiry – Amman Real Estate (Thanjavur)*`);
  lines.push(`----------------------------------------`);
  lines.push(`*Name:* ${params.fullName.trim()}`);
  lines.push(`*Phone:* ${params.phone.trim()}`);
  lines.push(`*Loan Type:* ${params.loanType.trim()}`);
  if (params.approximateAmount && params.approximateAmount.trim()) {
    lines.push(`*Approximate Loan Amount:* ${params.approximateAmount.trim()}`);
  }
  if (params.message && params.message.trim()) {
    lines.push(`*Message:* ${params.message.trim()}`);
  } else {
    lines.push(`*Inquiry:* Please share information regarding bank loan assistance and required documentation.`);
  }

  const fullText = lines.join('\n');
  return `${base}?text=${encodeURIComponent(fullText)}`;
}

/**
 * Builds a quick WhatsApp inquiry link for a specific loan category.
 */
export function buildQuickLoanWhatsAppLink(loanType: string): string {
  const base = SITE_CONFIG.contact.whatsappUrl;
  const text = `Hello Amman Real Estate, I would like assistance in exploring ${loanType} options through banks and financial institutions for my property requirement in Thanjavur.`;
  return `${base}?text=${encodeURIComponent(text)}`;
}
