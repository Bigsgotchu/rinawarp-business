/**
 * Theme Engine
 * Handles RinaWarp Mermaid theming and brand styling
 */

const { logger } = require('./utils/logger');

class ThemeEngine {
  constructor(theme = 'RinaWarp Mermaid', config = {}) {
    this.theme = theme;
    this.config = config;
    this.themes = this.loadThemes();
    this.currentTheme = this.themes[theme] || this.themes['RinaWarp Mermaid'];
  }

  /**
   * Load all available themes
   */
  loadThemes() {
    return {
      'RinaWarp Mermaid': {
        name: 'RinaWarp Mermaid',
        description: 'Hot pink, coral, teal, baby blue, black with neon holographic effects',
        colors: {
          primary: '#FF69B4', // hot pink
          secondary: '#FF7F7F', // coral
          accent: '#20B2AA', // teal
          light: '#B0E0E6', // baby blue
          dark: '#000000', // black
          holographic: 'linear-gradient(45deg, #FF69B4, #20B2AA, #B0E0E6)',
          neon: '#00FFFF'
        },
        fonts: {
          primary: 'Poppins, sans-serif',
          secondary: 'Montserrat, sans-serif',
          mono: 'Exo 2, monospace'
        },
        style: {
          aesthetic: 'neon-mermaid-holographic',
          energy: 'Rina Vex aesthetic',
          effects: ['glow', 'holographic', 'neon-trace']
        },
        symbols: {
          infinity: '∞∞',
          energy: '⚡',
          mermaid: '🧜‍♀️',
          tech: '🔮'
        }
      },
      'Corporate Blue': {
        name: 'Corporate Blue',
        description: 'Professional navy, light blue, white, gray',
        colors: {
          primary: '#1e3a8a',
          secondary: '#3b82f6',
          accent: '#60a5fa',
          light: '#dbeafe',
          dark: '#1f2937',
          holographic: 'linear-gradient(180deg, #1e3a8a, #3b82f6)',
          neon: '#60a5fa'
        },
        fonts: {
          primary: 'Arial, sans-serif',
          secondary: 'Helvetica, sans-serif',
          mono: 'Courier New, monospace'
        },
        style: {
          aesthetic: 'professional',
          energy: 'corporate',
          effects: ['clean', 'polished']
        },
        symbols: {
          infinity: '→',
          energy: '💼',
          mermaid: '📊',
          tech: '⚙️'
        }
      },
      'Tech Gradient': {
        name: 'Tech Gradient',
        description: 'Purple, blue, cyan, white gradient theme',
        colors: {
          primary: '#8b5cf6',
          secondary: '#3b82f6',
          accent: '#06b6d4',
          light: '#f0f9ff',
          dark: '#0f172a',
          holographic: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
          neon: '#06b6d4'
        },
        fonts: {
          primary: 'Roboto, sans-serif',
          secondary: 'Open Sans, sans-serif',
          mono: 'Source Code Pro, monospace'
        },
        style: {
          aesthetic: 'tech',
          energy: 'futuristic',
          effects: ['gradient', 'glow']
        },
        symbols: {
          infinity: '≈≈',
          energy: '⚡',
          mermaid: '🔬',
          tech: '🚀'
        }
      }
    };
  }

  /**
   * Get color palette for current theme
   */
  getColorPalette() {
    return this.currentTheme.colors;
  }

  /**
   * Get fonts for current theme
   */
  getFonts() {
    return this.currentTheme.fonts;
  }

  /**
   * Generate CSS styling for slides
   */
  generateCSS() {
    const colors = this.getColorPalette();
    const fonts = this.getFonts();
    
    return `
/* RinaWarp Mermaid Theme */
:root {
  --primary-color: ${colors.primary};
  --secondary-color: ${colors.secondary};
  --accent-color: ${colors.accent};
  --light-color: ${colors.light};
  --dark-color: ${colors.dark};
  --holographic-gradient: ${colors.holographic};
  --neon-color: ${colors.neon};
}

body {
  font-family: ${fonts.primary};
  background: var(--dark-color);
  color: white;
}

.slide {
  background: linear-gradient(135deg, 
    ${colors.primary}20 0%, 
    ${colors.secondary}20 50%, 
    ${colors.accent}20 100%);
  border-radius: 20px;
  padding: 40px;
  margin: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  border: 2px solid ${colors.primary}40;
}

.slide h1 {
  color: ${colors.primary};
  text-shadow: 0 0 20px ${colors.neon};
  font-weight: 700;
}

.slide h2 {
  color: ${colors.secondary};
  text-shadow: 0 0 15px ${colors.neon}60;
}

.slide h3 {
  color: ${colors.accent};
}

.slide .highlight {
  background: ${colors.holographic};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}

.slide .neon-text {
  color: ${colors.neon};
  text-shadow: 0 0 10px ${colors.neon};
}

.slide .glow-effect {
  box-shadow: 0 0 30px ${colors.primary}40;
  transition: all 0.3s ease;
}

.slide .glow-effect:hover {
  box-shadow: 0 0 50px ${colors.primary}60;
  transform: translateY(-2px);
}

/* Mermaid specific styling */
.mermaid {
  background: var(--dark-color);
  border: 2px solid ${colors.primary}40;
  border-radius: 15px;
  padding: 20px;
}

.mermaid .node rect {
  fill: ${colors.primary}30;
  stroke: ${colors.primary};
  stroke-width: 2px;
}

.mermaid .node .label {
  color: white;
  font-family: ${fonts.secondary};
}

.mermaid .edgePath path {
  stroke: ${colors.accent};
  stroke-width: 3px;
}

.mermaid .edgeLabel {
  background-color: ${colors.dark}80;
  color: ${colors.light};
}
    `;
  }

  /**
   * Generate Google Slides CSS
   */
  generateGoogleSlidesCSS() {
    const colors = this.getColorPalette();
    
    return `
/* Google Slides RinaWarp Mermaid Theme */
.slide {
  background: ${colors.dark};
  color: white;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
}

.slide .title {
  color: ${colors.primary};
  font-size: 48px;
  font-weight: bold;
  text-shadow: 0 0 20px ${colors.neon};
}

.slide .subtitle {
  color: ${colors.secondary};
  font-size: 32px;
  font-weight: 600;
}

.slide .content {
  color: ${colors.light};
  font-size: 24px;
  line-height: 1.6;
}

.slide .highlight {
  background: linear-gradient(45deg, ${colors.primary}, ${colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}

.slide .bullet {
  color: ${colors.accent};
  font-size: 20px;
  margin: 15px 0;
}

.slide .cta {
  background: ${colors.holographic};
  color: ${colors.dark};
  padding: 15px 30px;
  border-radius: 25px;
  font-weight: bold;
  text-align: center;
}
    `;
  }

  /**
   * Generate brand elements
   */
  generateBrandElements() {
    return {
      logo: 'RinaWarp Technologies™',
      symbol: this.currentTheme.symbols.infinity,
      tagline: 'Digital Empowerment Simplified',
      colors: this.getColorPalette(),
      fonts: this.getFonts(),
      style: this.currentTheme.style
    };
  }

  /**
   * Apply theme to content
   */
  applyThemeToContent(content, type = 'markdown') {
    const brandElements = this.generateBrandElements();
    
    // Add theme-specific formatting
    const themedContent = content
      // Add infinity symbols to headers
      .replace(/^# (.+)$/gm, `# ${brandElements.symbol} $1 ${brandElements.symbol}`)
      // Add holographic class to highlights
      .replace(/\*\*(.+?)\*\*/g, '<span class="highlight">$1</span>')
      // Add neon class to emoji
      .replace(/[⚡🎯🚀✨💎🔥🌟💫⭐🎉🎊]/g, '<span class="neon-text">$&</span>');
    
    return themedContent;
  }

  /**
   * Generate slide background configuration
   */
  generateSlideBackgrounds() {
    const colors = this.getColorPalette();
    
    return {
      primary: {
        type: 'gradient',
        value: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30, ${colors.accent}30)`,
        overlay: `${colors.dark}80`
      },
      accent: {
        type: 'solid',
        value: colors.dark,
        overlay: `${colors.primary}20`
      },
      holographic: {
        type: 'custom',
        value: colors.holographic,
        overlay: `${colors.dark}60`
      }
    };
  }

  /**
   * Get theme information
   */
  getThemeInfo() {
    return {
      name: this.currentTheme.name,
      description: this.currentTheme.description,
      colors: this.getColorPalette(),
      fonts: this.getFonts(),
      style: this.currentTheme.style,
      symbols: this.currentTheme.symbols
    };
  }

  /**
   * Validate theme compatibility
   */
  validateTheme() {
    const required = ['colors', 'fonts', 'style', 'symbols'];
    const missing = required.filter(key => !this.currentTheme[key]);
    
    if (missing.length > 0) {
      throw new Error(`Theme validation failed. Missing: ${missing.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Create theme variations
   */
  createVariations() {
    const baseTheme = this.currentTheme;
    const variations = {};
    
    // Light mode variant
    variations.light = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        dark: '#ffffff',
        light: '#1f2937',
        holographic: `linear-gradient(45deg, ${baseTheme.colors.primary}60, ${baseTheme.colors.accent}60)`
      }
    };
    
    // Dark mode variant
    variations.dark = baseTheme;
    
    // Neon accent variant
    variations.neon = {
      ...baseTheme,
      style: {
        ...baseTheme.style,
        effects: [...baseTheme.style.effects, 'ultra-neon']
      }
    };
    
    return variations;
  }
}

module.exports = ThemeEngine;