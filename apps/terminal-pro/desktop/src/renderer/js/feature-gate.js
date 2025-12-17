const { electronAPI } = window;

let currentPlan = "free";
let currentFeatures = {};

export async function initFeatureGate() {
  try {
    const res = await electronAPI.getLicensePlan();
    currentPlan = res.plan || "free";
    currentFeatures = res.features || {};
    renderUpgradeBanner();
  } catch (e) {
    console.error("FeatureGate init failed:", e);
  }
}

export function hasFeature(key) {
  if (currentPlan === "enterprise") return true;
  if (currentPlan === "pro") {
    return currentFeatures[key] !== false;
  }
  return currentFeatures[key] === true;
}

export function getPlan() {
  return currentPlan;
}

async function renderUpgradeBanner() {
  const bar = document.querySelector(".rina-upgrade-bar");
  if (!bar) return;

  if (currentPlan === "free") {
    bar.innerHTML = `
      <span>You're on the Free tier. Unlock full AI, voice, and enterprise tools with Pro.</span>
      <button class="rina-upgrade-btn" data-tier="pro">Upgrade to Pro</button>
    `;
  } else if (currentPlan === "pro") {
    bar.innerHTML = `
      <span>You're on Pro. Need seats, SSO, or custom limits?</span>
      <button class="rina-upgrade-btn" data-tier="enterprise">Talk to Sales</button>
    `;
  } else {
    bar.innerHTML = `<span>Enterprise plan active. Thank you for supporting RinaWarp 💜</span>`;
  }

  bar.addEventListener("click", async (e) => {
    const btn = e.target.closest(".rina-upgrade-btn");
    if (!btn) return;
    const tier = btn.dataset.tier;
    try {
      await electronAPI.startBillingUpgrade({ tier });
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  });
}