// Supabase Edge Functions Shared CORS Utility for AMMAN REAL ESTATE
// Enforces strict origin whitelisting for administrative endpoints.
// Public image viewing maintains separate, open CORS for anonymous <img> embedding.

const ALLOWED_ADMIN_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  // Confirmed production domain(s) can be added here when deployment domain is confirmed
];

/**
 * Returns CORS headers for administrative endpoints.
 * Explicitly rejects unapproved origins by omitting Access-Control-Allow-Origin.
 */
export function getAdminCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');

  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
    'Access-Control-Max-Age': '3600',
  };

  if (origin && ALLOWED_ADMIN_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

/**
 * Intercepts OPTIONS preflight requests for admin endpoints.
 * Explicitly rejects unapproved origins with HTTP 403 Forbidden.
 */
export function handleAdminCorsPreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');

    // If an Origin header is sent and it's not in the whitelist, explicitly reject
    if (origin && !ALLOWED_ADMIN_ORIGINS.includes(origin)) {
      return new Response(
        JSON.stringify({ error: 'CORS policy violation: Origin not allowed.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(null, {
      status: 204,
      headers: getAdminCorsHeaders(req),
    });
  }

  return null;
}

/**
 * Separate CORS headers for public image viewing (b2-image-view).
 * Required for anonymous embedding of property images across web clients.
 */
export const publicImageCorsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
