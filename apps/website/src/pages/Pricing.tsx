import React from "react";
import { BrandLogo } from "../components/brand/BrandLogo";
import { PricingCard } from "../components/brand/PricingCard";

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="border-b border-brand-border/70 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8" />
            <span className="text-xs uppercase tracking-[0.25em] text-brand-muted">
              RinaWarp Technologies
            </span>
          </div>
          <nav className="flex gap-4 text-xs text-brand-muted">
            <a href="/" className="hover:text-brand-text">
              Home
            </a>
            <a href="/#products" className="hover:text-brand-text">
              Products
            </a>
            <a href="/legal/" className="hover:text-brand-text">
              Legal
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <h1 className="text-2xl md:text-4xl font-semibold mb-2">
          Pricing built for founders and power users
        </h1>
        <p className="text-sm text-brand-muted mb-8 max-w-2xl">
          Own your tooling. Pay once for Terminal Pro, or subscribe to the AI
          Music Video Creator for ongoing generations. Bundles available.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <PricingCard
            variant="terminal"
            name="Terminal Pro — Lifetime"
            price="$297"
            cadence="one-time"
            description="Own the RinaWarp Terminal Pro desktop suite with lifetime updates for this major version."
            features={[
              "Lifetime license for Terminal Pro v1",
              "Secure device management flows",
              "Offline-capable desktop app",
              "Business-ready logging and auditing hooks",
            ]}
            ctaLabel="Buy Terminal Pro"
          />
          <PricingCard
            variant="aimvc"
            name="AI Music Video Creator"
            price="$29"
            cadence="per month"
            description="Generate AI music videos, visuals, and assets with a creator-friendly workflow."
            features={[
              "High-quality AI video renders",
              "Credit-based generation system",
              "Commercial usage rights (per plan)",
              "Team-ready workflow support",
            ]}
            ctaLabel="Start AI-MVC Subscription"
          />
        </div>
      </main>
    </div>
  );
};