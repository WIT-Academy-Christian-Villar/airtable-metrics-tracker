import type { UTMMappingConfig } from "../../types/config";
import type { UTMFields } from "../../types/domain";

const toNullableString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
};

export class UtmNormalizerService {
  public normalize(
    rawUtms: Record<string, unknown> | undefined,
    mapping: UTMMappingConfig,
  ): UTMFields {
    const sourceMap = new Map<string, unknown>(
      Object.entries(rawUtms ?? {}).map(([key, value]) => [key.toLowerCase(), value]),
    );

    const resolveAlias = (aliases: string[]): string | null => {
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

export const utmNormalizerService = new UtmNormalizerService();
