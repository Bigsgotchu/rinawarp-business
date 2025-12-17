import { APP_CONFIG } from '../../shared/constants';

/**
 * Core Application class that manages the overall application state
 */
export class Application {
  private initialized = false;
  private startTime = Date.now();

  constructor() {
    console.log(`📱 Initializing ${APP_CONFIG.name} v${APP_CONFIG.version}`);
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('Application is already initialized');
    }

    try {
      console.log('🚀 Starting application initialization...');

      // Perform any global initialization here
      this.initialized = true;

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Check if the application is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get application uptime
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get application version
   */
  getVersion(): string {
    return APP_CONFIG.version;
  }

  /**
   * Get application name
   */
  getName(): string {
    return APP_CONFIG.name;
  }

  /**
   * Get build information
   */
  getBuildInfo(): {
    number: string;
    timestamp: number;
    environment: string;
  } {
    return APP_CONFIG.build;
  }

  /**
   * Shutdown the application
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down application...');
    this.initialized = false;
  }
}
