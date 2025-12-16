#!/usr/bin/env node

/**
 * CSS Logical Properties Auto-Fixer
 * Converts physical CSS properties to logical equivalents for better i18n support:
 * - margin-top -> margin-block-start
 * - margin-right -> margin-inline-end
 * - margin-bottom -> margin-block-end
 * - margin-left -> margin-inline-start
 * - padding-top -> padding-block-start
 * - padding-right -> padding-inline-end
 * - padding-bottom -> padding-block-end
 * - padding-left -> padding-inline-start
 * - border-top -> border-block-start
 * - border-right -> border-inline-end
 * - border-bottom -> border-block-end
 * - border-left -> border-inline-start
 * - text-align: left -> text-align: start
 * - text-align: right -> text-align: end
 * - float: left -> float: inline-start
 * - float: right -> float: inline-end
 * - clear: left -> clear: inline-start
 * - clear: right -> clear: inline-end
 * - And many more logical property conversions
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { globSync } from 'glob';
import { relative } from 'path';

const CSS_FILES = '**/*.{css,scss,less}';
const BACKUP_SUFFIX = '.backup';

class CSSLogicalFixer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.filesFixed = 0;
    this.totalChanges = 0;
  }

  log(message, type = 'info') {
    const prefix =
      {
        info: '🎨',
        success: '✅',
        warning: '⚠️',
        error: '❌',
      }[type] || '🎨';

    console.log(`${prefix} ${message}`);
  }

  getCSSFiles() {
    const files = globSync(CSS_FILES, {
      ignore: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        'coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/node_modules/**',
      ],
    });
    return files.filter((file) => existsSync(file));
  }

  // Physical to logical property mappings
  getPropertyMappings() {
    return {
      // Margin and Padding
      'margin-top': 'margin-block-start',
      'margin-right': 'margin-inline-end',
      'margin-bottom': 'margin-block-end',
      'margin-left': 'margin-inline-start',
      'padding-top': 'padding-block-start',
      'padding-right': 'padding-inline-end',
      'padding-bottom': 'padding-block-end',
      'padding-left': 'padding-inline-start',

      // Border
      'border-top': 'border-block-start',
      'border-right': 'border-inline-end',
      'border-bottom': 'border-block-end',
      'border-left': 'border-inline-start',
      'border-top-width': 'border-block-start-width',
      'border-right-width': 'border-inline-end-width',
      'border-bottom-width': 'border-block-end-width',
      'border-left-width': 'border-inline-start-width',
      'border-top-color': 'border-block-start-color',
      'border-right-color': 'border-inline-end-color',
      'border-bottom-color': 'border-block-end-color',
      'border-left-color': 'border-inline-start-color',
      'border-top-style': 'border-block-start-style',
      'border-right-style': 'border-inline-end-style',
      'border-bottom-style': 'border-block-end-style',
      'border-left-style': 'border-inline-start-style',

      // Border-radius
      'border-top-left-radius': 'border-start-start-radius',
      'border-top-right-radius': 'border-start-end-radius',
      'border-bottom-left-radius': 'border-end-start-radius',
      'border-bottom-right-radius': 'border-end-end-radius',

      // Position
      top: 'inset-block-start',
      right: 'inset-inline-end',
      bottom: 'inset-block-end',
      left: 'inset-inline-start',

      // Width and Height
      'min-width': 'min-inline-size',
      'max-width': 'max-inline-size',
      'min-height': 'min-block-size',
      'max-height': 'max-block-size',

      // Float and Clear
      float: 'float',
      clear: 'clear',

      // Text alignment
      'text-align': 'text-align',

      // Resize
      resize: 'resize',

      // Background position
      'background-position': 'background-position',

      // Overflow
      overflow: 'overflow',
      'overflow-x': 'overflow-inline',
      'overflow-y': 'overflow-block',
    };
  }

  // Value mappings for logical properties
  getValueMappings() {
    return {
      'text-align': {
        left: 'start',
        right: 'end',
      },
      float: {
        left: 'inline-start',
        right: 'inline-end',
      },
      clear: {
        left: 'inline-start',
        right: 'inline-end',
      },
    };
  }

  fixCSSProperty(content) {
    const propertyMappings = this.getPropertyMappings();
    let fixed = content;

    // Replace physical properties with logical ones
    for (const [physical, logical] of Object.entries(propertyMappings)) {
      // Handle exact property matches
      const regex = new RegExp(`\\b${physical.replace('-', '\\\\-')}\\s*:`, 'gi');
      fixed = fixed.replace(regex, `${logical}:`);

      // Handle shorthand properties (margin, padding, border-radius)
      this.fixShorthandProperties(fixed, physical, logical);
    }

    return fixed;
  }

  fixShorthandProperties(content, property, logical) {
    // Handle margin and padding shorthands
    if (property.startsWith('margin-') || property.startsWith('padding-')) {
      const shorthand = property.split('-')[0]; // 'margin' or 'padding'
      const regex = new RegExp(`\\b${shorthand}\\s*:`, 'gi');

      // For now, don't auto-convert shorthands as they're complex
      // This could be enhanced to convert to logical shorthands
    }

    // Handle border-radius shorthands
    if (property.includes('border-') && property.includes('radius')) {
      const regex = new RegExp(`\\bborder-radius\\s*:`, 'gi');
      // For now, don't auto-convert border-radius as it's complex
    }

    return content;
  }

  fixCSSValues(content) {
    const valueMappings = this.getValueMappings();
    let fixed = content;

    // Fix values for properties that need value conversion
    for (const [property, valueMap] of Object.entries(valueMappings)) {
      for (const [physical, logical] of Object.entries(valueMap)) {
        // Match property: value patterns
        const regex = new RegExp(`\\b${property}\\s*:\\s*${physical}\\b`, 'gi');
        fixed = fixed.replace(regex, `${property}: ${logical}`);
      }
    }

    // Fix background-position values
    fixed = fixed.replace(/background-position:\s*left/gi, 'background-position: inline-start');
    fixed = fixed.replace(/background-position:\s*right/gi, 'background-position: inline-end');
    fixed = fixed.replace(/background-position:\s*top/gi, 'background-position: block-start');
    fixed = fixed.replace(/background-position:\s*bottom/gi, 'background-position: block-end');

    return fixed;
  }

  // Handle specific CSS patterns that need special attention
  fixSpecialPatterns(content) {
    let fixed = content;

    // Fix background-position with multiple values
    fixed = fixed.replace(/background-position:\s*(\w+)\s+(\w+)/gi, (match, val1, val2) => {
      const mappedVal1 = this.mapPositionValue(val1);
      const mappedVal2 = this.mapPositionValue(val2);
      return `background-position: ${mappedVal1} ${mappedVal2}`;
    });

    // Fix margin and padding with physical directions
    fixed = this.fixMarginPaddingShorthands(fixed);

    return fixed;
  }

  mapPositionValue(value) {
    const mapping = {
      left: 'inline-start',
      right: 'inline-end',
      top: 'block-start',
      bottom: 'block-end',
      center: 'center',
    };
    return mapping[value.toLowerCase()] || value;
  }

  fixMarginPaddingShorthands(content) {
    // This is a simplified approach - in practice, converting shorthands is complex
    // For now, we'll focus on individual properties

    // Convert individual margin/padding properties
    const mappings = {
      'margin-top': 'margin-block-start',
      'margin-right': 'margin-inline-end',
      'margin-bottom': 'margin-block-end',
      'margin-left': 'margin-inline-start',
      'padding-top': 'padding-block-start',
      'padding-right': 'padding-inline-end',
      'padding-bottom': 'padding-block-end',
      'padding-left': 'padding-inline-start',
    };

    for (const [physical, logical] of Object.entries(mappings)) {
      const regex = new RegExp(`\\b${physical}\\s*:`, 'gi');
      content = content.replace(regex, `${logical}:`);
    }

    return content;
  }

  fixFile(filePath) {
    if (!existsSync(filePath)) {
      this.log(`File not found: ${filePath}`, 'warning');
      return false;
    }

    try {
      const originalContent = readFileSync(filePath, 'utf8');
      let content = originalContent;
      let hasChanges = false;

      // Store backup for dry run comparison
      if (this.dryRun) {
        const backupPath = filePath + BACKUP_SUFFIX;
        writeFileSync(backupPath, content);
      }

      // Apply fixes in sequence
      const fixes = [
        { name: 'CSS Properties', fn: (content) => this.fixCSSProperty(content) },
        { name: 'CSS Values', fn: (content) => this.fixCSSValues(content) },
        { name: 'Special Patterns', fn: (content) => this.fixSpecialPatterns(content) },
      ];

      for (const fix of fixes) {
        const newContent = fix.fn(content);

        if (newContent !== content) {
          this.log(`Applied ${fix.name} fix to ${relative('.', filePath)}`, 'info');
          content = newContent;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        this.filesFixed++;
        this.totalChanges++;

        if (this.dryRun) {
          this.log(`Would fix: ${relative('.', filePath)} (dry run)`, 'success');
        } else {
          writeFileSync(filePath, content, 'utf8');
          this.log(`Fixed: ${relative('.', filePath)}`, 'success');
        }
      } else if (this.verbose) {
        this.log(`No changes needed: ${relative('.', filePath)}`, 'info');
      }

      return hasChanges;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('Starting CSS Logical Properties Auto-Fixer...', 'info');

    const files = this.getCSSFiles();
    this.log(`Found ${files.length} CSS files to process`, 'info');

    for (const file of files) {
      this.fixFile(file);
    }

    this.log(`\n🎯 Results:`, 'info');
    this.log(`- Files processed: ${files.length}`, 'info');
    this.log(`- Files fixed: ${this.filesFixed}`, 'success');
    this.log(`- Total changes: ${this.totalChanges}`, 'success');

    if (this.dryRun) {
      this.log(
        '\n📋 Dry run completed. Review changes and run without --dry-run to apply.',
        'warning',
      );
      this.log('Backup files created with .backup suffix for comparison.', 'info');
    } else {
      this.log('\n✅ All CSS fixes applied successfully!', 'success');
      this.log(
        '\n💡 Note: Some CSS features may need manual review for optimal logical property conversion.',
        'info',
      );
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  const fixer = new CSSLogicalFixer(options);
  fixer.run().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default CSSLogicalFixer;
