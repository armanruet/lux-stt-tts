/**
 * Cloudflare Worker - CORS Proxy for Sproochmaschinn API
 * 
 * Deploy this to Cloudflare Workers to bypass CORS restrictions.
 * The worker forwards requests to sproochmaschinn.lu and adds CORS headers.
 * 
 * Setup Instructions:
 * 1. Go to https://workers.cloudflare.com/
 * 2. Create a free account (if you don't have one)
 * 3. Create a new Worker
 * 4. Paste this code
 * 5. Deploy and copy your worker URL (e.g., https://lux-proxy.your-subdomain.workers.dev)
 * 6. Update PROXY_URL in api-service.js with your worker URL
 */

const ALLOWED_ORIGINS = [
    'https://armanruet.github.io',
    'http://localhost:3456',
    'http://127.0.0.1:3456'
];

const SPROOCHMASCHINN_API = 'https://sproochmaschinn.lu';

export default {
    async fetch(request, env, ctx) {
        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return handleCORS(request, new Response(null, { status: 204 }));
        }

        const url = new URL(request.url);

        // Only proxy /api/* paths
        if (!url.pathname.startsWith('/api/')) {
            return new Response('Not Found', { status: 404 });
        }

        // Build the target URL
        const targetUrl = SPROOCHMASCHINN_API + url.pathname + url.search;

        try {
            // Clone the request with the new URL
            const modifiedRequest = new Request(targetUrl, {
                method: request.method,
                headers: request.headers,
                body: request.method !== 'GET' && request.method !== 'HEAD'
                    ? request.body
                    : undefined,
                redirect: 'follow'
            });

            // Remove headers that might cause issues
            modifiedRequest.headers.delete('host');

            // Fetch from the target API
            const response = await fetch(modifiedRequest);

            // Clone response and add CORS headers
            const modifiedResponse = new Response(response.body, response);
            return handleCORS(request, modifiedResponse);
        } catch (error) {
            return handleCORS(request, new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }));
        }
    }
};

function handleCORS(request, response) {
    const origin = request.headers.get('Origin');

    // Check if origin is allowed (or allow all for development)
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', allowedOrigin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Max-Age', '86400');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
