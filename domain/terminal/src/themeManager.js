import { themes } from './themes';
import {
  mermaidEnhancedTheme,
  applyMermaidEnhancedTheme,
} from './themes/mermaid-enhanced';

export function applyTheme(name = 'mermaid') {
  if (name === 'mermaid-enhanced') {
    applyMermaidEnhancedTheme();
    localStorage.setItem('theme', name);
    return;
  }

  const theme = themes[name] || themes.mermaid;
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  localStorage.setItem('theme', name);
}

export function initTheme() {
  const saved = localStorage.getItem('theme') || 'mermaid';
  applyTheme(saved);
}
