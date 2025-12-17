import React from "react";
import { ProductBadge } from "./ProductBadge";

type Variant = "terminal" | "aimvc";

interface PricingCardProps {
  variant: Variant;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  ctaLabel: string;
  onClick?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  variant,
  name,
  price,
  cadence,
  description,
  features,
  ctaLabel,
  onClick,
}) => {
  const isTerminal = variant === "terminal";

  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 md:p-8
      overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl
      ${isTerminal
        ? "bg-terminal-surfaceSoft/90 border-terminal-border shadow-glow-terminal"
        : "bg-aimvc-surfaceSoft/90 border-aimvc-border shadow-glow-aimvc"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <ProductBadge variant={variant} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">
          {isTerminal ? "Desktop Suite" : "Creator Platform"}
        </span>
      </div>

      <h3 className="text-xl md:text-2xl font-semibold text-brand-text mb-2">
        {name}
      </h3>
      <p className="text-sm text-brand-muted mb-4">{description}</p>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl md:text-4xl font-bold text-brand-text">
          {price}
        </span>
        <span className="text-xs uppercase tracking-widest text-brand-muted">
          {cadence}
        </span>
      </div>

      <ul className="space-y-2 text-sm text-brand-muted mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span
              className={`mt-[6px] h-1.5 w-1.5 rounded-full ${
                isTerminal ? "bg-terminal-teal" : "bg-aimvc-neonBlue"
              }`}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClick}
        className={`mt-auto inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold
        transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
        ${isTerminal
          ? "bg-terminal-hotPink text-black hover:bg-terminal-coral focus:ring-terminal-hotPink/60"
          : "bg-aimvc-electricPink text-black hover:bg-aimvc-neonBlue focus:ring-aimvc-electricPink/60"
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
};