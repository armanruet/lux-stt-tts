/**
 * Vercel Serverless Function - CORS Proxy for Sproochmaschinn API
 * 
 * This function proxies all /api/* requests to sproochmaschinn.lu
 * and adds CORS headers to allow browser access.
 */

const API_BASE = 'https://sproochmaschinn.lu';

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Session-ID');
        return res.status(200).end();
    }

    // Get the API path from the URL
    const apiPath = req.url.replace(/^\/?/, '/');
    const targetUrl = `${API_BASE}${apiPath}`;

    console.log(`[PROXY] ${req.method} ${apiPath} -> ${targetUrl}`);

    try {
        // Prepare fetch options
        const fetchOptions = {
            method: req.method,
            headers: {}
        };

        // Forward content-type and body for POST/PUT
        if (req.method === 'POST' || req.method === 'PUT') {
            const contentType = req.headers['content-type'] || '';

            if (contentType.includes('multipart/form-data')) {
                // For multipart (STT), we need to reconstruct the form data
                const chunks = [];
                for await (const chunk of req) {
                    chunks.push(chunk);
                }
                fetchOptions.body = Buffer.concat(chunks);
                fetchOptions.headers['Content-Type'] = contentType;
            } else if (contentType.includes('application/json')) {
                // For JSON (TTS), stringify the body
                fetchOptions.body = JSON.stringify(req.body);
                fetchOptions.headers['Content-Type'] = 'application/json';
            } else if (req.body) {
                // For other content types
                fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
                if (contentType) {
                    fetchOptions.headers['Content-Type'] = contentType;
                }
            }
        }

        // Make the request to Sproochmaschinn
        const response = await fetch(targetUrl, fetchOptions);
        console.log(`[PROXY] Response: ${response.status}`);

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Session-ID');

        // Forward response content-type
        const respContentType = response.headers.get('content-type');
        if (respContentType) {
            res.setHeader('Content-Type', respContentType);
        }

        // Forward response body
        const buffer = await response.arrayBuffer();
        res.status(response.status).send(Buffer.from(buffer));

    } catch (error) {
        console.error('[PROXY ERROR]', error.message);
        res.status(500).json({ error: error.message });
    }
}

// Vercel config: disable body parsing to handle raw multipart data
export const config = {
    api: {
        bodyParser: false,
    },
};
