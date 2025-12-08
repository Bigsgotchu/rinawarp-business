/**
 * RinaWarp Terminal Pro - Multi-Model AI Router
 * Advanced AI routing system with multiple providers and models
 */

class MultiModelAIRouter {
    constructor() {
        this.isInitialized = false;
        this.providers = new Map();
        this.currentProvider = 'openai';
        this.defaultModel = 'gpt-4';
        this.routingStrategy = 'auto'; // auto, cost, quality, speed, fallback
        this.requestCache = new Map();
        this.maxCacheSize = 200;
        
        // Advanced features
        this.streamingEnabled = true;
        this.healthMonitor = new Map();
        this.providerMetrics = new Map();
        this.loadBalancer = new Map();
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            backoffFactor: 2
        };
        
        // Health check intervals
        this.healthCheckInterval = 30000; // 30 seconds
        this.metricsInterval = 60000; // 1 minute
        this.healthCheckTimer = null;
        this.metricsTimer = null;
        
        // Provider configurations
        this.providerConfigs = {
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                models: {
                    'gpt-4': { maxTokens: 8192, costPer1k: 0.03, quality: 'high', speed: 'medium' },
                    'gpt-4-turbo': { maxTokens: 4096, costPer1k: 0.01, quality: 'high', speed: 'fast' },
                    'gpt-3.5-turbo': { maxTokens: 4096, costPer1k: 0.002, quality: 'medium', speed: 'fast' },
                    'gpt-4o': { maxTokens: 8192, costPer1k: 0.005, quality: 'high', speed: 'fast' }
                }
            },
            anthropic: {
                name: 'Anthropic',
                baseUrl: 'https://api.anthropic.com/v1',
                models: {
                    'claude-3-opus': { maxTokens: 8192, costPer1k: 0.015, quality: 'high', speed: 'medium' },
                    'claude-3-sonnet': { maxTokens: 8192, costPer1k: 0.003, quality: 'high', speed: 'fast' },
                    'claude-3-haiku': { maxTokens: 8192, costPer1k: 0.00025, quality: 'medium', speed: 'fast' }
                }
            },
            local: {
                name: 'Local/Ollama',
                baseUrl: 'http://localhost:11434',
                models: {
                    'llama2': { maxTokens: 4096, costPer1k: 0, quality: 'medium', speed: 'fast' },
                    'codellama': { maxTokens: 4096, costPer1k: 0, quality: 'high', speed: 'medium' },
                    'mistral': { maxTokens: 4096, costPer1k: 0, quality: 'medium', speed: 'fast' }
                }
            },
            huggingface: {
                name: 'Hugging Face',
                baseUrl: 'https://api-inference.huggingface.co',
                models: {
                    'mistral-7b': { maxTokens: 2048, costPer1k: 0.0004, quality: 'medium', speed: 'fast' },
                    'codellama-7b': { maxTokens: 2048, costPer1k: 0.0004, quality: 'high', speed: 'fast' }
                }
            }
        };
        
        this.routingRules = {
            coding: { provider: 'anthropic', model: 'claude-3-sonnet' },
            analysis: { provider: 'openai', model: 'gpt-4o' },
            quick: { provider: 'openai', model: 'gpt-3.5-turbo' },
            creative: { provider: 'anthropic', model: 'claude-3-opus' },
            fallback: { provider: 'local', model: 'llama2' }
        };
    }

    async initialize() {
        try {
            // Initialize all providers with enhanced error handling
            await this.initializeProviders();
            
            // Load settings
            await this.loadSettings();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize health monitoring
            await this.initializeHealthMonitoring();
            
            // Initialize metrics tracking
            this.initializeMetrics();
            
            // Start background monitoring
            this.startBackgroundMonitoring();
            
            this.isInitialized = true;
            console.log('Enhanced Multi-Model AI Router initialized with health monitoring and streaming');
            
        } catch (error) {
            console.error('Failed to initialize AI Router:', error);
            throw error;
        }
    }

    async initializeProviders() {
        // Initialize OpenAI
        const openaiProvider = new OpenAIProvider();
        await openaiProvider.initialize();
        this.providers.set('openai', openaiProvider);
        
        // Initialize Anthropic
        const anthropicProvider = new AnthropicProvider();
        await anthropicProvider.initialize();
        this.providers.set('anthropic', anthropicProvider);
        
        // Initialize Local/Ollama
        const localProvider = new LocalProvider();
        await localProvider.initialize();
        this.providers.set('local', localProvider);
        
        // Initialize Hugging Face
        const hfProvider = new HuggingFaceProvider();
        await hfProvider.initialize();
        this.providers.set('huggingface', hfProvider);
        
        // Test provider connections and setup health monitoring
        await this.testProviderConnections();
        
        // Initialize load balancer for each provider
        for (const [name, provider] of this.providers) {
            this.loadBalancer.set(name, {
                activeConnections: 0,
                maxConnections: 10,
                requestCount: 0,
                errorCount: 0,
                avgResponseTime: 0
            });
        }
    }

    async testProviderConnections() {
        const results = {};
        
        for (const [name, provider] of this.providers) {
            try {
                const isAvailable = await provider.testConnection();
                results[name] = isAvailable;
                console.log(`Provider ${name}: ${isAvailable ? 'Available' : 'Unavailable'}`);
            } catch (error) {
                results[name] = false;
                console.log(`Provider ${name}: Error - ${error.message}`);
            }
        }
        
        return results;
    }

    async loadSettings() {
        if (window.electronAPI) {
            this.currentProvider = await window.electronAPI.getSetting('ai_provider') || 'openai';
            this.routingStrategy = await window.electronAPI.getSetting('ai_routing_strategy') || 'auto';
        }
    }

    setupEventListeners() {
        // Listen for AI requests from UI
        document.addEventListener('ai-request', (event) => {
            this.handleAIRequest(event.detail);
        });
    }

    async routeRequest(request, context = {}) {
        if (!this.isInitialized) {
            throw new Error('AI Router not initialized');
        }

        // Check cache first for non-streaming requests
        if (!context.stream) {
            const cacheKey = this.generateCacheKey(request, context);
            if (this.requestCache.has(cacheKey)) {
                return this.requestCache.get(cacheKey);
            }
        }

        // Use enhanced routing with retry logic
        try {
            return await this.routeRequestWithRetry(request, context);
        } catch (error) {
            console.error('All routing attempts failed:', error);
            throw error;
        }
    }

    determineRouting(request, context) {
        const { type, priority, budget, domain } = context;
        
        switch (this.routingStrategy) {
            case 'auto':
                return this.autoRoute(request, context);
            case 'cost':
                return this.costOptimizedRoute(request, context);
            case 'quality':
                return this.qualityOptimizedRoute(request, context);
            case 'speed':
                return this.speedOptimizedRoute(request, context);
            default:
                return this.autoRoute(request, context);
        }
    }

    autoRoute(request, context) {
        const { type, domain, priority } = context;
        
        // Domain-specific routing
        if (domain === 'coding') return this.routingRules.coding;
        if (domain === 'analysis') return this.routingRules.analysis;
        if (domain === 'creative') return this.routingRules.creative;
        
        // Type-specific routing
        if (type === 'explain_code') return { provider: 'anthropic', model: 'claude-3-sonnet' };
        if (type === 'generate_code') return { provider: 'anthropic', model: 'claude-3-opus' };
        if (type === 'quick_help') return this.routingRules.quick;
        
        // Priority-based routing
        if (priority === 'high') return { provider: 'openai', model: 'gpt-4o' };
        if (priority === 'low') return { provider: 'openai', model: 'gpt-3.5-turbo' };
        
        // Default routing
        return { provider: 'openai', model: 'gpt-3.5-turbo', reason: 'default' };
    }

    costOptimizedRoute(request, context) {
        // Find most cost-effective option
        const availableProviders = Array.from(this.providers.entries())
            .filter(([name, provider]) => provider.isAvailable);
        
        let bestOption = null;
        let lowestCost = Infinity;
        
        for (const [name, provider] of availableProviders) {
            for (const [model, config] of Object.entries(this.providerConfigs[name].models)) {
                if (config.costPer1k < lowestCost) {
                    lowestCost = config.costPer1k;
                    bestOption = { provider: name, model };
                }
            }
        }
        
        return bestOption || { provider: 'local', model: 'llama2', reason: 'fallback' };
    }

    qualityOptimizedRoute(request, context) {
        // Find highest quality option
        const availableProviders = Array.from(this.providers.entries())
            .filter(([name, provider]) => provider.isAvailable);
        
        let bestOption = null;
        let highestQuality = 0;
        
        for (const [name, provider] of availableProviders) {
            for (const [model, config] of Object.entries(this.providerConfigs[name].models)) {
                const qualityScore = this.getQualityScore(config);
                if (qualityScore > highestQuality) {
                    highestQuality = qualityScore;
                    bestOption = { provider: name, model };
                }
            }
        }
        
        return bestOption || { provider: 'anthropic', model: 'claude-3-opus', reason: 'fallback' };
    }

    speedOptimizedRoute(request, context) {
        // Find fastest option
        const availableProviders = Array.from(this.providers.entries())
            .filter(([name, provider]) => provider.isAvailable);
        
        let bestOption = null;
        let fastestSpeed = 0;
        
        for (const [name, provider] of availableProviders) {
            for (const [model, config] of Object.entries(this.providerConfigs[name].models)) {
                const speedScore = this.getSpeedScore(config);
                if (speedScore > fastestSpeed) {
                    fastestSpeed = speedScore;
                    bestOption = { provider: name, model };
                }
            }
        }
        
        return bestOption || { provider: 'openai', model: 'gpt-3.5-turbo', reason: 'fallback' };
    }

    getQualityScore(config) {
        const scores = { low: 1, medium: 2, high: 3 };
        return scores[config.quality] || 2;
    }

    getSpeedScore(config) {
        const scores = { slow: 1, medium: 2, fast: 3 };
        return scores[config.speed] || 2;
    }

    // Enhanced health monitoring and metrics
    async initializeHealthMonitoring() {
        for (const [name, provider] of this.providers) {
            this.healthMonitor.set(name, {
                isHealthy: false,
                lastCheck: 0,
                consecutiveFailures: 0,
                responseTime: 0,
                errorRate: 0
            });
            
            this.providerMetrics.set(name, {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                totalTokens: 0,
                totalCost: 0,
                avgResponseTime: 0
            });
        }
    }

    initializeMetrics() {
        // Initialize metrics tracking
        setInterval(() => {
            this.updateMetrics();
        }, this.metricsInterval);
    }

    startBackgroundMonitoring() {
        // Start health check timer
        this.healthCheckTimer = setInterval(() => {
            this.performHealthChecks();
        }, this.healthCheckInterval);
    }

    async performHealthChecks() {
        for (const [name, provider] of this.providers) {
            try {
                const startTime = Date.now();
                const isHealthy = await provider.testConnection();
                const responseTime = Date.now() - startTime;
                
                const health = this.healthMonitor.get(name);
                health.isHealthy = isHealthy;
                health.lastCheck = Date.now();
                health.responseTime = responseTime;
                
                if (!isHealthy) {
                    health.consecutiveFailures++;
                } else {
                    health.consecutiveFailures = 0;
                }
                
                // Update provider availability
                provider.isAvailable = isHealthy && health.consecutiveFailures < 3;
                
            } catch (error) {
                const health = this.healthMonitor.get(name);
                health.consecutiveFailures++;
                health.isHealthy = false;
                provider.isAvailable = health.consecutiveFailures < 3;
            }
        }
    }

    updateMetrics() {
        for (const [name, provider] of this.providers) {
            const metrics = this.providerMetrics.get(name);
            if (metrics.totalRequests > 0) {
                metrics.errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;
            }
        }
    }

    // Enhanced routing with health-aware selection
    async healthAwareRoute(request, context) {
        const routing = this.determineRouting(request, context);
        
        // Check if primary provider is healthy
        const primaryHealth = this.healthMonitor.get(routing.provider);
        if (!primaryHealth || !primaryHealth.isHealthy) {
            console.warn(`Primary provider ${routing.provider} is unhealthy, finding alternative`);
            return this.findHealthyAlternative(routing, context);
        }
        
        return routing;
    }

    findHealthyAlternative(originalRouting, context) {
        const availableProviders = Array.from(this.providers.entries())
            .filter(([name, provider]) => provider.isAvailable);
        
        // Try to find provider with same specialty
        const specialty = this.getProviderSpecialty(originalRouting.provider);
        const specialtyProviders = availableProviders.filter(([name]) => 
            this.getProviderSpecialty(name) === specialty
        );
        
        if (specialtyProviders.length > 0) {
            const [name] = specialtyProviders[0];
            return { 
                provider: name, 
                model: this.getDefaultModelForProvider(name),
                reason: 'health-fallback'
            };
        }
        
        // Fallback to any available provider
        if (availableProviders.length > 0) {
            const [name] = availableProviders[0];
            return { 
                provider: name, 
                model: this.getDefaultModelForProvider(name),
                reason: 'emergency-fallback'
            };
        }
        
        throw new Error('No healthy providers available');
    }

    getProviderSpecialty(providerName) {
        const specialties = {
            'openai': 'general',
            'anthropic': 'coding',
            'local': 'fallback',
            'huggingface': 'experimental'
        };
        return specialties[providerName] || 'general';
    }

    getDefaultModelForProvider(providerName) {
        const defaults = {
            'openai': 'gpt-3.5-turbo',
            'anthropic': 'claude-3-haiku',
            'local': 'llama2',
            'huggingface': 'mistral-7b'
        };
        return defaults[providerName] || 'gpt-3.5-turbo';
    }

    // Streaming support
    async streamRequest(request, context, onChunk, onComplete, onError) {
        if (!this.streamingEnabled) {
            throw new Error('Streaming not enabled');
        }

        try {
            const routing = await this.healthAwareRoute(request, context);
            const provider = this.providers.get(routing.provider);
            
            if (!provider || !provider.supportsStreaming) {
                throw new Error(`Provider ${routing.provider} does not support streaming`);
            }

            // Increment load balancer
            const lb = this.loadBalancer.get(routing.provider);
            if (lb.activeConnections >= lb.maxConnections) {
                throw new Error(`Provider ${routing.provider} at capacity`);
            }
            lb.activeConnections++;

            const startTime = Date.now();
            
            // Stream the response
            await provider.streamChat(
                routing.model, 
                request, 
                context,
                (chunk) => {
                    if (onChunk) onChunk(chunk);
                },
                (complete) => {
                    // Update metrics
                    this.updateRequestMetrics(routing.provider, Date.now() - startTime, true);
                    lb.activeConnections--;
                    
                    if (onComplete) onComplete(complete);
                },
                (error) => {
                    // Update error metrics
                    this.updateRequestMetrics(routing.provider, Date.now() - startTime, false);
                    lb.activeConnections--;
                    
                    if (onError) onError(error);
                }
            );

        } catch (error) {
            console.error('Streaming request failed:', error);
            if (onError) onError(error);
        }
    }

    updateRequestMetrics(providerName, responseTime, success) {
        const metrics = this.providerMetrics.get(providerName);
        if (metrics) {
            metrics.totalRequests++;
            if (success) {
                metrics.successfulRequests++;
            } else {
                metrics.failedRequests++;
            }
            
            // Update average response time
            metrics.avgResponseTime = ((metrics.avgResponseTime * (metrics.totalRequests - 1)) + responseTime) / metrics.totalRequests;
        }
    }

    // Enhanced retry logic with exponential backoff
    async routeRequestWithRetry(request, context, maxRetries = null) {
        const retries = maxRetries || this.retryConfig.maxRetries;
        let lastError;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                // Health-aware routing
                const routing = await this.healthAwareRoute(request, context);
                const provider = this.providers.get(routing.provider);
                
                if (!provider || !provider.isAvailable) {
                    throw new Error(`Provider ${routing.provider} not available`);
                }

                // Check load balancer
                const lb = this.loadBalancer.get(routing.provider);
                if (lb.activeConnections >= lb.maxConnections) {
                    throw new Error(`Provider ${routing.provider} at capacity`);
                }

                const startTime = Date.now();
                
                // Make request with timeout
                const response = await Promise.race([
                    provider.chat(routing.model, request, context),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Request timeout')), 30000)
                    )
                ]);
                
                // Update metrics
                this.updateRequestMetrics(routing.provider, Date.now() - startTime, true);
                
                // Cache response
                const cacheKey = this.generateCacheKey(request, context);
                this.cacheResponse(cacheKey, response);
                
                return {
                    ...response,
                    provider: routing.provider,
                    model: routing.model,
                    routing: routing.reason,
                    attempt: attempt + 1
                };
                
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt < retries) {
                    // Exponential backoff
                    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // All retries failed, try fallback
        console.warn('All retries failed, attempting fallback routing');
        return this.handleFallbackRouting(request, context, lastError);
    }

    // Public API for metrics and monitoring
    getProviderHealth() {
        const health = {};
        for (const [name, data] of this.healthMonitor) {
            health[name] = {
                ...data,
                isAvailable: this.providers.get(name)?.isAvailable || false
            };
        }
        return health;
    }

    getProviderMetrics() {
        const metrics = {};
        for (const [name, data] of this.providerMetrics) {
            metrics[name] = { ...data };
        }
        return metrics;
    }

    getLoadBalancerStatus() {
        const status = {};
        for (const [name, data] of this.loadBalancer) {
            status[name] = { ...data };
        }
        return status;
    }

    // Cleanup method
    destroy() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
        }
        
        // Clear all caches
        this.requestCache.clear();
        this.healthMonitor.clear();
        this.providerMetrics.clear();
        this.loadBalancer.clear();
    }

    async handleFallbackRouting(request, context, primaryError) {
        // Try local provider first as ultimate fallback
        try {
            const localProvider = this.providers.get('local');
            if (localProvider && localProvider.isAvailable) {
                const response = await localProvider.chat('llama2', request, context);
                return {
                    ...response,
                    provider: 'local',
                    model: 'llama2',
                    routing: 'fallback',
                    fallback: true,
                    originalError: primaryError.message
                };
            }
        } catch (fallbackError) {
            console.error('Fallback routing also failed:', fallbackError);
        }
        
        throw new Error('All AI providers failed: ' + primaryError.message);
    }

    generateCacheKey(request, context) {
        const key = `${context.type || 'general'}_${request.slice(0, 100)}_${context.provider || 'default'}`;
        return this.hashString(key);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    cacheResponse(key, response) {
        this.requestCache.set(key, response);
        
        if (this.requestCache.size > this.maxCacheSize) {
            const firstKey = this.requestCache.keys().next().value;
            this.requestCache.delete(firstKey);
        }
    }

    async handleAIRequest(detail) {
        const { type, content, context = {} } = detail;
        
        try {
            const response = await this.routeRequest(content, { ...context, type });
            
            // Emit response event
            document.dispatchEvent(new CustomEvent('ai-response', {
                detail: { type, response, success: true }
            }));
            
        } catch (error) {
            // Emit error event
            document.dispatchEvent(new CustomEvent('ai-response', {
                detail: { type, error: error.message, success: false }
            }));
        }
    }

    // Public API methods
    async getCommandSuggestion(description, context = {}) {
        return await this.routeRequest(
            `Generate terminal commands for: "${description}". Provide 3-5 different approaches with explanations.`,
            { ...context, type: 'command_suggestion', domain: 'coding', priority: 'medium' }
        );
    }

    async explainCode(code, language, context = {}) {
        return await this.routeRequest(
            `Explain this ${language} code in simple terms:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            { ...context, type: 'explain_code', domain: 'coding', priority: 'high' }
        );
    }

    async generateCode(requirement, language, context = {}) {
        return await this.routeRequest(
            `Generate ${language} code for: ${requirement}. Provide clean, well-commented code.`,
            { ...context, type: 'generate_code', domain: 'coding', priority: 'high' }
        );
    }

    async quickFix(error, context = {}) {
        return await this.routeRequest(
            `Analyze this error and provide a quick fix:\n\nError: ${error}\n\nProvide: 1. Root Cause 2. Quick Fix 3. Prevention`,
            { ...context, type: 'quick_fix', domain: 'coding', priority: 'high' }
        );
    }

    async chat(message, context = {}) {
        return await this.routeRequest(
            message,
            { ...context, type: 'chat', priority: 'low' }
        );
    }

    setProvider(provider) {
        if (this.providers.has(provider)) {
            this.currentProvider = provider;
            if (window.electronAPI) {
                window.electronAPI.setSetting('ai_provider', provider);
            }
            return true;
        }
        return false;
    }

    setRoutingStrategy(strategy) {
        if (['auto', 'cost', 'quality', 'speed'].includes(strategy)) {
            this.routingStrategy = strategy;
            if (window.electronAPI) {
                window.electronAPI.setSetting('ai_routing_strategy', strategy);
            }
            return true;
        }
        return false;
    }

    getAvailableProviders() {
        return Array.from(this.providers.entries())
            .filter(([name, provider]) => provider.isAvailable)
            .map(([name, provider]) => ({
                name,
                displayName: this.providerConfigs[name].name,
                models: Object.keys(this.providerConfigs[name].models)
            }));
    }

    getCurrentConfig() {
        return {
            currentProvider: this.currentProvider,
            routingStrategy: this.routingStrategy,
            availableProviders: this.getAvailableProviders(),
            providerConfigs: this.providerConfigs
        };
    }
}

// Enhanced Provider base class
class BaseAIProvider {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.isAvailable = false;
        this.supportsStreaming = false;
    }

    async initialize() {
        // Default initialization - override in subclasses
        this.isAvailable = true;
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.config.baseUrl}/models`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            this.isAvailable = response.ok;
            return this.isAvailable;
        } catch (error) {
            this.isAvailable = false;
            return false;
        }
    }

    async chat(model, messages, context) {
        throw new Error('Not implemented');
    }

    async streamChat(model, messages, context, onChunk, onComplete, onError) {
        throw new Error('Streaming not supported');
    }

    getHeaders() {
        throw new Error('Not implemented');
    }

    // Enhanced error handling
    handleApiError(response, data) {
        const errorMessages = {
            429: 'Rate limit exceeded',
            401: 'Authentication failed',
            403: 'Access forbidden',
            404: 'Resource not found',
            500: 'Internal server error',
            503: 'Service unavailable'
        };
        
        return new Error(data.error?.message || errorMessages[response.status] || 'API request failed');
    }
}

// Enhanced OpenAI Provider
class OpenAIProvider extends BaseAIProvider {
    constructor() {
        super('openai', { baseUrl: 'https://api.openai.com/v1' });
        this.apiKey = null;
        this.supportsStreaming = true;
    }

    async initialize() {
        if (window.electronAPI) {
            this.apiKey = await window.electronAPI.getSetting('openai_api_key');
        }
        this.isAvailable = !!this.apiKey;
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
    }

    async chat(model, message, context) {
        const messages = typeof message === 'string' ? [{ role: 'user', content: message }] : message;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: context.temperature || 0.7,
                    max_tokens: context.maxTokens || 1000,
                    stream: false
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw this.handleApiError(response, error);
            }

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: data.usage,
                model: data.model,
                finishReason: data.choices[0].finish_reason
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to OpenAI API');
            }
            throw error;
        }
    }

    async streamChat(model, message, context, onChunk, onComplete, onError) {
        const messages = typeof message === 'string' ? [{ role: 'user', content: message }] : message;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    ...this.getHeaders(),
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: context.temperature || 0.7,
                    max_tokens: context.maxTokens || 1000,
                    stream: true
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw this.handleApiError(response, error);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            onComplete({
                                content: fullContent,
                                finishReason: 'done'
                            });
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta?.content;
                            if (delta) {
                                fullContent += delta;
                                onChunk(delta);
                            }
                        } catch (e) {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (error) {
            onError(error);
        }
    }
}

// Enhanced Anthropic Provider
class AnthropicProvider extends BaseAIProvider {
    constructor() {
        super('anthropic', { baseUrl: 'https://api.anthropic.com/v1' });
        this.apiKey = null;
        this.supportsStreaming = true;
    }

    async initialize() {
        if (window.electronAPI) {
            this.apiKey = await window.electronAPI.getSetting('anthropic_api_key');
        }
        this.isAvailable = !!this.apiKey;
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
        };
    }

    async chat(model, message, context) {
        const messages = typeof message === 'string' ? [{ role: 'user', content: message }] : message;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/messages`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model,
                    max_tokens: context.maxTokens || 1000,
                    messages,
                    temperature: context.temperature || 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw this.handleApiError(response, error);
            }

            const data = await response.json();
            return {
                content: data.content[0].text,
                usage: data.usage,
                model: data.model,
                stopReason: data.stop_reason
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Anthropic API');
            }
            throw error;
        }
    }

    async streamChat(model, message, context, onChunk, onComplete, onError) {
        const messages = typeof message === 'string' ? [{ role: 'user', content: message }] : message;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    ...this.getHeaders(),
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    model,
                    max_tokens: context.maxTokens || 1000,
                    messages,
                    temperature: context.temperature || 0.7,
                    stream: true
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw this.handleApiError(response, error);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            onComplete({
                                content: fullContent,
                                stopReason: 'end_turn'
                            });
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.delta?.text;
                            if (delta) {
                                fullContent += delta;
                                onChunk(delta);
                            }
                        } catch (e) {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (error) {
            onError(error);
        }
    }
}

// Enhanced Local/Ollama Provider
class LocalProvider extends BaseAIProvider {
    constructor() {
        super('local', { baseUrl: 'http://localhost:11434' });
        this.supportsStreaming = true;
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    }

    async initialize() {
        // Check if Ollama is running
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`);
            this.isAvailable = response.ok;
        } catch (error) {
            this.isAvailable = false;
        }
    }

    async chat(model, message, context) {
        const messages = typeof message === 'string' ? [{ role: 'user', content: message }] : message;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/api/chat`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model: model || 'llama2',
                    messages,
                    stream: false,
                    options: {
                        temperature: context.temperature || 0.7,
                        num_predict: context.maxTokens || 1000
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Local AI service not available');
            }

            const data = await response.json();
            return {
                content: data.message.content,
                usage: { prompt_tokens: data.prompt_eval_count, completion_tokens: data.eval_count },
                model: data.model,
                done: data.done
            };
        } catch (error) {
            throw new Error(`Local AI service error: ${error.message}`);
        }
    }

    async streamChat(model, message, context, onChunk, onComplete, onError) {
        const messages = typeof message === 'string' ? [{ role: 'user', content: message }] : message;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/api/chat`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model: model || 'llama2',
                    messages,
                    stream: true,
                    options: {
                        temperature: context.temperature || 0.7,
                        num_predict: context.maxTokens || 1000
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Local AI service not available');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            fullContent += data.message.content;
                            onChunk(data.message.content);
                        }
                        if (data.done) {
                            onComplete({
                                content: fullContent,
                                done: true
                            });
                            return;
                        }
                    } catch (e) {
                        // Skip malformed JSON
                    }
                }
            }
        } catch (error) {
            onError(error);
        }
    }
}

// Enhanced Hugging Face Provider
class HuggingFaceProvider extends BaseAIProvider {
    constructor() {
        super('huggingface', { baseUrl: 'https://api-inference.huggingface.co' });
        this.apiKey = null;
        this.supportsStreaming = false; // HF doesn't support streaming in browser
    }

    async initialize() {
        if (window.electronAPI) {
            this.apiKey = await window.electronAPI.getSetting('huggingface_api_key');
        }
        this.isAvailable = !!this.apiKey;
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
    }

    async chat(model, message, context) {
        const input = typeof message === 'string' ? message : message[0].content;
        
        try {
            const response = await fetch(`${this.config.baseUrl}/models/${model}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    inputs: input,
                    parameters: {
                        max_length: context.maxTokens || 1000,
                        temperature: context.temperature || 0.7,
                        return_full_text: false,
                        do_sample: true
                    },
                    options: {
                        wait_for_model: true
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 503) {
                    throw new Error('Model is loading, please try again in a few moments');
                }
                throw new Error('Hugging Face API request failed');
            }

            const data = await response.json();
            const content = Array.isArray(data) ? data[0].generated_text : data.generated_text;
            
            return {
                content: content || 'No response generated',
                usage: { estimated_tokens: input.length + (content?.length || 0) },
                model: model
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Hugging Face API');
            }
            throw error;
        }
    }
}

// Export for use in main application
window.MultiModelAIRouter = MultiModelAIRouter;
window.aiRouter = new MultiModelAIRouter();