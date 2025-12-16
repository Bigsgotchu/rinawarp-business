import { lintPrompt } from '../commands/lintPrompt.js';
import { describe, it, expect, vi } from 'vitest';

describe('RW Prompt Linter', () => {
  it('should detect short prompts', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    lintPrompt('short');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Prompt is too short'));
    consoleSpy.mockRestore();
  });

  it('should detect missing punctuation', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    lintPrompt('This prompt has no punctuation');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Prompt has no clear end punctuation'),
    );
    consoleSpy.mockRestore();
  });

  it('should detect merged tasks', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    lintPrompt('fix the build and also deploy it');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Contains merged tasks'));
    consoleSpy.mockRestore();
  });

  it('should detect mixed repair and build tasks', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    lintPrompt('fix the bug and build the feature');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Mixing repair and build tasks'),
    );
    consoleSpy.mockRestore();
  });

  it('should detect very long prompts', () => {
    const longPrompt = 'word '.repeat(80).trim(); // Create prompt with 80 words to exceed 70-word limit
    const consoleSpy = vi.spyOn(console, 'log');
    lintPrompt(longPrompt);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Prompt is very long'));
    consoleSpy.mockRestore();
  });

  it('should pass clean prompts', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    lintPrompt('This is a clean prompt with proper punctuation.');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Prompt is clean and safe'));
    consoleSpy.mockRestore();
  });
});
