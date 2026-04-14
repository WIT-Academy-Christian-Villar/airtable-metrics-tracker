"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRoute = void 0;
const normalizeRoute = (rawRoute, rawUrl, rules) => {
    let candidate = rawRoute?.trim() || rawUrl?.trim() || rules.fallbackRoute;
    if (/^https?:\/\//i.test(candidate)) {
        try {
            const parsed = new URL(candidate);
            if (rules.allowedHosts.length > 0 &&
                !rules.allowedHosts.includes(parsed.hostname)) {
                return rules.fallbackRoute;
            }
            candidate = parsed.pathname;
        }
        catch {
            candidate = rules.fallbackRoute;
        }
    }
    else if (rules.baseUrl && !candidate.startsWith("/")) {
        try {
            const parsed = new URL(candidate, rules.baseUrl);
            candidate = parsed.pathname;
        }
        catch {
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
exports.normalizeRoute = normalizeRoute;
