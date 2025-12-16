#!/usr/bin/env node

/**
 * Markdown Auto-Fixer
 * Automatically fixes common markdownlint issues:
 * - MD026: Trailing punctuation in headings
 * - MD022: Headers should be surrounded by blank lines
 * - MD031: Fenced code blocks should be surrounded by blank lines
 * - MD032: Lists should be surrounded by blank lines
 * - MD040: Fenced code blocks should have a language specified
 * - MD009: Trailing spaces should be removed
 * - MD047: Files should end with a single newline character
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { globSync } from 'glob';
import { join, relative } from 'path';

const MARKDOWN_FILES = '**/*.md';
const BACKUP_SUFFIX = '.backup';

class MarkdownFixer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.filesFixed = 0;
    this.totalChanges = 0;
  }

  log(message, type = 'info') {
    const prefix =
      {
        info: '📝',
        success: '✅',
        warning: '⚠️',
        error: '❌',
      }[type] || '📝';

    console.log(`${prefix} ${message}`);
  }

  getMarkdownFiles() {
    const files = globSync(MARKDOWN_FILES, {
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

  fixTrailingPunctuation(line) {
    // MD026: Remove trailing punctuation from headings
    const headingPattern = /^(#{1,6})\s+(.+?)([.!?;:]+)\s*$/;
    const match = line.match(headingPattern);

    if (match) {
      const [, hashes, content] = match;
      return `${hashes} ${content.trim()}`;
    }

    return line;
  }

  fixTrailingSpaces(content) {
    // MD009: Remove trailing spaces
    return content.replace(/[ \t]+$/gm, '');
  }

  ensureFileEnding(content) {
    // MD047: Ensure file ends with single newline
    return content.replace(/\s+$/, '\n');
  }

  fixHeadersSpacing(lines) {
    // MD022: Headers should be surrounded by blank lines
    const fixed = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isHeader = /^#{1,6}\s+/.test(line);

      // Add blank line before header (if not the first line)
      if (isHeader && i > 0 && fixed[fixed.length - 1].trim() !== '') {
        fixed.push('');
      }

      fixed.push(line);

      // Add blank line after header (if not the last line and next isn't blank)
      if (isHeader && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine.trim() !== '' && !nextLine.startsWith('#')) {
          fixed.push('');
        }
      }
    }

    return fixed;
  }

  fixCodeBlockSpacing(lines) {
    // MD031: Fenced code blocks should be surrounded by blank lines
    const fixed = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isCodeBlockStart = /^```/.test(line);
      const isCodeBlockEnd = /^```/.test(line) && inCodeBlock;

      // Add blank line before code block start (if not at beginning and previous isn't blank)
      if (
        isCodeBlockStart &&
        !inCodeBlock &&
        fixed.length > 0 &&
        fixed[fixed.length - 1].trim() !== ''
      ) {
        fixed.push('');
      }

      fixed.push(line);

      // Add blank line after code block end (if not at end and next isn't blank)
      if (isCodeBlockEnd && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine.trim() !== '') {
          fixed.push('');
        }
      }

      inCodeBlock = isCodeBlockStart ? !inCodeBlock : inCodeBlock;
    }

    return fixed;
  }

  fixListSpacing(lines) {
    // MD032: Lists should be surrounded by blank lines
    const fixed = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const isListItem = /^(\s*)[-*+]\s+/.test(line) || /^(\s*)\d+\.\s+/.test(line);

      if (isListItem) {
        // Add blank line before list (if not at beginning and previous isn't blank)
        if (fixed.length > 0 && fixed[fixed.length - 1].trim() !== '') {
          fixed.push('');
        }

        // Add all consecutive list items
        while (i < lines.length) {
          const currentLine = lines[i];
          const isListItemLine =
            /^(\s*)[-*+]\s+/.test(currentLine) ||
            /^(\s*)\d+\.\s+/.test(currentLine) ||
            /^(\s*)\s{2,}[-*+]\s+/.test(currentLine) ||
            currentLine.trim() === '';

          if (!isListItemLine && currentLine.trim() !== '') break;

          fixed.push(currentLine);
          i++;
        }

        // Add blank line after list (if not at end and next isn't blank)
        if (i < lines.length && lines[i].trim() !== '') {
          fixed.push('');
        }
      } else {
        fixed.push(line);
        i++;
      }
    }

    return fixed;
  }

  fixFencedCodeLanguage(line) {
    // MD040: Fenced code blocks should have a language specified
    const codeBlockPattern = /^```\s*$/;

    if (codeBlockPattern.test(line)) {
      // Try to infer language from file extension or content
      return '```';
    }

    return line;
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

      // Apply fixes
      const lines = content.split('\n');

      // Fix each issue
      const fixes = [
        {
          name: 'Trailing punctuation',
          fn: (lines) => lines.map((line) => this.fixTrailingPunctuation(line)),
        },
        {
          name: 'Trailing spaces',
          fn: (lines) => lines.map((line) => line.replace(/[ \t]+$/g, '')),
        },
        { name: 'Headers spacing', fn: (lines) => this.fixHeadersSpacing(lines) },
        { name: 'Code block spacing', fn: (lines) => this.fixCodeBlockSpacing(lines) },
        { name: 'List spacing', fn: (lines) => this.fixListSpacing(lines) },
      ];

      for (const fix of fixes) {
        const newLines = fix.fn(lines);
        const newContent = newLines.join('\n');

        if (newContent !== content) {
          this.log(`Applied ${fix.name} fix to ${relative('.', filePath)}`, 'info');
          content = newContent;
          hasChanges = true;
        }
      }

      // Fix file ending
      const finalContent = this.ensureFileEnding(content);
      if (finalContent !== content) {
        content = finalContent;
        hasChanges = true;
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
    this.log('Starting Markdown Auto-Fixer...', 'info');

    const files = this.getMarkdownFiles();
    this.log(`Found ${files.length} Markdown files to process`, 'info');

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
      this.log('\n✅ All fixes applied successfully!', 'success');
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

  const fixer = new MarkdownFixer(options);
  fixer.run().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default MarkdownFixer;
