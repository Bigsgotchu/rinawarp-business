let repoPanelShown = false;
let userIntentDetected = false;

export function markUserIntent() {
  userIntentDetected = true;
}

export function canShowRepoPanel() {
  return userIntentDetected && !repoPanelShown;
}

export function markRepoPanelShown() {
  repoPanelShown = true;
}

export function resetSessionState() {
  repoPanelShown = false;
  userIntentDetected = false;
}
