import React from 'react';

type BrandVariant = 'terminal' | 'aimvc' | 'main';

interface BrandLogoProps {
  variant?: BrandVariant;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'main', className = '' }) => {
  let src = '/branding/Lumina Flow brand.png';
  let alt = 'RinaWarp Technologies';

  if (variant === 'terminal') {
    src = '/branding/Lumina Edge brand.png';
    alt = 'RinaWarp Terminal Pro';
  } else if (variant === 'aimvc') {
    src = '/branding/Lumina Flow brand.png';
    alt = 'RinaWarp AI Music Video Creator';
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`h-8 md:h-10 object-contain drop-shadow-lg ${className}`}
      loading="lazy"
    />
  );
};
