/**
 * Asset Generator
 * Generates visual assets, backgrounds, and promotional materials
 */

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./utils/logger');
const ThemeEngine = require('./theme-engine');

class AssetGenerator {
  constructor(config) {
    this.config = config;
    this.outputPath = config.output;
    this.theme = new ThemeEngine(config.theme, config);
    this.assets = [];
  }

  /**
   * Generate all assets
   */
  async generateAssets() {
    logger.info('🎨 Starting asset generation...');
    
    // Generate backgrounds
    await this.generateBackgrounds();
    
    // Generate logo variations
    await this.generateLogos();
    
    // Generate social media assets
    await this.generateSocialAssets();
    
    // Generate promotional materials
    await this.generatePromoMaterials();
    
    logger.success(`✨ Generated ${this.assets.length} assets`);
    return this.assets;
  }

  /**
   * Generate slide backgrounds
   */
  async generateBackgrounds() {
    const backgroundsDir = path.join(this.outputPath, 'assets', 'backgrounds');
    await fs.mkdir(backgroundsDir, { recursive: true });
    
    const colors = this.theme.getColorPalette();
    
    // Primary gradient background
    const primaryBackground = this.createGradientCSS({
      direction: '135deg',
      colors: [colors.primary, colors.secondary, colors.accent],
      opacity: '30'
    });
    
    await this.writeCSSFile(
      path.join(backgroundsDir, 'primary-gradient.css'),
      this.wrapAsBackgroundCSS(primaryBackground, 'Primary Gradient')
    );
    
    // Holographic background
    const holographicBackground = this.createGradientCSS({
      direction: '45deg',
      colors: [colors.primary, colors.accent, colors.light, colors.secondary],
      opacity: '20'
    });
    
    await this.writeCSSFile(
      path.join(backgroundsDir, 'holographic.css'),
      this.wrapAsBackgroundCSS(holographicBackground, 'Holographic Effect')
    );
    
    // Neon accent background
    const neonBackground = this.createGradientCSS({
      direction: '180deg',
      colors: [colors.dark, colors.neon],
      opacity: '40'
    });
    
    await this.writeCSSFile(
      path.join(backgroundsDir, 'neon-accent.css'),
      this.wrapAsBackgroundCSS(neonBackground, 'Neon Accent')
    );
    
    // Solid color backgrounds
    const solidColors = [
      { name: 'hot-pink', color: colors.primary },
      { name: 'coral', color: colors.secondary },
      { name: 'teal', color: colors.accent },
      { name: 'baby-blue', color: colors.light },
      { name: 'black', color: colors.dark }
    ];
    
    for (const solid of solidColors) {
      await this.writeCSSFile(
        path.join(backgroundsDir, `${solid.name}.css`),
        this.wrapAsBackgroundCSS(solid.color, `${solid.name} Solid`)
      );
    }
    
    this.assets.push(...solidColors.map(s => ({
      name: s.name,
      type: 'solid-background',
      path: `assets/backgrounds/${s.name}.css`
    })));
  }

  /**
   * Generate logo variations
   */
  async generateLogos() {
    const logosDir = path.join(this.outputPath, 'assets', 'logos');
    await fs.mkdir(logosDir, { recursive: true });
    
    const brandElements = this.theme.generateBrandElements();
    
    // Main logo SVG
    const mainLogoSVG = this.createLogoSVG({
      text: 'RinaWarp Technologies™',
      symbol: brandElements.symbol,
      colors: this.theme.getColorPalette()
    });
    
    await this.writeSVGFile(
      path.join(logosDir, 'main-logo.svg'),
      mainLogoSVG
    );
    
    // Symbol only logo
    const symbolLogoSVG = this.createLogoSVG({
      text: '',
      symbol: brandElements.symbol,
      colors: this.theme.getColorPalette(),
      symbolOnly: true
    });
    
    await this.writeSVGFile(
      path.join(logosDir, 'symbol-only.svg'),
      symbolLogoSVG
    );
    
    // Horizontal logo
    const horizontalLogoSVG = this.createLogoSVG({
      text: 'RinaWarp',
      symbol: brandElements.symbol,
      colors: this.theme.getColorPalette(),
      layout: 'horizontal'
    });
    
    await this.writeSVGFile(
      path.join(logosDir, 'horizontal.svg'),
      horizontalLogoSVG
    );
    
    this.assets.push(
      { name: 'main-logo', type: 'logo', path: 'assets/logos/main-logo.svg' },
      { name: 'symbol-only', type: 'logo', path: 'assets/logos/symbol-only.svg' },
      { name: 'horizontal', type: 'logo', path: 'assets/logos/horizontal.svg' }
    );
  }

  /**
   * Generate social media assets
   */
  async generateSocialAssets() {
    const socialDir = path.join(this.outputPath, 'assets', 'social');
    await fs.mkdir(socialDir, { recursive: true });
    
    const socialSpecs = [
      { platform: 'instagram', size: '1080x1080', name: 'square' },
      { platform: 'instagram', size: '1080x1350', name: 'story' },
      { platform: 'tiktok', size: '1080x1920', name: 'vertical' },
      { platform: 'twitter', size: '1200x675', name: 'banner' },
      { platform: 'facebook', size: '1200x630', name: 'cover' }
    ];
    
    for (const spec of socialSpecs) {
      const socialSVG = this.createSocialMediaSVG({
        platform: spec.platform,
        size: spec.size,
        brand: this.theme.generateBrandElements(),
        colors: this.theme.getColorPalette()
      });
      
      const filename = `${spec.platform}-${spec.name}.svg`;
      await this.writeSVGFile(
        path.join(socialDir, filename),
        socialSVG
      );
      
      this.assets.push({
        name: filename,
        type: 'social-media',
        platform: spec.platform,
        path: `assets/social/${filename}`
      });
    }
  }

  /**
   * Generate promotional materials
   */
  async generatePromoMaterials() {
    const promoDir = path.join(this.outputPath, 'assets', 'promo');
    await fs.mkdir(promoDir, { recursive: true });
    
    // Promo banner
    const promoBanner = this.createPromoBanner({
      title: this.config.title,
      tagline: 'Digital Empowerment Simplified',
      colors: this.theme.getColorPalette(),
      brand: this.theme.generateBrandElements()
    });
    
    await this.writeSVGFile(
      path.join(promoDir, 'promo-banner.svg'),
      promoBanner
    );
    
    // Video thumbnail
    const videoThumbnail = this.createVideoThumbnail({
      title: this.config.title,
      subtitle: 'Your Digital Superpower Awaits',
      colors: this.theme.getColorPalette(),
      brand: this.theme.generateBrandElements()
    });
    
    await this.writeSVGFile(
      path.join(promoDir, 'video-thumbnail.svg'),
      videoThumbnail
    );
    
    // Quote cards
    const testimonialSVG = this.createTestimonialCard({
      quote: 'Terminal Pro changed everything for me',
      author: 'Happy User',
      colors: this.theme.getColorPalette()
    });
    
    await this.writeSVGFile(
      path.join(promoDir, 'testimonial-card.svg'),
      testimonialSVG
    );
    
    this.assets.push(
      { name: 'promo-banner', type: 'promotional', path: 'assets/promo/promo-banner.svg' },
      { name: 'video-thumbnail', type: 'promotional', path: 'assets/promo/video-thumbnail.svg' },
      { name: 'testimonial-card', type: 'promotional', path: 'assets/promo/testimonial-card.svg' }
    );
  }

  /**
   * Create gradient CSS
   */
  createGradientCSS({ direction, colors, opacity = '30' }) {
    const gradientStops = colors.map((color, index) => {
      const percentage = (index / (colors.length - 1)) * 100;
      return `${color}${opacity} ${percentage}%`;
    }).join(', ');
    
    return `linear-gradient(${direction}, ${gradientStops})`;
  }

  /**
   * Wrap CSS as background
   */
  wrapAsBackgroundCSS(background, name) {
    return `/* ${name} Background */
.slide-background {
  background: ${background};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Usage: 
   Apply class "slide-background" to slide containers
   Customize opacity by changing the hex alpha values
*/`;
  }

  /**
   * Create logo SVG
   */
  createLogoSVG({ text, symbol, colors, symbolOnly = false, layout = 'vertical' }) {
    const fontSize = symbolOnly ? '48' : '32';
    const symbolSize = symbolOnly ? '64' : '48';
    
    return `<svg width="400" height="${symbolOnly ? '80' : '120'}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.accent};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="${symbolOnly ? '80' : '120'}" fill="transparent"/>
  
  <!-- Symbol -->
  <text x="20" y="${symbolOnly ? '50' : '60'}" 
        font-family="Poppins, sans-serif" 
        font-size="${symbolSize}" 
        font-weight="bold" 
        fill="url(#logoGradient)" 
        filter="url(#glow)">${symbol}</text>
  
  ${!symbolOnly ? `
  <!-- Text -->
  <text x="${parseInt(symbolSize) + 40}" y="50" 
        font-family="Poppins, sans-serif" 
        font-size="${fontSize}" 
        font-weight="600" 
        fill="url(#logoGradient)">${text}</text>
  
  <!-- Subtitle -->
  <text x="${parseInt(symbolSize) + 40}" y="80" 
        font-family="Montserrat, sans-serif" 
        font-size="14" 
        fill="${colors.light}">Digital Empowerment Simplified</text>
  ` : ''}
</svg>`;
  }

  /**
   * Create social media SVG
   */
  createSocialMediaSVG({ platform, size, brand, colors }) {
    const [width, height] = size.split('x').map(Number);
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.dark};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.primary};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
    </linearGradient>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Brand Symbol -->
  <text x="50%" y="40%" 
        text-anchor="middle"
        font-family="Poppins, sans-serif" 
        font-size="${Math.min(width, height) * 0.15}" 
        font-weight="bold" 
        fill="${colors.neon}" 
        filter="url(#textGlow)">${brand.symbol}</text>
  
  <!-- Platform Text -->
  <text x="50%" y="60%" 
        text-anchor="middle"
        font-family="Montserrat, sans-serif" 
        font-size="${Math.min(width, height) * 0.08}" 
        font-weight="600" 
        fill="${colors.light}"
        text-transform="uppercase">${platform}</text>
  
  <!-- RinaWarp Branding -->
  <text x="50%" y="85%" 
        text-anchor="middle"
        font-family="Montserrat, sans-serif" 
        font-size="${Math.min(width, height) * 0.04}" 
        fill="${colors.secondary}">RinaWarp Technologies™</text>
</svg>`;
  }

  /**
   * Create promotional banner
   */
  createPromoBanner({ title, tagline, colors, brand }) {
    return `<svg width="1200" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
      <stop offset="30%" style="stop-color:${colors.accent};stop-opacity:0.6" />
      <stop offset="70%" style="stop-color:${colors.secondary};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colors.dark};stop-opacity:1" />
    </linearGradient>
    <filter id="bannerGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="300" fill="url(#bannerGradient)"/>
  
  <!-- Decorative elements -->
  <circle cx="200" cy="150" r="100" fill="${colors.primary}20"/>
  <circle cx="1000" cy="150" r="80" fill="${colors.accent}20"/>
  
  <!-- Brand Symbol -->
  <text x="100" y="180" 
        font-family="Poppins, sans-serif" 
        font-size="80" 
        font-weight="bold" 
        fill="${colors.neon}" 
        filter="url(#bannerGlow)">${brand.symbol}</text>
  
  <!-- Title -->
  <text x="300" y="140" 
        font-family="Poppins, sans-serif" 
        font-size="48" 
        font-weight="700" 
        fill="white">${title}</text>
  
  <!-- Tagline -->
  <text x="300" y="200" 
        font-family="Montserrat, sans-serif" 
        font-size="24" 
        font-weight="400" 
        fill="${colors.light}">${tagline}</text>
  
  <!-- CTA -->
  <rect x="900" y="120" width="250" height="60" rx="30" fill="${colors.holographic}"/>
  <text x="1025" y="160" 
        text-anchor="middle"
        font-family="Montserrat, sans-serif" 
        font-size="20" 
        font-weight="600" 
        fill="${colors.dark}">Get Started</text>
</svg>`;
  }

  /**
   * Create video thumbnail
   */
  createVideoThumbnail({ title, subtitle, colors, brand }) {
    return `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="thumbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.dark};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.primary};stop-opacity:0.7" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.9" />
    </linearGradient>
    <filter id="thumbGlow">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1280" height="720" fill="url(#thumbGradient)"/>
  
  <!-- Play button -->
  <circle cx="640" cy="360" r="80" fill="${colors.primary}40" filter="url(#thumbGlow)"/>
  <polygon points="620,330 700,360 620,390" fill="white"/>
  
  <!-- Title -->
  <text x="640" y="480" 
        text-anchor="middle"
        font-family="Poppins, sans-serif" 
        font-size="42" 
        font-weight="700" 
        fill="white">${title}</text>
  
  <!-- Subtitle -->
  <text x="640" y="520" 
        text-anchor="middle"
        font-family="Montserrat, sans-serif" 
        font-size="24" 
        font-weight="400" 
        fill="${colors.light}">${subtitle}</text>
  
  <!-- Duration indicator -->
  <rect x="1100" y="650" width="120" height="40" rx="20" fill="${colors.dark}80"/>
  <text x="1160" y="675" 
        text-anchor="middle"
        font-family="Montserrat, sans-serif" 
        font-size="16" 
        fill="white">2:34</text>
</svg>`;
  }

  /**
   * Create testimonial card
   */
  createTestimonialCard({ quote, author, colors }) {
    return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary}20;stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.accent}20;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="300" rx="20" fill="url(#cardGradient)"/>
  
  <!-- Quote mark -->
  <text x="50" y="80" 
        font-family="Georgia, serif" 
        font-size="60" 
        font-weight="bold" 
        fill="${colors.primary}">"</text>
  
  <!-- Quote text -->
  <text x="50" y="140" 
        font-family="Montserrat, sans-serif" 
        font-size="18" 
        font-weight="400" 
        fill="${colors.dark}"
        width="300">${quote}</text>
  
  <!-- Author -->
  <text x="50" y="220" 
        font-family="Poppins, sans-serif" 
        font-size="16" 
        font-weight="600" 
        fill="${colors.accent}">— ${author}</text>
  
  <!-- Stars -->
  <text x="50" y="260" 
        font-family="Arial, sans-serif" 
        font-size="20" 
        fill="${colors.secondary}">★★★★★</text>
</svg>`;
  }

  /**
   * Write CSS file
   */
  async writeCSSFile(filepath, content) {
    await fs.writeFile(filepath, content, 'utf8');
    logger.debug(`Created CSS asset: ${path.basename(filepath)}`);
  }

  /**
   * Write SVG file
   */
  async writeSVGFile(filepath, content) {
    await fs.writeFile(filepath, content, 'utf8');
    logger.debug(`Created SVG asset: ${path.basename(filepath)}`);
  }

  /**
   * Generate asset manifest
   */
  generateAssetManifest() {
    return {
      theme: this.theme.getThemeInfo(),
      assets: this.assets,
      usage: {
        backgrounds: 'Apply CSS classes to slide containers',
        logos: 'Use in headers, footers, and branding elements',
        social: 'Use for social media promotion and sharing',
        promo: 'Use for marketing materials and advertisements'
      },
      customization: {
        colors: 'Modify CSS variables for different color schemes',
        fonts: 'Update font-family declarations in CSS',
        sizes: 'Adjust SVG viewBox and dimensions as needed'
      }
    };
  }
}

module.exports = AssetGenerator;