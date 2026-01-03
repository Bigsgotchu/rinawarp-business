import { APP_CONFIG } from '../../shared/constants';
/**
 * Core Application class that manages the overall application state
 */
export class Application {
    initialized = false;
    startTime = Date.now();
    constructor() {
        console.log(`📱 Initializing ${APP_CONFIG.name} v${APP_CONFIG.version}`);
    }
    /**
     * Initialize the application
     */
    async initialize() {
        if (this.initialized) {
            throw new Error('Application is already initialized');
        }
        try {
            console.log('🚀 Starting application initialization...');
            // Perform any global initialization here
            this.initialized = true;
            console.log('✅ Application initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize application:', error);
            throw error;
        }
    }
    /**
     * Check if the application is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Get application uptime
     */
    getUptime() {
        return Date.now() - this.startTime;
    }
    /**
     * Get application version
     */
    getVersion() {
        return APP_CONFIG.version;
    }
    /**
     * Get application name
     */
    getName() {
        return APP_CONFIG.name;
    }
    /**
     * Get build information
     */
    getBuildInfo() {
        return APP_CONFIG.build;
    }
    /**
     * Shutdown the application
     */
    async shutdown() {
        console.log('🔄 Shutting down application...');
        this.initialized = false;
    }
}
