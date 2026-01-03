import http from 'http';
import { handleStatus } from './status';
import { handlePlan } from './plan';
import { verifyToken, generateToken } from './auth';
const PORT = 9337;
const HOST = '127.0.0.1'; // Loopback only
export function startBrainServer() {
    const sessionToken = generateToken();
    const server = http.createServer(async (req, res) => {
        // CORS headers for local development
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            return res.end();
        }
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        if (!token || !verifyToken(token, sessionToken)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        try {
            if (req.method === 'GET' && req.url === '/status') {
                return handleStatus(res);
            }
            if (req.method === 'POST' && req.url === '/plan') {
                let body = '';
                req.on('data', (chunk) => (body += chunk));
                req.on('end', () => {
                    try {
                        const requestData = JSON.parse(body);
                        return handlePlan(res, requestData);
                    }
                    catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
                    }
                });
                return;
            }
            // Unknown endpoint
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
        catch (error) {
            console.error('[RinaWarp Brain] Error handling request:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    });
    server.listen(PORT, HOST, () => {
        console.log(`[RinaWarp Brain] Listening on ${HOST}:${PORT}`);
        console.log(`[RinaWarp Brain] Session token: ${sessionToken}`);
    });
    server.on('error', (error) => {
        console.error('[RinaWarp Brain] Server error:', error);
    });
    return {
        token: sessionToken,
        stop: () => server.close(),
    };
}
