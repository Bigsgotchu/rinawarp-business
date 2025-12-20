/**
 * Agent Pro Upsell Trigger (hidden)
 * - Never shows for lifetime plans or Agent Pro.
 * - Requires at least one "value moment" before any upsell.
 * - Cooldown + frequency caps to avoid user annoyance.
 */

export type PlanKey =
  | "free"
  | "basic"
  | "starter"
  | "creator"
  | "pro"
  | "lifetime_founder"
  | "lifetime_pioneer"
  | "lifetime_evergreen"
  | "agent_pro"; // if you model it separately

export type UpsellContext = {
  nowMs: number;
  plan: PlanKey;

  // Session behavior
  sessionStartMs: number;
  commandsExecuted: number;
  acceptedGhostSuggestions: number;
  memoryWrites: number;

  // "value moments"
  sawGhostSuggestion: boolean;
  hitAiOnlyFeature: boolean; // e.g., user clicked "AI Explain", "Refactor", etc.
  hadErrorFixMoment: boolean; // e.g., suggestion helped resolve an error

  // Anti-annoyance
  lastUpsellShownMs?: number;
  lastUpsellDismissedMs?: number;
  upsellShownCount7d?: number; // optional if you track locally
};

export type UpsellDecision = {
  shouldShow: boolean;
  reason:
    | "ineligible_plan"
    | "too_early"
    | "no_value_moment"
    | "cooldown_active"
    | "capped_frequency"
    | "eligible_soft_nudge"
    | "eligible_after_ai_click";
  debug: {
    sessionMinutes: number;
    acceptedGhostSuggestions: number;
    memoryWrites: number;
    commandsExecuted: number;
    hitAiOnlyFeature: boolean;
  };
};

/**
 * Agent Pro Upsell Trigger (hidden)
 * - Never shows for lifetime plans or Agent Pro.
 * - Requires at least one "value moment" before any upsell.
 * - Cooldown + frequency caps to avoid user annoyance.
 */
export function decideAgentProUpsell(ctx: UpsellContext): UpsellDecision {
  const sessionMinutes = (ctx.nowMs - ctx.sessionStartMs) / 60000;

  const ineligible =
    ctx.plan === "agent_pro" ||
    ctx.plan.startsWith("lifetime_"); // lifetime buyers should not be nagged

  if (ineligible) {
    return base(false, "ineligible_plan");
  }

  // HARD STOP: do not upsell in the first few minutes
  if (sessionMinutes < 6) {
    return base(false, "too_early");
  }

  // Require proof the product helped (prevents "greedy" feel)
  const hasValueMoment =
    ctx.acceptedGhostSuggestions >= 2 ||
    ctx.memoryWrites >= 1 ||
    ctx.hadErrorFixMoment;

  if (!hasValueMoment) {
    return base(false, "no_value_moment");
  }

  // Cooldowns
  const COOLDOWN_SHOW_MS = 1000 * 60 * 60 * 24 * 3; // 3 days after showing
  const COOLDOWN_DISMISS_MS = 1000 * 60 * 60 * 24 * 7; // 7 days after dismiss

  if (ctx.lastUpsellShownMs && ctx.nowMs - ctx.lastUpsellShownMs < COOLDOWN_SHOW_MS) {
    return base(false, "cooldown_active");
  }

  if (
    ctx.lastUpsellDismissedMs &&
    ctx.nowMs - ctx.lastUpsellDismissedMs < COOLDOWN_DISMISS_MS
  ) {
    return base(false, "cooldown_active");
  }

  // Cap frequency (local, privacy-first)
  if ((ctx.upsellShownCount7d ?? 0) >= 2) {
    return base(false, "capped_frequency");
  }

  // Two "eligible" paths:

  // Path A: user explicitly touched an AI-only feature
  if (ctx.hitAiOnlyFeature) {
    return base(true, "eligible_after_ai_click");
  }

  // Path B: soft nudge after repeated accept + engagement
  const engaged =
    ctx.commandsExecuted >= 8 &&
    ctx.acceptedGhostSuggestions >= 3 &&
    (ctx.sawGhostSuggestion || ctx.memoryWrites >= 1);

  if (engaged) {
    return base(true, "eligible_soft_nudge");
  }

  return base(false, "no_value_moment");

  function base(shouldShow: boolean, reason: UpsellDecision["reason"]): UpsellDecision {
    return {
      shouldShow,
      reason,
      debug: {
        sessionMinutes: Math.round(sessionMinutes * 10) / 10,
        acceptedGhostSuggestions: ctx.acceptedGhostSuggestions,
        memoryWrites: ctx.memoryWrites,
        commandsExecuted: ctx.commandsExecuted,
        hitAiOnlyFeature: ctx.hitAiOnlyFeature,
      },
    };
  }
}
