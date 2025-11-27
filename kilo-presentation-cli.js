#!/usr/bin/env node

/**
 * Kilo Presentation CLI
 * Auto-generate Google-Slides-ready presentation decks
 * 
 * Usage: kilo presentation create [options]
 */

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const PresentationGenerator = require('./src/presentation-generator');
const { validateConfig } = require('./src/utils/validation');
const { logger } = require('./src/utils/logger');
const GoogleSlidesAPI = require('./google-slides-integration');

const program = new Command();

// Configure CLI
program
  .name('kilo')
  .description('Kilo CLI - AI-powered development tools')
  .version('1.0.0');

// Presentation command group
const presentation = program.command('presentation');

// Create presentation command
presentation
  .command('create')
  .description('Generate a presentation deck')
  .option('--title <title>', 'Presentation title')
  .option('--audience <audience>', 'Target audience description')
  .option('--theme <theme>', 'Theme name (e.g., "RinaWarp Mermaid")')
  .option('--brand-elements <elements>', 'Brand elements and symbols')
  .option('--fonts <fonts>', 'Preferred fonts (comma-separated)')
  .option('--sections <sections>', 'Slide sections (comma-separated)')
  .option('--style <style>', 'Content style preferences')
  .option('--image-style <imageStyle>', 'Image generation style')
  .option('--include-images', 'Generate images for slides')
  .option('--include-speaker-notes', 'Generate speaker notes')
  .option('--include-voiceover', 'Generate voiceover scripts')
  .option('--promo-video <specs>', 'Promo video specifications')
  .option('--export <formats>', 'Export formats (comma-separated)')
  .option('--ab-variants <count>', 'Number of A/B variants to generate')
  .option('--output <path>', 'Output directory path')
  .option('--push-to-google', 'Push directly to Google Slides')
  .action(async (options) => {
    try {
      logger.info('🎯 Starting presentation generation...');
      
      // Validate required options
      const config = validatePresentationConfig(options);
      
      // Create generator instance
      const generator = new PresentationGenerator(config);
      
      // Generate presentation
      const result = await generator.generate();
      
      // Check if user wants to push to Google Slides
      if (options.pushToGoogle) {
        logger.info('🚀 Pushing presentation to Google Slides...');
        await pushToGoogleSlides(result.slides, config.title);
      }
      
      logger.success('✨ Presentation generated successfully!');
      logger.info(`📁 Output: ${result.outputPath}`);
      logger.info(`📊 Slides: ${result.slideCount}`);
      logger.info(`🎨 Formats: ${result.formats.join(', ')}`);
      
      // Display file structure
      displayOutputStructure(result.outputPath);
      
    } catch (error) {
      logger.error('❌ Presentation generation failed:', error.message);
      process.exit(1);
    }
  });

// Push to Google Slides command
presentation
  .command('push')
  .description('Push generated presentation to Google Slides')
  .option('--title <title>', 'Presentation title')
  .option('--path <path>', 'Path to generated presentation directory')
  .action(async (options) => {
    try {
      logger.info('🚀 Pushing presentation to Google Slides...');
      
      const presentationPath = options.path || './presentations/output';
      const title = options.title || 'Kilo Generated Presentation';
      
      // Load generated slides
      const slides = await loadGeneratedSlides(presentationPath);
      
      if (!slides || slides.length === 0) {
        throw new Error('No slides found. Generate a presentation first.');
      }
      
      // Push to Google Slides
      await pushToGoogleSlides(slides, title);
      
    } catch (error) {
      logger.error('❌ Failed to push to Google Slides:', error.message);
      process.exit(1);
    }
  });

// List themes command
presentation
  .command('themes')
  .description('List available presentation themes')
  .action(() => {
    displayAvailableThemes();
  });

// Helper functions
function validatePresentationConfig(options) {
  const required = ['title', 'audience', 'sections'];
  const missing = required.filter(field => !options[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required options: ${missing.join(', ')}`);
  }
  
  return {
    title: options.title,
    audience: options.audience,
    theme: options.theme || 'default',
    brandElements: parseListOption(options.brandElements, 'RinaWarp Technologies™, ∞∞ symbol, neon gradients'),
    fonts: parseListOption(options.fonts, 'Poppins, Montserrat, Exo 2'),
    sections: parseListOption(options.sections),
    style: parseListOption(options.style, 'simple, visual, friendly'),
    imageStyle: options.imageStyle || 'neon mermaid holographic, glowing UI',
    includeImages: !!options.includeImages,
    includeSpeakerNotes: !!options.includeSpeakerNotes,
    includeVoiceover: !!options.includeVoiceover,
    promoVideo: options.promoVideo || '60-second trailer',
    export: parseListOption(options.export, 'google-slides'),
    abVariants: parseInt(options.abVariants) || 1,
    output: options.output || './presentations/output'
  };
}

function parseListOption(option, defaultValue = '') {
  if (!option && defaultValue) return defaultValue.split(',').map(s => s.trim());
  if (!option) return [];
  return option.split(',').map(s => s.trim());
}

function displayAvailableThemes() {
  console.log('\n🎨 Available Themes:');
  console.log('  • RinaWarp Mermaid (hot pink, coral, teal, baby blue, black)');
  console.log('  • Corporate Blue');
  console.log('  • Tech Gradient');
  console.log('  • Minimal Clean');
  console.log('  • Dark Mode Neon');
  console.log();
}

function displayOutputStructure(outputPath) {
  console.log('\n📁 Generated Files:');
  console.log(`  ${outputPath}/`);
  console.log('    ├── slides/');
  console.log('    │   ├── slide-1.md');
  console.log('    │   ├── slide-2.md');
  console.log('    │   └── ...');
  console.log('    ├── google-slides-import.txt');
  console.log('    ├── speaker-notes.md');
  console.log('    ├── voiceover-scripts.md');
  console.log('    ├── assets/');
  console.log('    └── variants/');
}

// Helper functions for Google Slides integration
async function pushToGoogleSlides(slides, title) {
  try {
    const googleSlidesAPI = new GoogleSlidesAPI();
    
    // Initialize API
    const initialized = await googleSlidesAPI.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize Google Slides API');
    }
    
    // Check authentication
    if (!googleSlidesAPI.isAuthenticated()) {
      logger.info('🔐 Starting Google OAuth authentication...');
      const success = await startOAuthFlow(googleSlidesAPI);
      if (!success) {
        throw new Error('Authentication required');
      }
    }
    
    // Convert slides and create presentation
    const googleSlidesContent = googleSlidesAPI.convertKiloToGoogleSlides(slides);
    const presentation = await googleSlidesAPI.createPresentation(googleSlidesContent, title);
    
    logger.success('✅ Presentation pushed to Google Slides!');
    logger.info(`🔗 Presentation URL: ${presentation.presentationUrl}`);
    
    return presentation;
    
  } catch (error) {
    logger.error('❌ Failed to push to Google Slides:', error.message);
    throw error;
  }
}

async function loadGeneratedSlides(presentationPath) {
  try {
    const slidesPath = path.join(presentationPath, 'slides');
    const files = await fs.promises.readdir(slidesPath);
    
    const slides = [];
    for (const file of files) {
      if (file.startsWith('slide-') && file.endsWith('.md')) {
        const content = await fs.promises.readFile(path.join(slidesPath, file), 'utf8');
        const slideNumber = file.match(/slide-(\d+)\.md/)[1];
        
        slides.push({
          id: parseInt(slideNumber),
          title: extractTitleFromContent(content),
          content: content
        });
      }
    }
    
    return slides.sort((a, b) => a.id - b.id);
    
  } catch (error) {
    logger.error('❌ Failed to load generated slides:', error.message);
    throw error;
  }
}

function extractTitleFromContent(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  return 'Untitled Slide';
}

async function startOAuthFlow(googleSlidesAPI) {
  try {
    const authUrl = googleSlidesAPI.generateAuthUrl();
    
    logger.info('🌐 Please open this URL in your browser for Google authentication:');
    logger.info(`📋 ${authUrl}`);
    logger.info('📋 After authorizing, paste the authorization code from the redirect URL here.');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('\n📋 After authorizing, paste the authorization code here: ', async (code) => {
        rl.close();
        try {
          await googleSlidesAPI.getTokens(code.trim());
          resolve(true);
        } catch (error) {
          logger.error('❌ Failed to get OAuth tokens:', error.message);
          resolve(false);
        }
      });
    });
    
  } catch (error) {
    logger.error('❌ OAuth flow failed:', error.message);
    return false;
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});

// Parse command line arguments
program.parse();