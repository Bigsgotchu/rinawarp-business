#!/usr/bin/env node
/**
 * Simple test to demonstrate Admin API URL resolution fix
 */

const https = require("https");

// Test the same candidates as the updated script
const ADMIN_API_CANDIDATES = [
    "https://api.rinawarptech.com/api/pricing",
    "https://api.rinawarptech.com/pricing",
    "https://rinawarp-admin-api.rinawarptech.workers.dev/api/pricing",
];

function httpsGetFollow(url, { timeoutMs = 15000, maxRedirects = 5 } = {}) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            const status = res.statusCode || 0;
            if (status >= 300 && status < 400 && res.headers.location) {
                if (maxRedirects <= 0) {
                    reject(new Error(`Too many redirects fetching ${url}`));
                    return;
                }
                const nextUrl = new URL(res.headers.location, url).toString();
                res.resume();
                resolve(httpsGetFollow(nextUrl, { timeoutMs, maxRedirects: maxRedirects - 1 }));
                return;
            }
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve({ status, headers: res.headers, body: data }));
        });
        req.on("error", (err) => reject(new Error(`Request to ${url} failed: ${err.message}`)));
        req.setTimeout(timeoutMs, () => {
            req.destroy();
            reject(new Error(`Request to ${url} timed out after ${timeoutMs}ms`));
        });
    });
}

async function fetchJson(url) {
    const res = await httpsGetFollow(url);
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Non-2xx from ${url}: ${res.status}`);
    }
    try {
        return JSON.parse(res.body);
    } catch (e) {
        throw new Error(`Failed to parse JSON from ${url}: ${e.message}`);
    }
}

async function testAdminAPI() {
    console.log("🔍 Testing Admin API URL resolution...\n");

    let lastErr = null;
    for (const url of ADMIN_API_CANDIDATES) {
        try {
            console.log(`✅ Trying: ${url}`);
            const json = await fetchJson(url);
            if (json && json.ok === true) {
                console.log(`🎉 SUCCESS: Found working Admin API at ${url}`);
                console.log(`📊 Response: ${json.plans?.length || 0} monthly plans, ${json.lifetime?.length || 0} lifetime plans`);
                return true;
            }
            lastErr = new Error(`Admin API responded but ok!=true at ${url}`);
            console.log(`⚠️  Response ok!=true: ${json.ok}`);
        } catch (e) {
            lastErr = e;
            console.log(`❌ Failed: ${e.message}`);
        }
        console.log("");
    }

    console.log("❌ Could not fetch pricing from any Admin API candidate.");
    console.log(`Last error: ${lastErr?.message || "unknown"}`);
    return false;
}

if (require.main === module) {
    testAdminAPI().then((success) => {
        process.exit(success ? 0 : 1);
    });
}