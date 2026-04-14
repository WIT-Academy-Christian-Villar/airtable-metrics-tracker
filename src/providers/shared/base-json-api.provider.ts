import { jsonApiProviderConfigSchema } from "../../schemas/provider-config.schema";
import type {
  JsonApiProviderConfig,
} from "../../schemas/provider-config.schema";
import type {
  ProviderDescriptor,
  ProviderExecutionContext,
} from "../../types/provider";
import { AppError } from "../../utils/errors";
import { fetchJson } from "../../utils/http";
import { getValueByPath } from "../../utils/object";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export abstract class BaseJsonApiProvider {
  public abstract readonly descriptor: ProviderDescriptor;

  public validateConfig(config: unknown): JsonApiProviderConfig {
    return jsonApiProviderConfigSchema.parse(config);
  }

  protected async fetchItems(
    config: JsonApiProviderConfig,
    context: ProviderExecutionContext,
  ): Promise<unknown[]> {
    const requestOptions = {
      method: config.method,
      headers: config.headers,
      query: config.query,
      operationName: `${this.descriptor.key}.collect`,
      logger: context.logger,
    } as const;
    const payload = await fetchJson<unknown>(config.endpoint, {
      ...requestOptions,
      ...(config.body !== undefined ? { body: config.body } : {}),
      ...(config.timeoutMs !== undefined ? { timeoutMs: config.timeoutMs } : {}),
    });

    const resolved = getValueByPath<unknown>(payload, config.dataPath) ?? payload;

    if (Array.isArray(resolved)) {
      return resolved;
    }

    if (isRecord(resolved)) {
      for (const key of ["data", "items", "records", "results"]) {
        const candidate = resolved[key];

        if (Array.isArray(candidate)) {
          return candidate;
        }
      }
    }

    throw new AppError({
      message: `${this.descriptor.key} expected an array payload`,
      code: "INVALID_PROVIDER_PAYLOAD",
      statusCode: 502,
      details: {
        providerKey: this.descriptor.key,
        dataPath: config.dataPath,
      },
    });
  }

  protected buildUtmPayload(
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    const mergedNested = ["utms", "utm", "dimensions"]
      .map((key) => payload[key])
      .filter(isRecord)
      .reduce<Record<string, unknown>>(
        (accumulator, entry) => ({
          ...accumulator,
          ...entry,
        }),
        {},
      );

    const flattened = Object.fromEntries(
      Object.entries(payload).filter(([key]) =>
        /^utm_/i.test(key) ||
        /^(source|medium|campaign|term|content)$/i.test(key),
      ),
    );

    return {
      ...mergedNested,
      ...flattened,
    };
  }
}
