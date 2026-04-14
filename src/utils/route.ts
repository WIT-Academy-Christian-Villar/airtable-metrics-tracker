import type { RouteRulesConfig } from "../types/config";

export const normalizeRoute = (
  rawRoute: string | null | undefined,
  rawUrl: string | null | undefined,
  rules: RouteRulesConfig,
): string => {
  let candidate = rawRoute?.trim() || rawUrl?.trim() || rules.fallbackRoute;

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const parsed = new URL(candidate);

      if (
        rules.allowedHosts.length > 0 &&
        !rules.allowedHosts.includes(parsed.hostname)
      ) {
        return rules.fallbackRoute;
      }

      candidate = parsed.pathname;
    } catch {
      candidate = rules.fallbackRoute;
    }
  } else if (rules.baseUrl && !candidate.startsWith("/")) {
    try {
      const parsed = new URL(candidate, rules.baseUrl);
      candidate = parsed.pathname;
    } catch {
      candidate = `/${candidate}`;
    }
  }

  candidate = candidate.split("?")[0]?.split("#")[0] ?? rules.fallbackRoute;
  candidate = candidate.replace(/\/{2,}/g, "/");

  if (!candidate.startsWith("/")) {
    candidate = `/${candidate}`;
  }

  if (rules.stripTrailingSlash && candidate.length > 1) {
    candidate = candidate.replace(/\/+$/, "");
  }

  return candidate || rules.fallbackRoute;
};
