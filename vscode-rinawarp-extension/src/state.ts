import type { RinaEnvelope } from "./protocol";

export type AppState = "draft" | "preview" | "awaiting_approval" | "executing" | "verifying" | "done" | "failed";

export type SessionModel = {
  state: AppState;
  envelope?: RinaEnvelope;

  // authority boundary:
  approvedPlanHash?: string;
  approvalToken?: string;

  strictSuggested?: boolean;
  lastRaw?: string;
  lastIssues?: unknown;
  selectedStepId?: string;
};

export function initialSession(): SessionModel {
  return { state: "draft" };
}