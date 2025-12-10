import { lazy } from 'react';

// Lazy load heavy components
export const LazyAppEnhanced = lazy(() => import('../AppEnhanced'));
export const LazyAdvancedTerminal = lazy(
  () => import('../terminal/AdvancedTerminal')
);
export const LazyTerminalComponents = lazy(
  () => import('./TerminalComponents')
);
export const LazyCommandPredictor = lazy(
  () => import('../ai/commandPredictor')
);
export const LazyCommandExplainer = lazy(
  () => import('../ai/commandExplainer')
);
export const LazyUpdateNotification = lazy(
  () => import('./UpdateNotification')
);

// Lazy load website components
export const LazyWebsiteApp = lazy(() => import('../website/App'));

// Lazy load theme components
export const LazyMermaidTheme = lazy(
  () => import('../themes/mermaid-enhanced')
);

// Note: Backend utilities are not available in frontend build
// These would be loaded dynamically in a full-stack environment

// Preload function for critical components
export const preloadCriticalComponents = () => {
  // Preload the most important components
  import('../terminal/AdvancedTerminal');
  import('./TerminalComponents');
  import('../ai/commandPredictor');
};

// Preload function for AI components
export const preloadAIComponents = () => {
  import('../ai/commandExplainer');
  // Backend modules are handled server-side
};

// Preload function for production components
export const preloadProductionComponents = () => {
  // Backend modules are handled server-side
};
