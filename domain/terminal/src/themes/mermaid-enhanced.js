// Enhanced Mermaid Underwater Theme
// Beautiful deep ocean theme with glowing effects and animations

export const mermaidEnhancedTheme = {
  name: 'Mermaid Enhanced',
  description:
    'Stunning underwater theme with glowing effects and ocean animations',

  colors: {
    // Primary ocean colors
    primary: '#00d4ff', // Bright cyan
    secondary: '#ff6b9d', // Coral pink
    accent: '#00ff88', // Sea green
    highlight: '#ffd700', // Golden yellow

    // Background gradients
    bgPrimary: '#001122', // Deep ocean blue
    bgSecondary: '#002244', // Darker ocean
    bgTertiary: '#003366', // Mid ocean

    // Text colors
    textPrimary: '#e0f7ff', // Light cyan
    textSecondary: '#b3e5fc', // Medium cyan
    textMuted: '#81d4fa', // Muted cyan

    // Special effects
    glow: '#00d4ff',
    shimmer: '#ffffff',
    bubble: '#4fc3f7',

    // Status colors
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },

  gradients: {
    ocean: 'linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%)',
    coral: 'linear-gradient(45deg, #ff6b9d 0%, #ff8a80 100%)',
    seaweed: 'linear-gradient(90deg, #00ff88 0%, #4caf50 100%)',
    bubbles:
      'radial-gradient(circle at 30% 20%, rgba(79, 195, 247, 0.3) 0%, transparent 50%)',
  },

  animations: {
    // Floating animation for bubbles
    float: `
      @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
        100% { transform: translateY(0px) rotate(360deg); }
      }
    `,

    // Glowing pulse effect
    glow: `
      @keyframes glow {
        0% { box-shadow: 0 0 5px var(--glow), 0 0 10px var(--glow), 0 0 15px var(--glow); }
        50% { box-shadow: 0 0 10px var(--glow), 0 0 20px var(--glow), 0 0 30px var(--glow); }
        100% { box-shadow: 0 0 5px var(--glow), 0 0 10px var(--glow), 0 0 15px var(--glow); }
      }
    `,

    // Shimmer effect for text
    shimmer: `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,

    // Wave animation
    wave: `
      @keyframes wave {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `,

    // Breathing effect
    breathe: `
      @keyframes breathe {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `,

    // Ripple effect
    ripple: `
      @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
      }
    `,
  },

  styles: `
    /* Enhanced Mermaid Theme Styles */
    :root {
      --primary-color: #00d4ff;
      --secondary-color: #ff6b9d;
      --accent-color: #00ff88;
      --highlight-color: #ffd700;
      --bg-color: #001122;
      --text-color: #e0f7ff;
      --glow: #00d4ff;
      --shimmer: #ffffff;
      --bubble: #4fc3f7;
    }
    
    /* Ocean background with animated bubbles */
    .terminal {
      background: linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%);
      position: relative;
      overflow: hidden;
    }
    
    .terminal::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 50%, rgba(79, 195, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255, 107, 157, 0.1) 0%, transparent 50%);
      animation: float 20s infinite linear;
      pointer-events: none;
    }
    
    /* Animated bubbles */
    .terminal::after {
      content: '🫧';
      position: absolute;
      top: 20px;
      left: 10%;
      font-size: 20px;
      animation: float 15s infinite ease-in-out;
      opacity: 0.6;
    }
    
    /* Terminal header with glow effect */
    .terminal-header {
      background: linear-gradient(90deg, 
        rgba(0, 212, 255, 0.1) 0%, 
        rgba(255, 107, 157, 0.1) 50%, 
        rgba(0, 255, 136, 0.1) 100%);
      border: 2px solid var(--primary-color);
      border-radius: 15px;
      box-shadow: 
        0 0 20px rgba(0, 212, 255, 0.3),
        inset 0 0 20px rgba(0, 212, 255, 0.1);
      animation: glow 3s ease-in-out infinite;
      position: relative;
      overflow: hidden;
    }
    
    .terminal-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.2), 
        transparent);
      animation: shimmer 3s infinite;
    }
    
    /* Glowing title */
    .terminal-header h2 {
      text-shadow: 
        0 0 10px var(--glow),
        0 0 20px var(--glow),
        0 0 30px var(--glow);
      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color), var(--accent-color));
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2s ease-in-out infinite;
    }
    
    /* Logs with underwater effect */
    .logs {
      background: rgba(0, 17, 34, 0.8);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 10px;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 0 30px rgba(0, 212, 255, 0.2),
        inset 0 0 30px rgba(0, 212, 255, 0.1);
    }
    
    /* Input bar with coral glow */
    .input-bar {
      background: linear-gradient(90deg, 
        rgba(255, 107, 157, 0.1) 0%, 
        rgba(0, 255, 136, 0.1) 100%);
      border: 2px solid var(--secondary-color);
      border-radius: 25px;
      box-shadow: 
        0 0 15px rgba(255, 107, 157, 0.4),
        inset 0 0 15px rgba(255, 107, 157, 0.1);
      animation: breathe 4s ease-in-out infinite;
    }
    
    .input-bar input {
      background: transparent;
      color: var(--text-color);
      text-shadow: 0 0 5px var(--glow);
    }
    
    .input-bar input::placeholder {
      color: rgba(224, 247, 255, 0.6);
      text-shadow: 0 0 3px var(--glow);
    }
    
    /* Command suggestions with bubble effect */
    .suggestions-dropdown {
      background: rgba(0, 17, 34, 0.95);
      border: 2px solid var(--accent-color);
      border-radius: 15px;
      backdrop-filter: blur(15px);
      box-shadow: 
        0 0 25px rgba(0, 255, 136, 0.4),
        inset 0 0 25px rgba(0, 255, 136, 0.1);
    }
    
    .suggestion-item {
      transition: all 0.3s ease;
      border-radius: 10px;
      margin: 2px;
    }
    
    .suggestion-item:hover {
      background: rgba(0, 255, 136, 0.2);
      transform: translateX(5px);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }
    
    .suggestion-item.selected {
      background: linear-gradient(45deg, var(--accent-color), var(--primary-color));
      color: var(--bg-color);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      transform: scale(1.02);
    }
    
    /* Buttons with ocean wave effect */
    button, .btn {
      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
      border: none;
      border-radius: 20px;
      color: var(--bg-color);
      font-weight: bold;
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      box-shadow:
        0 4px 15px rgba(0, 212, 255, 0.3),
        inset 0 0 10px rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      min-height: 44px;
      padding: 12px 24px;
      cursor: pointer;
    }
    
    button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.3), 
        transparent);
      transition: left 0.5s ease;
    }
    
    button:hover, .btn:hover {
      transform: translateY(-2px);
      box-shadow:
        0 6px 20px rgba(0, 212, 255, 0.4),
        inset 0 0 15px rgba(255, 255, 255, 0.3);
      filter: brightness(1.1);
    }
    
    button:hover::before {
      left: 100%;
    }
    
    button:active, .btn:active {
      transform: translateY(0) scale(0.98);
      box-shadow:
        0 2px 10px rgba(0, 212, 255, 0.3),
        inset 0 0 10px rgba(0, 0, 0, 0.2);
    }
    
    /* Stats cards with floating effect */
    .stat-card {
      background: rgba(0, 17, 34, 0.8);
      border: 2px solid var(--primary-color);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 
        0 0 20px rgba(0, 212, 255, 0.3),
        inset 0 0 20px rgba(0, 212, 255, 0.1);
      transition: all 0.3s ease;
      animation: float 6s ease-in-out infinite;
    }
    
    .stat-card:nth-child(2) {
      animation-delay: -2s;
    }
    
    .stat-card:nth-child(3) {
      animation-delay: -4s;
    }
    
    .stat-card:hover {
      transform: translateY(-10px) scale(1.05);
      box-shadow: 
        0 0 30px rgba(0, 212, 255, 0.5),
        inset 0 0 30px rgba(0, 212, 255, 0.2);
    }
    
    /* Theme selector with coral glow */
    .theme-selector {
      background: linear-gradient(135deg, 
        rgba(255, 107, 157, 0.1) 0%, 
        rgba(0, 255, 136, 0.1) 100%);
      border: 2px solid var(--secondary-color);
      border-radius: 20px;
      box-shadow: 
        0 0 25px rgba(255, 107, 157, 0.3),
        inset 0 0 25px rgba(255, 107, 157, 0.1);
    }
    
    /* Scrollbar styling */
    .logs::-webkit-scrollbar {
      width: 8px;
    }
    
    .logs::-webkit-scrollbar-track {
      background: rgba(0, 17, 34, 0.5);
      border-radius: 4px;
    }
    
    .logs::-webkit-scrollbar-thumb {
      background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
      border-radius: 4px;
      box-shadow: 0 0 5px var(--glow);
    }
    
    .logs::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(45deg, var(--accent-color), var(--secondary-color));
      box-shadow: 0 0 10px var(--glow);
    }
    
    /* Ripple effect for clicks */
    .ripple {
      position: relative;
      overflow: hidden;
    }
    
    .ripple::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      animation: ripple 0.6s ease-out;
    }
    
    /* Loading animation */
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0, 212, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .terminal-header h2 {
        font-size: 1.5rem;
      }
      
      .stat-card {
        margin: 10px 0;
      }
      
      .suggestions-dropdown {
        max-height: 150px;
      }
    }
  `,
};

// Apply the enhanced Mermaid theme
export function applyMermaidEnhancedTheme() {
  // Remove existing theme styles
  const existingTheme = document.getElementById('mermaid-enhanced-theme');
  if (existingTheme) {
    existingTheme.remove();
  }

  // Create new style element
  const style = document.createElement('style');
  style.id = 'mermaid-enhanced-theme';
  style.textContent = mermaidEnhancedTheme.styles;
  document.head.appendChild(style);

  // Apply CSS variables
  const root = document.documentElement;
  Object.entries(mermaidEnhancedTheme.colors).forEach(([key, value]) => {
    root.style.setProperty(
      `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
      value
    );
  });

  // Add floating bubbles animation
  addFloatingBubbles();

  console.log('🌊 Enhanced Mermaid theme applied with ocean animations!');
}

// Add floating bubbles effect
function addFloatingBubbles() {
  const terminal = document.querySelector('.terminal');
  if (!terminal) return;

  // Create bubble container
  const bubbleContainer = document.createElement('div');
  bubbleContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  `;

  // Create multiple bubbles
  for (let i = 0; i < 15; i++) {
    const bubble = document.createElement('div');
    bubble.innerHTML = '🫧';
    bubble.style.cssText = `
      position: absolute;
      font-size: ${Math.random() * 20 + 10}px;
      left: ${Math.random() * 100}%;
      bottom: -50px;
      animation: float ${Math.random() * 10 + 10}s infinite linear;
      animation-delay: ${Math.random() * 5}s;
      opacity: ${Math.random() * 0.5 + 0.3};
      color: var(--bubble);
      text-shadow: 0 0 10px var(--glow);
    `;
    bubbleContainer.appendChild(bubble);
  }

  terminal.appendChild(bubbleContainer);
}

export default mermaidEnhancedTheme;
