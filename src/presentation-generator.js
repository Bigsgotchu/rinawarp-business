/**
 * Presentation Generator Core
 * Main engine for generating presentation content
 */

const fs = require('fs').promises;
const path = require('path');
const ContentGenerator = require('./content-generator');
const ThemeEngine = require('./theme-engine');
const ExportFormatters = require('./export-formatters');
const AssetGenerator = require('./asset-generator');
const { logger } = require('./utils/logger');

class PresentationGenerator {
  constructor(config) {
    this.config = config;
    this.outputPath = path.resolve(config.output);
    this.slides = [];
    this.assets = [];
  }

  async generate() {
    logger.info('🚀 Initializing presentation generation...');
    
    // Create output directory
    await this.createOutputDirectory();
    
    // Generate slides content
    await this.generateSlides();
    
    // Generate assets if requested
    if (this.config.includeImages) {
      await this.generateAssets();
    }
    
    // Generate speaker notes if requested
    if (this.config.includeSpeakerNotes) {
      await this.generateSpeakerNotes();
    }
    
    // Generate voiceover if requested
    if (this.config.includeVoiceover) {
      await this.generateVoiceover();
    }
    
    // Generate social media content
    await this.generateSocialContent();
    
    // Export to requested formats
    const formats = await this.generateExports();
    
    // Generate A/B variants if requested
    if (this.config.abVariants > 1) {
      await this.generateABVariants();
    }
    
    return {
      outputPath: this.outputPath,
      slideCount: this.slides.length,
      formats,
      assets: this.assets.length
    };
  }

  async createOutputDirectory() {
    await fs.mkdir(this.outputPath, { recursive: true });
    await fs.mkdir(path.join(this.outputPath, 'slides'), { recursive: true });
    await fs.mkdir(path.join(this.outputPath, 'assets'), { recursive: true });
    await fs.mkdir(path.join(this.outputPath, 'variants'), { recursive: true });
  }

  async generateSlides() {
    logger.info('📝 Generating slide content...');
    
    const contentGenerator = new ContentGenerator(this.config);
    this.slides = await contentGenerator.generateSlides();
    
    // Save individual slide files
    for (let i = 0; i < this.slides.length; i++) {
      const slide = this.slides[i];
      const filename = `slide-${i + 1}.md`;
      const filepath = path.join(this.outputPath, 'slides', filename);
      
      await fs.writeFile(filepath, slide.content, 'utf8');
      logger.debug(`Generated: ${filename}`);
    }
  }

  async generateAssets() {
    logger.info('🎨 Generating visual assets...');
    
    const assetGenerator = new AssetGenerator(this.config);
    this.assets = await assetGenerator.generateAssets();
  }

  async generateSpeakerNotes() {
    logger.info('📖 Generating speaker notes...');
    
    const contentGenerator = new ContentGenerator(this.config);
    const speakerNotes = await contentGenerator.generateSpeakerNotes(this.slides);
    
    const filepath = path.join(this.outputPath, 'speaker-notes.md');
    await fs.writeFile(filepath, speakerNotes, 'utf8');
  }

  async generateVoiceover() {
    logger.info('🎙️ Generating voiceover scripts...');
    
    const contentGenerator = new ContentGenerator(this.config);
    const voiceover = await contentGenerator.generateVoiceover(this.slides);
    
    const filepath = path.join(this.outputPath, 'voiceover-scripts.md');
    await fs.writeFile(filepath, voiceover, 'utf8');
  }

  async generateSocialContent() {
    logger.info('📱 Generating social media content...');
    
    const contentGenerator = new ContentGenerator(this.config);
    const socialContent = await contentGenerator.generateSocialContent(this.slides);
    
    const filepath = path.join(this.outputPath, 'social-media-pack.md');
    await fs.writeFile(filepath, socialContent, 'utf8');
  }

  async generateExports() {
    logger.info('📊 Generating export formats...');
    
    const exportFormatters = new ExportFormatters(this.config, this.slides);
    const formats = await exportFormatters.generateAllExports();
    
    return formats;
  }

  async generateABVariants() {
    logger.info('🔄 Generating A/B variants...');
    
    for (let variant = 1; variant < this.config.abVariants; variant++) {
      const variantConfig = {
        ...this.config,
        variant: variant,
        output: path.join(this.outputPath, 'variants', `variant-${variant}`)
      };
      
      const variantGenerator = new PresentationGenerator(variantConfig);
      await variantGenerator.generate();
      
      logger.debug(`Generated variant ${variant}`);
    }
  }
}

module.exports = PresentationGenerator;