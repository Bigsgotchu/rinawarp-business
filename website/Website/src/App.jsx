/*
 * Copyright (c) 2024-2025 RinaWarp Technologies, LLC. All rights reserved.
 *
 * RinaWarp™ and RinaWarp Terminal Pro™ are trademarks of RinaWarp Technologies, LLC.
 * RinaWarp Phone Manager™, RinaWarp Music Video Creator™, Rina Vex™, and the 
 * Double-Infinity Logo™ are also protected trademarks.
 * Unauthorized use, copying, or distribution is strictly prohibited.
 */

import React from "react";

const gradientBg = "bg-gradient-to-br from-[#e9007f] via-[#ff6ac1] to-[#00ff99]";

function DoubleInfinityLogo({ size = "w-10 h-10", withText = false }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${size} rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 shadow-lg shadow-fuchsia-500/30`}
      >
        <div
          className={`text-xl md:text-2xl font-black bg-clip-text text-transparent ${gradientBg}`}
        >
          ∞∞
        </div>
      </div>
      {withText && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-300">
            RinaWarp
          </span>
          <span className="text-xs font-medium text-slate-400">
            Terminal Pro & Rina Vex
          </span>
        </div>
      )}
    </div>
  );
}

function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <a href="#top" className="flex items-center gap-3">
          <DoubleInfinityLogo withText />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#artist" className="hover:text-white">
            Rina Vex
          </a>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 hover:text-white md:inline"
          >
            View Plans
          </a>
          <a
            href="#download"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 ${gradientBg} shadow-lg shadow-fuchsia-500/30 hover:brightness-110 transition`}
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="top"
      className="border-b border-slate-800 bg-slate-950/95"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 md:flex-row md:px-6 md:pb-20 md:pt-16">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
            <DoubleInfinityLogo size="w-7 h-7" />
            <span className="uppercase tracking-[0.16em]">
              RinaWarp Terminal Pro
            </span>
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            The AI-powered terminal that works like a{" "}
            <span className={`bg-clip-text text-transparent ${gradientBg}`}>
              full-time dev
            </span>{" "}
            on your machine.
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            RinaWarp Terminal Pro is your voice-controlled, AI-routed, workflow-
            obsessed terminal. Lifetime license, no subscriptions, built for
            builders who actually ship.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#download"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 ${gradientBg} shadow-lg shadow-fuchsia-500/30 hover:brightness-110 transition`}
            >
              Download Terminal Pro
              <span className="text-[10px] opacity-80">Linux • AppImage</span>
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 hover:border-slate-500 hover:text-white"
            >
              View lifetime & monthly plans
            </a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
            <Stat label="AI Engines" value="Multi-model" />
            <Stat label="Lifetime tiers" value="3 limited" />
            <Stat label="Launch discount" value="Founder & Pioneer" />
            <Stat label="Artist brand" value="Rina Vex™" />
          </div>
        </div>

        <div className="flex-1">
          <div className="relative mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl shadow-fuchsia-500/20">
            <div
              className={`absolute inset-0 -z-10 blur-3xl opacity-30 ${gradientBg}`}
            />
            <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
              <span className="inline-flex items-center gap-2">
                <DoubleInfinityLogo size="w-6 h-6" />
                <span>RinaWarp Terminal Pro</span>
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                Live session
              </span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3 font-mono text-xs text-emerald-300">
              <p className="text-slate-400">
                karina@warp ~ <span className="text-fuchsia-400"># RinaWarp</span>
              </p>
              <p className="mt-2 text-emerald-300">
                ${" "}
                <span className="text-fuchsia-300">
                  warp deploy --target=production --ai-assist
                </span>
              </p>
              <TerminalLine prefix="[AI]" text="Analyzing repo, CI & infra…" />
              <TerminalLine
                prefix="[AI]"
                text="Configuring Oracle, PM2, Caddy, Cloudflare…"
              />
              <TerminalLine
                prefix="[AI]"
                text="Hardening backend with API keys & rate limits…"
              />
              <TerminalLine
                prefix="[OK]"
                text="api.rinawarptech.com is now live & healthy."
              />
              <TerminalLine
                prefix="[∞∞]"
                text="Welcome to Terminal Pro. Let's ship."
                highlight
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function TerminalLine({ prefix, text, highlight }) {
  return (
    <p
      className={`mt-1 ${
        highlight ? "text-fuchsia-300" : "text-emerald-200"
      }`}
    >
      <span className="mr-1 text-slate-500">{prefix}</span>
      {text}
    </p>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-b border-slate-800 bg-slate-950/98 py-14"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          kicker="Why Terminal Pro"
          title="A terminal that feels like an elite teammate, not just a shell."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Multi-model AI routing"
            body="Route tasks through multiple LLM providers (OpenAI, Groq, Ollama, and more) with fallbacks, so your terminal doesn't stall when one model does."
          />
          <FeatureCard
            title="Production-grade backend"
            body="Secured with API keys, rate limiting, Cloudflare, Caddy, Oracle, PM2, Stripe – already hardened so you can just build and sell."
          />
          <FeatureCard
            title="Launch-ready business stack"
            body="Stripe checkout, license system, download pipeline, Netlify + R2 scripts – your app + business are wired together from day one."
          />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ kicker, title, center = false }) {
  return (
    <div className={center ? "text-center" : ""}>
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
        <DoubleInfinityLogo size="w-6 h-6" />
        <span>{kicker}</span>
      </div>
      <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function FeatureCard({ title, body }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-[11px] text-fuchsia-300 border border-slate-700">
          ∞
        </span>
        {title}
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}

function PricingSection() {
  const tiers = [
    { name: "Free", price: "$0", tag: "Funnel", note: "Try the experience" },
    {
      name: "Basic",
      price: "$9.99/mo",
      tag: "Starter",
      note: "Light workflows & hobby projects",
    },
    {
      name: "Starter",
      price: "$29/mo",
      tag: "Growing",
      note: "More power, more usage",
    },
    {
      name: "Creator",
      price: "$69/mo",
      tag: "Pro creators",
      note: "Automation + content workflows",
    },
    {
      name: "Pro",
      price: "$99/mo",
      tag: "Power users",
      note: "Teams, heavy usage, dev shops",
    },
  ];

  const lifetime = [
    {
      name: "Founder Lifetime",
      price: "$699",
      limit: "200 licenses",
      highlight: "Launch wave • Highest flex",
    },
    {
      name: "Pioneer Lifetime",
      price: "$800",
      limit: "300 licenses",
      highlight: "Second wave • Serious builders",
    },
    {
      name: "Lifetime Future",
      price: "$999",
      limit: "Unlimited",
      highlight: "Evergreen lifetime access",
    },
  ];

  return (
    <section
      id="pricing"
      className="border-b border-slate-800 bg-slate-950/98 py-16"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          kicker="Pricing & Lifetime"
          title="Monthly if you want. Lifetime if you're serious."
          center
        />
        <p className="mt-3 text-center text-sm text-slate-300">
          Same engine under the hood. You choose how you want to invest –
          monthly flexibility or lifetime ownership.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Monthly / SaaS column */}
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                Monthly & Subscription Plans
              </h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                Unlimited seats per plan
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">{tier.name}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                      {tier.tag}
                    </span>
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">
                    {tier.price}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{tier.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Monthly plans are perfect if you want to test, iterate, or use
              Terminal Pro for client projects without committing to lifetime
              yet.
            </p>
          </div>

          {/* Lifetime column */}
          <div className="space-y-4 rounded-3xl border border-fuchsia-500/60 bg-slate-950/90 p-5 shadow-[0_0_60px_rgba(233,0,127,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Lifetime Access (Limited Waves)
              </h3>
              <DoubleInfinityLogo size="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-300">
              One payment, lifetime updates. Founder & Pioneer waves are
              strictly limited – when they're gone, they're gone.
            </p>
            <div className="grid gap-3">
              {lifetime.map((tier, i) => (
                <div
                  key={tier.name}
                  className={`flex flex-col rounded-2xl border p-3 ${
                    i === 0
                      ? "border-fuchsia-400 bg-fuchsia-500/10"
                      : "border-slate-700 bg-slate-950/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    <span className="font-semibold">{tier.name}</span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                      {tier.limit}
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {tier.price}
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    {tier.highlight}
                  </p>
                </div>
              ))}
            </div>
            <a
              href="#download"
              className={`mt-2 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 ${gradientBg} hover:brightness-110 transition`}
            >
              Lock in lifetime access
            </a>
            <p className="mt-2 text-[11px] text-slate-400">
              Founder & Pioneer tiers are designed for early believers – devs,
              creators, and power users who want to own their tools, not rent
              them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RinaVexSection() {
  return (
    <section
      id="artist"
      className="border-b border-slate-800 bg-slate-950 py-16"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          kicker="Rina Vex • Artist Brand"
          title="The same mind building Terminal Pro is dropping tracks on 50+ platforms."
          center
        />
        <p className="mt-3 text-center text-sm text-slate-300 max-w-3xl mx-auto">
          RinaWarp started as a way to ship better tools for my own music
          career. I'm Rina Vex – artist, dev, and the chaos in the middle.
          This brand lets both sides launch together: the app that powers the
          work, and the music that tells the story.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-sm font-semibold text-slate-100">
              Rina Vex • Dark Pop / R&B • Trap-leaning
            </h3>
            <p className="text-sm text-slate-300">
              Songs about foster homes, reunions, heartbreak, and coming back
              stronger – the same energy that built Terminal Pro. If you're
              running code in the terminal, you can run my tracks in your
              headphones.
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-200">
              <li>• Released on Apple Music, Spotify, YouTube & more</li>
              <li>• Dark, cinematic, bass-heavy mixes – "car-hit loud"</li>
              <li>• Real stories behind the brand: family, grind, survival</li>
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Replace these href values with your actual artist URLs */}
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-fuchsia-400 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Listen on Spotify
              </a>
              <a
                href="https://music.apple.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-fuchsia-400 hover:text-white"
              >
                 Apple Music
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-fuchsia-400 hover:text-white"
              >
                ▶ YouTube
              </a>
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-4 overflow-hidden">
            <div
              className={`pointer-events-none absolute inset-0 opacity-40 blur-3xl ${gradientBg}`}
            />
            <div className="relative rounded-2xl border border-slate-700 bg-slate-950/90 p-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <DoubleInfinityLogo size="w-7 h-7" />
                  <span>Now Playing • Rina Vex</span>
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-fuchsia-300">
                  Artist + Dev
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-slate-100">
                  "For a Minute, Forever"
                </p>
                <p className="text-xs text-slate-400">
                  Greyhound bus, reunion, and every second that changes a life.
                </p>
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
                <div className="h-2 w-2/3 rounded-full bg-fuchsia-400" />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>01:23</span>
                <span>03:57</span>
              </div>

              <p className="mt-4 text-xs text-slate-300">
                RinaWarp is the tech. Rina Vex is the story. Together they turn
                your setup into a whole ecosystem – tools that ship your code
                and music that carries your mood.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DownloadSection() {
  return (
    <section
      id="download"
      className="border-b border-slate-800 bg-slate-950 py-14"
    >
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <SectionHeader
          kicker="Download & Install"
          title="Get Terminal Pro on your machine in a few clicks."
          center
        />
        <p className="mt-3 text-sm text-slate-300">
          Start with the Linux AppImage. Windows & macOS builds can follow
          via your existing CI once you're ready – but revenue can start
          today.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <a
            href="https://downloads.rinawarptech.com/RinaWarp-Terminal-Pro-1.0.0-linux-x86_64.AppImage"
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 ${gradientBg} shadow-lg shadow-fuchsia-500/40 hover:brightness-110 transition`}
          >
            Download AppImage • Linux x86_64
          </a>
          <p className="max-w-md text-xs text-slate-400">
            Make it executable:
            <code className="ml-1 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] text-slate-200">
              chmod +x RinaWarp-Terminal-Pro-1.0.0-linux-x86_64.AppImage
            </code>
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section
      id="faq"
      className="border-b border-slate-800 bg-slate-950 py-14"
    >
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <SectionHeader
          kicker="FAQ"
          title="Quick answers before you hit download."
          center
        />
        <div className="mt-8 space-y-6">
          <FAQItem
            q="Is this actually ready for real-world use?"
            a="Yes. The backend is live on Oracle with PM2, Caddy, Cloudflare, SSL, Stripe, license management, health checks and security hardening already in place. You're not buying a prototype – you're plugging into a working system."
          />
          <FAQItem
            q="What do I get with a lifetime license?"
            a="Lifetime updates to Terminal Pro, full access to the secured backend, license-based activation for the desktop app, and the right to use it in your own workflows and client projects. Founder & Pioneer tiers are strictly limited for scarcity and early-believer flex."
          />
          <FAQItem
            q="Is this only for devs?"
            a="No. It's dev-grade, but built for creators, power users, and anyone who lives in their computer. If you're managing projects, content, releases, or multiple tools, Terminal Pro helps you automate and stay in control."
          />
          <FAQItem
            q="Where does Rina Vex fit into all of this?"
            a="Rina Vex is my artist persona – the music side of the same brain that built RinaWarp. The brand launches together so the tools, visuals, and sound all feel like one ecosystem instead of random parts."
          />
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-start gap-2">
        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-600 text-[10px] text-fuchsia-300">
          ∞
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-100">{q}</p>
          <p className="mt-1 text-sm text-slate-300">{a}</p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 py-8 border-t border-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 md:flex-row md:px-6">
        <div className="flex items-center gap-3">
          <DoubleInfinityLogo withText />
          <span className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} RinaWarp & Rina Vex. All rights
            reserved.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#top" className="hover:text-slate-200">
            Back to top
          </a>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span className="text-[11px]">
            Double Infinity™ brand. One mind, two worlds.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <NavBar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <RinaVexSection />
        <DownloadSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}