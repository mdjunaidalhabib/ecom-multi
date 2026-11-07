export const LEAD_PLANS = ["Starter", "Business", "Custom", "Reseller"];
const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid"];

export function leadPlanName(value) {
  const key = typeof value === "string" ? value.toLowerCase() : "";
  return LEAD_PLANS.find(plan => key === plan.toLowerCase() || key.startsWith(`${plan.toLowerCase()}-`)) || "";
}

export function captureLeadAttribution() {
  const params = new URLSearchParams(window.location.search);
  const current = Object.fromEntries(ATTRIBUTION_KEYS.filter(key => params.has(key)).map(key => [key, params.get(key).slice(0, 500)]));
  try {
    const saved = JSON.parse(sessionStorage.getItem("ecms-lead-attribution") || "null");
    const previous = saved && Date.now() - saved.time < 24 * 60 * 60 * 1000 ? saved.value : {};
    const value = Object.fromEntries(ATTRIBUTION_KEYS.flatMap(key => {
      const candidate = current[key] ?? previous?.[key];
      return typeof candidate === "string" ? [[key, candidate.slice(0, 500)]] : [];
    }));
    sessionStorage.setItem("ecms-lead-attribution", JSON.stringify({ time: Date.now(), value }));
    return value;
  } catch { return current; }
}

export function leadPageHref(plan, attribution = {}) {
  const params = new URLSearchParams({ plan: leadPlanName(plan) || "Custom" });
  for (const key of ATTRIBUTION_KEYS) {
    if (typeof attribution[key] === "string") params.set(key, attribution[key]);
  }
  return `/contact?${params}`;
}
