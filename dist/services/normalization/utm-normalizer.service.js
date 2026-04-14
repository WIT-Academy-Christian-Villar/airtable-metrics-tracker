"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utmNormalizerService = exports.UtmNormalizerService = void 0;
const toNullableString = (value) => {
    if (typeof value === "string") {
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : null;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    return null;
};
class UtmNormalizerService {
    normalize(rawUtms, mapping) {
        const sourceMap = new Map(Object.entries(rawUtms ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
        const resolveAlias = (aliases) => {
            for (const alias of aliases) {
                const value = sourceMap.get(alias.toLowerCase());
                const normalized = toNullableString(value);
                if (normalized) {
                    return normalized;
                }
            }
            return null;
        };
        return {
            utmSource: resolveAlias(mapping.source),
            utmMedium: resolveAlias(mapping.medium),
            utmCampaign: resolveAlias(mapping.campaign),
            utmTerm: resolveAlias(mapping.term),
            utmContent: resolveAlias(mapping.content),
        };
    }
}
exports.UtmNormalizerService = UtmNormalizerService;
exports.utmNormalizerService = new UtmNormalizerService();
