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
    success: '#00ff88',
    warning: '#ffd700',
    error: '#ff6b9d',
    info: '#00d4ff',
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
        0% { box-shadow: 0 0 5px #00d4ff, 0 0 10px #00d4ff, 0 0 15px #00d4ff; }
        50% { box-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff; }
        100% { box-shadow: 0 0 5px #00d4ff, 0 0 10px #00d4ff, 0 0 15px #00d4ff; }
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
      right: 30px;
      font-size: 24px;
      color: #4fc3f7;
      animation: float 15s infinite ease-in-out;
      opacity: 0.7;
    }
    
    /* Terminal text styling */
    .terminal .xterm {
      color: #e0f7ff;
      background: transparent;
    }
    
    .terminal .xterm-screen {
      background: transparent;
    }
    
    /* Command prompt styling */
    .terminal .xterm .xterm-cursor-layer .xterm-cursor {
      background-color: #00d4ff;
      box-shadow: 0 0 10px #00d4ff;
      animation: blink 1s infinite;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    /* Input field styling */
    .terminal input {
      background: rgba(0, 17, 34, 0.8);
      color: #e0f7ff;
      border: 2px solid #00d4ff;
      border-radius: 8px;
      padding: 8px 12px;
      font-family: 'Fira Code', monospace;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
      transition: all 0.3s ease;
    }
    
    .terminal input:focus {
      outline: none;
      box-shadow: 0 0 25px rgba(0, 212, 255, 0.6);
      border-color: #00ff88;
    }
    
    /* Button styling */
    .terminal button {
      background: linear-gradient(45deg, #00d4ff, #00ff88);
      color: #001122;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
    }
    
    .terminal button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 212, 255, 0.6);
      animation: glow 2s infinite;
    }
    
    /* Status indicators */
    .terminal .status-online {
      color: #00ff88;
      text-shadow: 0 0 10px #00ff88;
    }
    
    .terminal .status-offline {
      color: #ff6b9d;
      text-shadow: 0 0 10px #ff6b9d;
    }
    
    .terminal .status-loading {
      color: #ffd700;
      text-shadow: 0 0 10px #ffd700;
      animation: breathe 2s infinite;
    }
    
    /* Scrollbar styling */
    .terminal ::-webkit-scrollbar {
      width: 12px;
    }
    
    .terminal ::-webkit-scrollbar-track {
      background: rgba(0, 34, 68, 0.5);
      border-radius: 6px;
    }
    
    .terminal ::-webkit-scrollbar-thumb {
      background: linear-gradient(45deg, #00d4ff, #00ff88);
      border-radius: 6px;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }
    
    .terminal ::-webkit-scrollbar-thumb:hover {
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
    }
    
    /* Loading animation */
    .terminal .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(0, 212, 255, 0.3);
      border-radius: 50%;
      border-top-color: #00d4ff;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Glow effects for special elements */
    .terminal .glow {
      text-shadow: 0 0 10px currentColor;
      animation: glow 3s infinite;
    }
    
    /* Shimmer text effect */
    .terminal .shimmer {
      background: linear-gradient(90deg, #e0f7ff, #00d4ff, #e0f7ff);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2s infinite;
    }
    
    /* Wave effect for headers */
    .terminal .wave {
      position: relative;
      overflow: hidden;
    }
    
    .terminal .wave::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.4), transparent);
      animation: wave 3s infinite;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .terminal {
        font-size: 14px;
      }
      
      .terminal button {
        padding: 8px 16px;
        font-size: 14px;
      }
      
      .terminal input {
        padding: 6px 10px;
        font-size: 14px;
      }
    }
    
    /* Dark mode compatibility */
    @media (prefers-color-scheme: dark) {
      .terminal {
        filter: brightness(1.1);
      }
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
      .terminal {
        --primary-color: #00ffff;
        --secondary-color: #ff0080;
        --text-color: #ffffff;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .terminal * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
};

export default mermaidEnhancedTheme;
