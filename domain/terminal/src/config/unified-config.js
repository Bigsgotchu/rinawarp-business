/**
 * Unified Configuration System
 * Centralized configuration management for RinaWarp Terminal Pro
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UnifiedConfig {
  constructor() {
    this.config = {};
    this.env = process.env.NODE_ENV || 'development';
    this.loadConfiguration();
  }

  loadConfiguration() {
    // Base configuration
    this.config = {
      app: {
        name: 'RinaWarp Terminal Pro',
        version: '1.0.0',
        environment: this.env,
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || 'localhost',
      },

      ai: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        },
        groq: {
          apiKey: process.env.GROQ_API_KEY,
          model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
          maxTokens: parseInt(process.env.GROQ_MAX_TOKENS) || 1000,
          temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.7,
        },
      },

      voice: {
        elevenlabs: {
          apiKey: process.env.ELEVENLABS_API_KEY,
          voiceId: process.env.ELEVENLABS_VOICE_ID || 'ULm8JbxJlz7SpQhRhqnO',
          model: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
        },
      },

      database: {
        type: process.env.DB_TYPE || 'memory',
        url: process.env.DATABASE_URL,
        redis: {
          url: process.env.REDIS_URL,
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
        },
      },

      aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        s3: {
          bucket: process.env.S3_BUCKET_NAME || 'rinawarp-downloads',
        },
      },

      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        prices: {
          professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
          business: process.env.STRIPE_BUSINESS_PRICE_ID,
          lifetime: process.env.STRIPE_LIFETIME_PRICE_ID,
        },
      },

      email: {
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        smtp: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        sendgrid: {
          apiKey: process.env.SENDGRID_API_KEY,
        },
        from: process.env.EMAIL_FROM || 'noreply@rinawarptech.com',
      },

      monitoring: {
        sentry: {
          dsn: process.env.SENTRY_DSN,
          environment: this.env,
        },
        ga4: {
          measurementId: process.env.GA_MEASUREMENT_ID,
        },
      },

      security: {
        cors: {
          origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : ['https://rinawarptech.com', 'https://rinawarptech.com'],
          credentials: true,
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100, // requests per window
        },
      },

      features: {
        voiceEnabled: process.env.VOICE_ENABLED !== 'false',
        analyticsEnabled: process.env.ANALYTICS_ENABLED !== 'false',
        monitoringEnabled: process.env.MONITORING_ENABLED !== 'false',
        debugMode: this.env === 'development',
      },
    };

    // Load environment-specific overrides
    this.loadEnvironmentOverrides();

    // Validate configuration
    this.validateConfiguration();

    console.log(`✅ Configuration loaded for environment: ${this.env}`);
  }

  loadEnvironmentOverrides() {
    const envConfigPath = path.join(__dirname, `../../config/${this.env}.json`);

    if (fs.existsSync(envConfigPath)) {
      try {
        const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
        this.config = this.deepMerge(this.config, envConfig);
        console.log(`✅ Environment-specific config loaded: ${this.env}.json`);
      } catch (error) {
        console.warn(`⚠️ Failed to load environment config: ${error.message}`);
      }
    }
  }

  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  validateConfiguration() {
    const required = [
      'ai.openai.apiKey',
      'ai.groq.apiKey',
      'voice.elevenlabs.apiKey',
    ];

    const missing = required.filter((key) => !this.get(key));

    if (missing.length > 0) {
      console.warn('⚠️ Missing required configuration:', missing);
    }

    // Validate email configuration
    if (this.config.email.provider === 'smtp') {
      if (!this.config.email.smtp.host || !this.config.email.smtp.user) {
        console.warn('⚠️ SMTP configuration incomplete');
      }
    }
  }

  // Get configuration value by dot notation
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  // Set configuration value by dot notation
  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let target = this.config;

    for (const k of keys) {
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }

    target[lastKey] = value;
  }

  // Get all configuration
  getAll() {
    return { ...this.config };
  }

  // Check if feature is enabled
  isFeatureEnabled(feature) {
    return this.get(`features.${feature}`, false);
  }

  // Get AI configuration for specific provider
  getAIConfig(provider = 'openai') {
    return this.get(`ai.${provider}`, {});
  }

  // Get database configuration
  getDatabaseConfig() {
    return this.get('database', {});
  }

  // Get security configuration
  getSecurityConfig() {
    return this.get('security', {});
  }

  // Get monitoring configuration
  getMonitoringConfig() {
    return this.get('monitoring', {});
  }

  // Reload configuration
  reload() {
    this.loadConfiguration();
  }

  // Export configuration to file
  exportToFile(filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.config, null, 2));
      console.log(`✅ Configuration exported to: ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to export configuration:', error);
    }
  }
}

// Export singleton instance
export const config = new UnifiedConfig();
export default config;
