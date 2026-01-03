/**
 * Safe API Utility for RinaWarp Terminal Pro
 * Handles API failures gracefully without spamming console errors
 */

export async function safeApiCall(apiFunction, fallbackValue = null) {
    try {
        const result = await apiFunction();
        return result;
    } catch (error) {
        console.debug("API unavailable (expected in dev):", error?.message || error);
        return fallbackValue;
    }
}

export async function safeFetch(url, options = {}) {
    return safeApiCall(async () => {
        const response = await fetch(url, {
            ...options,
            headers: {
                'User-Agent': 'RinaWarp-Terminal-Pro/1.0.0',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
    }, null);
}

export async function safeJsonRequest(url, options = {}) {
    const response = await safeFetch(url, options);
    if (!response) return null;
    
    try {
        return await response.json();
    } catch (error) {
        console.debug("Failed to parse JSON response:", error);
        return null;
    }
}
