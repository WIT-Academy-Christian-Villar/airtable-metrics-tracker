import type { Request, Response } from "express";
import type { z } from "zod";

import { trackerScriptQuerySchema } from "../schemas/tracker.schema";

interface TrackerScriptConfig {
  siteKey: string;
  visit: boolean;
  registration: boolean;
  registrationUrlContains: string[];
  confirmationPath?: string | undefined;
  source: string;
  debug: boolean;
}

const parseCsv = (value: string | undefined): string[] =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];

const buildTrackerScript = (config: TrackerScriptConfig): string => `(() => {
  const config = ${JSON.stringify(config)};
  const globalKey = "__airtableMetricsTracker";
  const markerKey = globalKey + ":" + config.siteKey + ":registration";
  const markerTtlMs = 10 * 60 * 1000;
  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement && scriptElement.src ? new URL(scriptElement.src, window.location.href) : null;
  const apiOrigin = scriptUrl ? scriptUrl.origin : window.location.origin;
  const state = window[globalKey] ?? { patchedFetch: false, patchedXhr: false, initializedSiteKeys: {} };

  window[globalKey] = state;

  if (state.initializedSiteKeys[config.siteKey]) {
    return;
  }

  state.initializedSiteKeys[config.siteKey] = true;

  const debugLog = (...args) => {
    if (config.debug) {
      console.debug("[airtable-tracker]", ...args);
    }
  };

  const normalizePath = (value) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      return "/";
    }

    const trimmed = value.trim();
    const normalized = trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
  };

  const parseUrl = (value) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }

    try {
      return new URL(value, window.location.href);
    } catch {
      return null;
    }
  };

  const getRegistrationMarker = () => {
    try {
      const raw = window.sessionStorage.getItem(markerKey);

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      if (!parsed || typeof parsed !== "object" || typeof parsed.ts !== "number") {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  const hasRecentRegistrationMarker = () => {
    const marker = getRegistrationMarker();

    return Boolean(marker && Date.now() - marker.ts <= markerTtlMs);
  };

  const saveRegistrationMarker = (payload) => {
    try {
      window.sessionStorage.setItem(
        markerKey,
        JSON.stringify({
          ts: Date.now(),
          sourcePath: payload.sourcePath,
          url: payload.url,
        }),
      );
    } catch {
      debugLog("sessionStorage unavailable; continuing without registration marker");
    }
  };

  const transmit = (kind, params) => {
    const url = new URL(kind === "visit" ? "/c/v.gif" : "/c/r.gif", apiOrigin);

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });

    try {
      if (typeof window.fetch === "function") {
        void window.fetch(url.toString(), {
          method: "GET",
          mode: "no-cors",
          keepalive: true,
          credentials: "omit",
        });
        return;
      }
    } catch {
      debugLog("fetch transport failed; falling back to image beacon");
    }

    const image = new Image();
    image.src = url.toString();
  };

  const trackVisit = () => {
    if (!config.visit) {
      return;
    }

    debugLog("tracking visit", window.location.href);
    transmit("visit", {
      siteKey: config.siteKey,
      url: window.location.href,
      source: config.source,
      referrer: document.referrer || undefined,
    });
  };

  let registrationTrackedThisPage = false;

  const buildRegistrationPayload = (payload) => ({
    siteKey: config.siteKey,
    source: config.source,
    sourcePath: payload.sourcePath,
    url: payload.url,
    referrer: payload.referrer,
    eventId: payload.eventId,
  });

  const trackRegistration = (payload) => {
    if (!config.registration || registrationTrackedThisPage) {
      return;
    }

    registrationTrackedThisPage = true;
    const normalizedPayload = buildRegistrationPayload(payload);

    debugLog("tracking registration", normalizedPayload);
    saveRegistrationMarker(normalizedPayload);
    transmit("registration", normalizedPayload);
  };

  const trackRegistrationFromCurrentPage = (reason) => {
    trackRegistration({
      sourcePath: normalizePath(window.location.pathname),
      url: window.location.href,
      referrer: document.referrer || undefined,
      eventId: "reg_" + reason + "_" + Date.now() + "_" + Math.random().toString(16).slice(2),
    });
  };

  const matchesRegistrationUrl = (requestUrl) => {
    if (!config.registration || config.registrationUrlContains.length === 0) {
      return false;
    }

    return config.registrationUrlContains.some((fragment) =>
      requestUrl.includes(fragment),
    );
  };

  const resolveSuccessValue = async (responseLike) => {
    if (!responseLike || typeof responseLike !== "object") {
      return true;
    }

    try {
      const contentType =
        typeof responseLike.headers?.get === "function"
          ? responseLike.headers.get("content-type") || ""
          : typeof responseLike.getResponseHeader === "function"
            ? responseLike.getResponseHeader("content-type") || ""
            : "";

      if (!contentType.includes("application/json")) {
        return true;
      }

      const data =
        typeof responseLike.clone === "function"
          ? await responseLike.clone().json()
          : JSON.parse(responseLike.responseText || "{}");

      if (
        data &&
        typeof data === "object" &&
        Object.prototype.hasOwnProperty.call(data, "success")
      ) {
        return data.success !== false;
      }

      return true;
    } catch {
      return true;
    }
  };

  const maybeTrackConfirmationFallback = () => {
    if (!config.registration || !config.confirmationPath) {
      return;
    }

    if (normalizePath(window.location.pathname) !== normalizePath(config.confirmationPath)) {
      return;
    }

    if (hasRecentRegistrationMarker()) {
      debugLog("confirmation fallback skipped because recent registration marker exists");
      return;
    }

    const referrerUrl = parseUrl(document.referrer);

    if (!referrerUrl || referrerUrl.origin !== window.location.origin) {
      debugLog("confirmation fallback skipped because referrer is unavailable or cross-origin");
      return;
    }

    trackRegistration({
      sourcePath: normalizePath(referrerUrl.pathname),
      url: referrerUrl.toString(),
      referrer: document.referrer || undefined,
      eventId: "reg_confirm_" + Date.now() + "_" + Math.random().toString(16).slice(2),
    });
  };

  if (!state.patchedFetch && typeof window.fetch === "function") {
    const originalFetch = window.fetch.bind(window);

    window.fetch = function (...args) {
      const requestUrl =
        typeof args[0] === "string"
          ? args[0]
          : args[0] && typeof args[0].url === "string"
            ? args[0].url
            : "";

      return originalFetch(...args).then((response) => {
        if (matchesRegistrationUrl(requestUrl) && response && response.ok) {
          void resolveSuccessValue(response).then((shouldTrack) => {
            if (shouldTrack) {
              debugLog("registration fetch match", requestUrl);
              trackRegistrationFromCurrentPage("fetch");
            }
          });
        }

        return response;
      });
    };

    state.patchedFetch = true;
  }

  if (!state.patchedXhr && typeof window.XMLHttpRequest === "function") {
    const originalOpen = window.XMLHttpRequest.prototype.open;
    const originalSend = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this.__airtableTrackerRequestUrl =
        typeof url === "string"
          ? url
          : url && typeof url.toString === "function"
            ? url.toString()
            : "";

      return originalOpen.call(this, method, url, ...rest);
    };

    window.XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("loadend", () => {
        if (
          this.status >= 200 &&
          this.status < 300 &&
          matchesRegistrationUrl(this.__airtableTrackerRequestUrl || "")
        ) {
          void resolveSuccessValue(this).then((shouldTrack) => {
            if (shouldTrack) {
              debugLog("registration xhr match", this.__airtableTrackerRequestUrl);
              trackRegistrationFromCurrentPage("xhr");
            }
          });
        }
      });

      return originalSend.apply(this, args);
    };

    state.patchedXhr = true;
  }

  trackVisit();
  maybeTrackConfirmationFallback();
})();`;

export const getTrackerScript = (req: Request, res: Response): Response => {
  const query = req.query as unknown as z.infer<typeof trackerScriptQuerySchema>;
  const script = buildTrackerScript({
    siteKey: query.siteKey,
    visit: query.visit,
    registration: query.registration,
    registrationUrlContains: parseCsv(query.registrationUrlContains),
    ...(query.confirmationPath
      ? { confirmationPath: query.confirmationPath }
      : {}),
    source: query.source,
    debug: query.debug,
  });

  return res
    .status(200)
    .set({
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      "Content-Type": "application/javascript; charset=utf-8",
    })
    .send(script);
};
