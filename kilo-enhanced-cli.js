/**
 * Enhanced Kilo CLI with Google Slides Direct Integration
 */

const fs = require('fs').promises;
const path = require('path');
const open = require('open');
const GoogleSlidesAPI = require('./google-slides-integration');
const PresentationGenerator = require('./src/presentation-generator');

class KiloEnhancedCLI {
  constructor() {
    this.googleSlidesAPI = new GoogleSlidesAPI();
    this.tokensFile = './google-tokens.json';
  }

  /**
   * Handle Google OAuth authentication flow
   */
  async handleOAuthFlow() {
    try {
      console.log('🔐 Starting Google OAuth authentication...');
      
      // Initialize Google Slides API
      const initialized = await this.googleSlidesAPI.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Slides API');
      }

      // Generate OAuth URL
      const authUrl = this.googleSlidesAPI.generateAuthUrl();
      console.log('🌐 Opening browser for Google authentication...');
      console.log(`📋 OAuth URL: ${authUrl}`);
      
      // Open browser for authentication
      await open(authUrl);

      console.log('\n📋 Please complete the authentication in your browser.');
      console.log('📋 After authorizing, you\'ll be redirected to a URL.');
      console.log('📋 Copy the "code" parameter from the redirect URL and paste it here.\n');

      // Get authorization code from user
      const authCode = await this.promptUser('Enter the authorization code: ');
      
      // Exchange code for tokens
      const tokens = await this.googleSlidesAPI.getTokens(authCode.trim());
      
      // Save tokens
      await this.saveTokens(tokens);
      
      console.log('✅ Authentication successful! Tokens saved.');
      return true;

    } catch (error) {
      console.error('❌ OAuth authentication failed:', error.message);
      return false;
    }
  }

  /**
   * Create presentation directly in Google Slides
   */
  async createGoogleSlidesPresentation(config) {
    try {
      // Check if authenticated
      if (!this.googleSlidesAPI.isAuthenticated()) {
        console.log('🔐 Not authenticated. Starting OAuth flow...');
        const authenticated = await this.handleOAuthFlow();
        if (!authenticated) {
          throw new Error('Authentication required');
        }
      }

      // Generate presentation content
      console.log('🎯 Generating presentation content...');
      const generator = new PresentationGenerator(config);
      const result = await generator.generate();
      
      console.log('📊 Converting to Google Slides format...');
      const googleSlidesContent = this.googleSlidesAPI.convertKiloToGoogleSlides(result.slides);
      
      console.log('🚀 Creating Google Slides presentation...');
      const presentation = await this.googleSlidesAPI.createPresentation(
        googleSlidesContent, 
        config.title
      );
      
      console.log('✅ Google Slides presentation created successfully!');
      console.log(`🔗 Presentation URL: ${presentation.presentationUrl}`);
      console.log(`📋 Presentation ID: ${presentation.presentationId}`);
      
      // Open presentation in browser
      await open(presentation.presentationUrl);
      
      return presentation;

    } catch (error) {
      console.error('❌ Failed to create Google Slides presentation:', error.message);
      throw error;
    }
  }

  /**
   * Update package.json to include new commands
   */
  async updatePackageJson() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      
      // Add Google API dependencies
      packageJson.dependencies = {
        ...packageJson.dependencies,
        'googleapis': '^128.0.0',
        'open': '^10.0.0'
      };

      // Add new scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'auth-google': 'node google-slides-integration.js --auth',
        'create-slides': 'node kilo-enhanced-cli.js --create-slides',
        'demo-google': 'node kilo-enhanced-cli.js --demo-google'
      };

      await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
      console.log('✅ package.json updated with Google Slides integration');
      
    } catch (error) {
      console.warn('⚠️ Could not update package.json:', error.message);
    }
  }

  /**
   * Save OAuth tokens to file
   */
  async saveTokens(tokens) {
    try {
      await fs.writeFile(this.tokensFile, JSON.stringify(tokens, null, 2));
      console.log(`💾 Tokens saved to: ${this.tokensFile}`);
    } catch (error) {
      console.error('❌ Failed to save tokens:', error.message);
    }
  }

  /**
   * Load OAuth tokens from file
   */
  async loadTokens() {
    try {
      const tokens = JSON.parse(await fs.readFile(this.tokensFile, 'utf8'));
      await this.googleSlidesAPI.setStoredTokens(tokens);
      console.log('✅ Tokens loaded successfully');
      return true;
    } catch (error) {
      console.log('📝 No saved tokens found');
      return false;
    }
  }

  /**
   * Prompt user for input
   */
  async promptUser(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  /**
   * Demo Google Slides integration
   */
  async demoGoogleSlidesIntegration() {
    console.log('🎬 Kilo Google Slides Integration Demo\n');
    
    try {
      // Check if we have saved tokens
      const hasTokens = await this.loadTokens();
      
      if (!hasTokens) {
        console.log('🔐 Starting OAuth authentication demo...');
        const success = await this.handleOAuthFlow();
        if (!success) {
          throw new Error('Authentication failed');
        }
      }

      // Create a simple demo presentation
      const demoConfig = {
        title: 'Kilo Google Slides Demo',
        audience: 'demo audience',
        theme: 'RinaWarp Mermaid',
        sections: [
          'Title Slide',
          'What is Kilo?',
          'Google Integration',
          'Next Steps'
        ],
        style: ['simple', 'visual'],
        export: ['google-slides'],
        output: './demo-google-slides'
      };

      console.log('\n🚀 Creating demo presentation in Google Slides...');
      const presentation = await this.createGoogleSlidesPresentation(demoConfig);
      
      console.log('\n🎉 Demo completed successfully!');
      console.log(`📋 Your presentation is ready: ${presentation.presentationUrl}`);
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🎯 Kilo Enhanced CLI with Google Slides Integration

Commands:
  --auth                  Authenticate with Google Slides API
  --create-slides         Create presentation directly in Google Slides
  --demo-google          Run Google Slides integration demo
  --help                 Show this help message

Usage Examples:

1. Authenticate with Google:
   npm run auth-google

2. Create presentation in Google Slides:
   npm run create-slides --title "My Presentation" --sections "Intro,Content,Conclusion"

3. Run integration demo:
   npm run demo-google

Setup:
1. Ensure google-oauth-credentials.json is configured
2. Enable Google Slides API in Google Cloud Console
3. Run authentication flow

For more details, see README.md
    `);
  }
}

// CLI execution
if (require.main === module) {
  const cli = new KiloEnhancedCLI();
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    cli.showHelp();
  } else if (args.includes('--auth')) {
    cli.handleOAuthFlow();
  } else if (args.includes('--demo-google')) {
    cli.demoGoogleSlidesIntegration();
  } else if (args.includes('--create-slides')) {
    // Parse command line arguments for presentation creation
    const config = {
      title: 'My Presentation',
      audience: 'general',
      theme: 'RinaWarp Mermaid',
      sections: ['Introduction', 'Main Content', 'Conclusion'],
      export: ['google-slides'],
      output: './output'
    };
    
    // Extract arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--title' && args[i + 1]) {
        config.title = args[i + 1];
      } else if (args[i] === '--sections' && args[i + 1]) {
        config.sections = args[i + 1].split(',').map(s => s.trim());
      }
    }
    
    cli.createGoogleSlidesPresentation(config);
  } else {
    console.log('❓ Unknown command. Use --help for usage information.');
  }
}

module.exports = KiloEnhancedCLI;