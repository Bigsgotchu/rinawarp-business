import React from "react";

type Variant = "terminal" | "aimvc";

interface ProductBadgeProps {
  variant: Variant;
  label?: string;
  className?: string;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({
  variant,
  label,
  className = "",
}) => {
  const isTerminal = variant === "terminal";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium
      border backdrop-blur-sm ${isTerminal
        ? "bg-terminal-surface/70 border-terminal-hotPink/60 text-terminal-babyBlue shadow-glow-terminal"
        : "bg-aimvc-surface/70 border-aimvc-electricPink/60 text-aimvc-neonBlue shadow-glow-aimvc"
      } ${className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isTerminal ? "bg-terminal-hotPink" : "bg-aimvc-electricPink"
        }`}
      />
      {label ??
        (isTerminal ? "RinaWarp Terminal Pro" : "AI Music Video Creator")}
    </span>
  );
};