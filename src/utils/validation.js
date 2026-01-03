/**
 * Validation utilities for Kilo presentation system
 */

/**
 * Validate presentation configuration
 * @param {Object} config - Configuration object
 * @returns {Object} - Validated configuration
 */
function validateConfig(config) {
  const errors = [];
  
  // Required fields
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.audience || config.audience.trim() === '') {
    errors.push('Audience is required');
  }
  
  if (!config.sections || config.sections.length === 0) {
    errors.push('At least one section is required');
  }
  
  // Validate sections
  if (config.sections && config.sections.length > 50) {
    errors.push('Maximum 50 sections allowed');
  }
  
  // Validate A/B variants
  if (config.abVariants && (config.abVariants < 1 || config.abVariants > 10)) {
    errors.push('A/B variants must be between 1 and 10');
  }
  
  // Validate export formats
  const validFormats = ['google-slides', 'pptx', 'canva', 'pdf'];
  if (config.export) {
    const invalidFormats = config.export.filter(format => !validFormats.includes(format));
    if (invalidFormats.length > 0) {
      errors.push(`Invalid export formats: ${invalidFormats.join(', ')}`);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return config;
}

/**
 * Validate theme configuration
 * @param {string} theme - Theme name
 * @returns {Object} - Theme configuration
 */
function validateTheme(theme) {
  const validThemes = {
    'RinaWarp Mermaid': {
      colors: ['hot-pink', 'coral', 'teal', 'baby-blue', 'black'],
      fonts: ['Poppins', 'Montserrat', 'Exo 2'],
      style: 'neon-mermaid'
    },
    'Corporate Blue': {
      colors: ['navy', 'light-blue', 'white', 'gray'],
      fonts: ['Arial', 'Helvetica', 'sans-serif'],
      style: 'professional'
    },
    'Tech Gradient': {
      colors: ['purple', 'blue', 'cyan', 'white'],
      fonts: ['Roboto', 'Open Sans', 'sans-serif'],
      style: 'tech'
    }
  };
  
  if (!validThemes[theme]) {
    throw new Error(`Invalid theme: ${theme}. Available themes: ${Object.keys(validThemes).join(', ')}`);
  }
  
  return validThemes[theme];
}

/**
 * Sanitize filename
 * @param {string} filename - Raw filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9\-_]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
    .trim();
}

/**
 * Validate section name
 * @param {string} section - Section name
 * @returns {boolean} - Is valid section name
 */
function isValidSection(section) {
  const maxLength = 100;
  return section && section.trim().length > 0 && section.length <= maxLength;
}

module.exports = {
  validateConfig,
  validateTheme,
  sanitizeFilename,
  isValidSection
};