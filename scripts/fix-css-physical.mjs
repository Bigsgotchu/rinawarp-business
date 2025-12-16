#!/usr/bin/env node

/**
 * CSS Physical Properties Normalizer
 * Converts logical CSS properties back to physical equivalents for legal HTMLs:
 * - margin-block-start → margin-top
 * - margin-inline-end → margin-right
 * - margin-block-end → margin-bottom
 * - margin-inline-start → margin-left
 * - padding-block-start → padding-top
 * - padding-inline-end → padding-right
 * - padding-block-end → padding-bottom
 * - padding-inline-start → padding-left
 * - border-block-start → border-top
 * - border-inline-end → border-right
 * - border-block-end → border-bottom
 * - border-inline-start → border-left
 * - text-align: start → text-align: left
 * - text-align: end → text-align: right
 * - float: inline-start → float: left
 * - float: inline-end → float: right
 * - clear: inline-start → clear: left
 * - clear: inline-end → clear: right
 * - And many more physical property conversions
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { globSync } from 'glob';
import { relative } from 'path';

const CSS_FILES = '**/*.{css,scss,less}';
const BACKUP_SUFFIX = '.backup';

class CSSPhysicalFixer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.filesFixed = 0;
    this.totalChanges = 0;
  }

  log(message, type = 'info') {
    const prefix =
      {
        info: '⚖️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
      }[type] || '⚖️';

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

  // Logical to physical property mappings
  getPropertyMappings() {
    return {
      // Margin and Padding
      'margin-block-start': 'margin-top',
      'margin-inline-end': 'margin-right',
      'margin-block-end': 'margin-bottom',
      'margin-inline-start': 'margin-left',
      'padding-block-start': 'padding-top',
      'padding-inline-end': 'padding-right',
      'padding-block-end': 'padding-bottom',
      'padding-inline-start': 'padding-left',

      // Border
      'border-block-start': 'border-top',
      'border-inline-end': 'border-right',
      'border-block-end': 'border-bottom',
      'border-inline-start': 'border-left',
      'border-block-start-width': 'border-top-width',
      'border-inline-end-width': 'border-right-width',
      'border-block-end-width': 'border-bottom-width',
      'border-inline-start-width': 'border-left-width',
      'border-block-start-color': 'border-top-color',
      'border-inline-end-color': 'border-right-color',
      'border-block-end-color': 'border-bottom-color',
      'border-inline-start-color': 'border-left-color',
      'border-block-start-style': 'border-top-style',
      'border-inline-end-style': 'border-right-style',
      'border-block-end-style': 'border-bottom-style',
      'border-inline-start-style': 'border-left-style',

      // Border-radius
      'border-start-start-radius': 'border-top-left-radius',
      'border-start-end-radius': 'border-top-right-radius',
      'border-end-start-radius': 'border-bottom-left-radius',
      'border-end-end-radius': 'border-bottom-right-radius',

      // Position
      'inset-block-start': 'top',
      'inset-inline-end': 'right',
      'inset-block-end': 'bottom',
      'inset-inline-start': 'left',

      // Width and Height
      'min-inline-size': 'min-width',
      'max-inline-size': 'max-width',
      'min-block-size': 'min-height',
      'max-block-size': 'max-height',

      // Background position
      'background-position-inline': 'background-position-x',
      'background-position-block': 'background-position-y',
    };
  }

  // Value mappings for logical to physical conversion
  getValueMappings() {
    return {
      'text-align': {
        start: 'left',
        end: 'right',
      },
      float: {
        'inline-start': 'left',
        'inline-end': 'right',
      },
      clear: {
        'inline-start': 'left',
        'inline-end': 'right',
      },
      resize: {
        inline: 'horizontal',
        block: 'vertical',
      },
      overflow: {
        inline: 'auto',
        block: 'auto',
      },
    };
  }

  fixCSSProperty(content) {
    const propertyMappings = this.getPropertyMappings();
    let fixed = content;

    // Replace logical properties with physical ones
    for (const [logical, physical] of Object.entries(propertyMappings)) {
      // Handle exact property matches
      const regex = new RegExp(`\\b${logical.replace('-', '\\\\-')}\\s*:`, 'gi');
      fixed = fixed.replace(regex, `${physical}:`);

      // Handle shorthand properties (margin, padding, border-radius)
      this.fixShorthandProperties(fixed, logical, physical);
    }

    return fixed;
  }

  fixShorthandProperties(content, logicalProperty, physicalProperty) {
    // Handle margin and padding shorthands
    if (logicalProperty.startsWith('margin-') || logicalProperty.startsWith('padding-')) {
      const shorthand = logicalProperty.split('-')[0]; // 'margin' or 'padding'
      const regex = new RegExp(`\\b${shorthand}\\s*:`, 'gi');
      // For now, don't auto-convert shorthands as they're complex
      // This could be enhanced to convert to physical shorthands
    }

    // Handle border-radius shorthands
    if (logicalProperty.includes('border-') && logicalProperty.includes('radius')) {
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
      for (const [logical, physical] of Object.entries(valueMap)) {
        // Match property: value patterns
        const regex = new RegExp(`\\b${property}\\s*:\\s*${logical}\\b`, 'gi');
        fixed = fixed.replace(regex, `${property}: ${physical}`);
      }
    }

    // Fix background-position values
    fixed = fixed.replace(/background-position:\s*inline-start/gi, 'background-position: left');
    fixed = fixed.replace(/background-position:\s*inline-end/gi, 'background-position: right');
    fixed = fixed.replace(/background-position:\s*block-start/gi, 'background-position: top');
    fixed = fixed.replace(/background-position:\s*block-end/gi, 'background-position: bottom');

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

    // Fix margin and padding with logical directions
    fixed = this.fixMarginPaddingShorthands(fixed);

    return fixed;
  }

  mapPositionValue(value) {
    const mapping = {
      'inline-start': 'left',
      'inline-end': 'right',
      'block-start': 'top',
      'block-end': 'bottom',
      center: 'center',
    };
    return mapping[value.toLowerCase()] || value;
  }

  fixMarginPaddingShorthands(content) {
    // This is a simplified approach - in practice, converting shorthands is complex
    // For now, we'll focus on individual properties

    // Convert individual margin/padding logical properties
    const mappings = {
      'margin-block-start': 'margin-top',
      'margin-inline-end': 'margin-right',
      'margin-block-end': 'margin-bottom',
      'margin-inline-start': 'margin-left',
      'padding-block-start': 'padding-top',
      'padding-inline-end': 'padding-right',
      'padding-block-end': 'padding-bottom',
      'padding-inline-start': 'padding-left',
    };

    for (const [logical, physical] of Object.entries(mappings)) {
      const regex = new RegExp(`\\b${logical}\\s*:`, 'gi');
      content = content.replace(regex, `${physical}:`);
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
    this.log('Starting CSS Physical Properties Normalizer...', 'info');

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
      this.log('\n✅ All CSS physical fixes applied successfully!', 'success');
      this.log(
        '\n💡 Note: This normalizer converts logical properties to physical ones for legal HTML compliance.',
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

  const fixer = new CSSPhysicalFixer(options);
  fixer.run().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default CSSPhysicalFixer;
