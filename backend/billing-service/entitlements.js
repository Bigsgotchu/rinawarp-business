/**
 * Entitlements → feature gating (Agent tiers)
 * Deterministic, server-truth. Client/UI never decides.
 *
 * Expected shape from DB:
 * {
 *   terminal_pro_lifetime: boolean,
 *   agent_pro_status: "active"|"grace"|"past_due"|"canceled"|"none",
 *   agent_pro_ends_at: string | null (ISO)
 * }
 */

export function computeAccess(ent) {
  const terminal = !!ent?.terminal_pro_lifetime;
  const status = ent?.agent_pro_status || 'none';
  const endsAt = ent?.agent_pro_ends_at ? Date.parse(ent.agent_pro_ends_at) : null;
  const now = Date.now();

  // Terminal Pro lifetime unlock
  const terminalPro = terminal;

  // Agent Pro unlock rules:
  // - active: fully unlocked
  // - grace: unlocked (limited warnings)
  // - past_due: degraded mode (ghost suggestions ok; AI calls blocked)
  // - canceled: unlocked until period end if ends_at in future
  // - none: blocked
  const withinPaidPeriod = endsAt ? endsAt > now : false;

  const agentPro =
    status === 'active' || status === 'grace' || (status === 'canceled' && withinPaidPeriod);

  const agentProDegraded = status === 'past_due' || (status === 'canceled' && !withinPaidPeriod);

  // What "Agent Pro" means in v1:
  // - Local heuristics + ghost text can be available to all Terminal Pro owners
  // - Cloud AI features are Agent Pro
  const allowLocalAgent = terminalPro; // local tools + memory, no cloud
  const allowCloudAI = agentPro; // paid subscription only

  return {
    terminalPro,
    allowLocalAgent,
    allowCloudAI,
    agentPro,
    agentProDegraded,
    status,
  };
}
