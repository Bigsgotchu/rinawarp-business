/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'rinawarp-primary': '#00d4ff',
        'rinawarp-secondary': '#ff6b9d',
        'rinawarp-accent': '#00ff88',
        'rinawarp-highlight': '#ffd700',
        'mermaid-ocean': '#001122',
        'mermaid-cyan': '#00d4ff',
        'mermaid-coral': '#ff6b9d',
        'mermaid-seaweed': '#00ff88',
        'mermaid-text': '#e0f7ff',
      },
      fontFamily: {
        terminal: ['JetBrains Mono', 'Fira Code', 'monospace'],
        mermaid: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 212, 255, 0.3)',
        'coral-glow': '0 0 20px rgba(255, 107, 157, 0.3)',
        'seaweed-glow': '0 0 20px rgba(0, 255, 136, 0.3)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
