import React from 'react';

type BrandVariant = 'terminal' | 'aimvc' | 'admin' | 'main';

interface BrandLogoProps {
  variant?: BrandVariant;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'main', className = '' }) => {
  // All variants now use RinaWarp branding
  const getBrandInfo = (variant: BrandVariant) => {
    switch (variant) {
      case 'terminal':
        return {
          text: 'RinaWarp Terminal Pro',
          icon: '🖥️',
        };
      case 'aimvc':
        return {
          text: 'RinaWarp AI Music Video',
          icon: '🎵',
        };
      case 'admin':
        return {
          text: 'RinaWarp Admin Console',
          icon: '⚙️',
        };
      default:
        return {
          text: 'RinaWarp Technologies',
          icon: '🚀',
        };
    }
  };

  const brandInfo = getBrandInfo(variant);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl" role="img" aria-label="RinaWarp">
        {brandInfo.icon}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">RinaWarp</span>
        <span className="text-xs text-neutral-400">{brandInfo.text.replace('RinaWarp ', '')}</span>
      </div>
    </div>
  );
};

// Alternative logo component using SVG for better scalability
export const BrandLogoSVG: React.FC<BrandLogoProps> = ({ variant = 'main', className = '' }) => {
  const getBrandColors = (variant: BrandVariant) => {
    switch (variant) {
      case 'terminal':
        return {
          primary: '#1cc7b1',
          secondary: '#74d1ff',
        };
      case 'aimvc':
        return {
          primary: '#ff2bd6',
          secondary: '#2beaff',
        };
      case 'admin':
        return {
          primary: '#6366f1',
          secondary: '#8b5cf6',
        };
      default:
        return {
          primary: '#3b82f6',
          secondary: '#06b6d4',
        };
    }
  };

  const colors = getBrandColors(variant);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" className="drop-shadow-lg">
        <defs>
          <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="6" fill={`url(#gradient-${variant})`} />
        <text x="16" y="20" textAnchor="middle" className="fill-white font-bold text-sm">
          RW
        </text>
      </svg>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">RinaWarp</span>
        <span className="text-xs text-neutral-400">
          {variant === 'admin'
            ? 'Admin Console'
            : variant === 'terminal'
              ? 'Terminal Pro'
              : variant === 'aimvc'
                ? 'AI Music Video'
                : 'Technologies'}
        </span>
      </div>
    </div>
  );
};
