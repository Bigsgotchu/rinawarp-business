// Tailwind-powered Terminal Components
// Reusable components with utility-first styling

import React from 'react';

// Terminal Header Component
export function TerminalHeader({ title, subtitle, children, className = '' }) {
  return (
    <div
      className={`bg-gradient-to-r from-mermaid-cyan/10 via-mermaid-coral/10 to-mermaid-seaweed/10 
                     border-2 border-mermaid-cyan rounded-2xl shadow-glow animate-glow 
                     relative overflow-hidden ${className}`}
    >
      {/* Shimmer effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-shimmer animate-shimmer opacity-20"></div>

      <div className="relative z-10 p-6">
        <h2
          className="text-3xl font-bold bg-gradient-to-r from-mermaid-cyan via-mermaid-coral to-mermaid-seaweed 
                       bg-clip-text text-transparent animate-shimmer text-shadow-glow"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-mermaid-cyan/80 mt-2 text-lg">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}

// Terminal Logs Component
export function TerminalLogs({ logs, className = '' }) {
  return (
    <div
      className={`bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 
                     rounded-xl shadow-glow overflow-y-auto max-h-96 ${className}`}
    >
      <div className="p-4 space-y-1">
        {logs.map((line, i) => (
          <div
            key={i}
            className="text-mermaid-text font-mono text-sm leading-relaxed"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

// Input Bar Component
export function TerminalInput({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Type a command...',
  suggestions = [],
  showSuggestions = false,
  selectedSuggestion = 0,
  onSuggestionSelect,
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="bg-gradient-to-r from-mermaid-coral/10 to-mermaid-seaweed/10 
                      border-2 border-mermaid-coral rounded-full shadow-coral-glow 
                      animate-breathe flex items-center px-6 py-3"
      >
        <span className="text-mermaid-cyan mr-3 text-lg font-bold">&gt;</span>
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent text-mermaid-text font-mono
                     placeholder-mermaid-cyan/60 focus:outline-none text-shadow-glow"
          placeholder={placeholder}
          autoFocus
          aria-label="Terminal command input"
          aria-describedby="suggestions"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full left-6 right-0 mt-2 bg-mermaid-ocean/95
                        border-2 border-mermaid-seaweed rounded-2xl shadow-seaweed-glow
                        backdrop-blur-lg max-h-48 overflow-y-auto z-50"
          role="listbox"
          aria-label="Command suggestions"
          id="suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => onSuggestionSelect?.(index)}
              className={`p-4 cursor-pointer transition-all duration-300 rounded-xl mx-2 my-1
                         ${
            index === selectedSuggestion
              ? 'bg-gradient-to-r from-mermaid-seaweed to-mermaid-cyan text-mermaid-ocean scale-105 shadow-seaweed-glow'
              : 'hover:bg-mermaid-seaweed/20 hover:translate-x-2 hover:shadow-seaweed-glow/30'
            }`}
              role="option"
              aria-selected={index === selectedSuggestion}
            >
              <div className="font-bold text-sm mb-1">{suggestion.command}</div>
              <div className="text-xs opacity-80">{suggestion.explanation}</div>
              <div className="text-xs opacity-60 mt-1">
                Confidence: {suggestion.confidence}/10 • {suggestion.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stat Card Component
export function StatCard({
  title,
  value,
  unit,
  icon,
  color = 'cyan',
  className = '',
}) {
  const colorClasses = {
    cyan: 'border-mermaid-cyan shadow-glow',
    coral: 'border-mermaid-coral shadow-coral-glow',
    seaweed: 'border-mermaid-seaweed shadow-seaweed-glow',
    gold: 'border-mermaid-gold shadow-glow',
  };

  return (
    <div
      className={`bg-mermaid-ocean/80 backdrop-blur-md border-2 ${colorClasses[color]} 
                     rounded-2xl p-6 text-center transition-all duration-300 
                     hover:scale-105 hover:shadow-glow-lg animate-float ${className}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-mermaid-cyan font-bold text-lg mb-2">{title}</h3>
      <div className="text-4xl font-bold text-mermaid-gold mb-1">
        {value}
        {unit && <span className="text-xl text-mermaid-text/80">{unit}</span>}
      </div>
    </div>
  );
}

// Button Component
export function TerminalButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}) {
  const variants = {
    primary:
      'bg-gradient-to-r from-mermaid-cyan to-mermaid-coral text-mermaid-ocean',
    secondary:
      'bg-gradient-to-r from-mermaid-seaweed to-mermaid-cyan text-mermaid-ocean',
    accent:
      'bg-gradient-to-r from-mermaid-gold to-mermaid-coral text-mermaid-ocean',
    ghost:
      'bg-transparent border-2 border-mermaid-cyan text-mermaid-cyan hover:bg-mermaid-cyan/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} font-bold rounded-2xl 
                  shadow-glow hover:shadow-glow-lg transition-all duration-300 
                  hover:scale-105 active:scale-95 relative overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${className}`}
    >
      {/* Shimmer effect */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-shimmer animate-shimmer opacity-0 
                      hover:opacity-30 transition-opacity duration-300"
      ></div>
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// Theme Selector Component
export function ThemeSelector({ currentTheme, onThemeChange, className = '' }) {
  const themes = [
    { id: 'mermaid', name: 'Mermaid', icon: '🧜‍♀️' },
    { id: 'mermaid-enhanced', name: '🌊 Mermaid Enhanced', icon: '🌊' },
    { id: 'racecar', name: 'Racecar', icon: '🏎️' },
  ];

  return (
    <div
      className={`bg-gradient-to-br from-mermaid-coral/10 to-mermaid-seaweed/10 
                     border-2 border-mermaid-coral rounded-2xl p-6 shadow-coral-glow ${className}`}
    >
      <h3 className="text-mermaid-text text-xl font-bold text-center mb-4">
        Choose Your Theme
      </h3>
      <div className="flex gap-4 justify-center flex-wrap">
        {themes.map((theme) => (
          <TerminalButton
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            variant={currentTheme === theme.id ? 'accent' : 'ghost'}
            size="md"
            className="min-w-32"
          >
            <span className="mr-2">{theme.icon}</span>
            {theme.name}
          </TerminalButton>
        ))}
      </div>
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`${sizes[size]} border-3 border-mermaid-cyan/30 border-t-mermaid-cyan 
                     rounded-full animate-spin ${className}`}
    ></div>
  );
}

// Ripple Effect Component
export function RippleEffect({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>{children}</div>
  );
}

// Floating Bubbles Component
export function FloatingBubbles({ count = 15, className = '' }) {
  return (
    <div
      className={`absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute text-mermaid-bubble animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '-50px',
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            opacity: Math.random() * 0.5 + 0.3,
          }}
        >
          🫧
        </div>
      ))}
    </div>
  );
}

export default {
  TerminalHeader,
  TerminalLogs,
  TerminalInput,
  StatCard,
  TerminalButton,
  ThemeSelector,
  LoadingSpinner,
  RippleEffect,
  FloatingBubbles,
};
