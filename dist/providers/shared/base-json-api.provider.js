"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseJsonApiProvider = void 0;
const provider_config_schema_1 = require("../../schemas/provider-config.schema");
const errors_1 = require("../../utils/errors");
const http_1 = require("../../utils/http");
const object_1 = require("../../utils/object");
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
class BaseJsonApiProvider {
    validateConfig(config) {
        return provider_config_schema_1.jsonApiProviderConfigSchema.parse(config);
    }
    async fetchItems(config, context) {
        const requestOptions = {
            method: config.method,
            headers: config.headers,
            query: config.query,
            operationName: `${this.descriptor.key}.collect`,
            logger: context.logger,
        };
        const payload = await (0, http_1.fetchJson)(config.endpoint, {
            ...requestOptions,
            ...(config.body !== undefined ? { body: config.body } : {}),
            ...(config.timeoutMs !== undefined ? { timeoutMs: config.timeoutMs } : {}),
        });
        const resolved = (0, object_1.getValueByPath)(payload, config.dataPath) ?? payload;
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
        throw new errors_1.AppError({
            message: `${this.descriptor.key} expected an array payload`,
            code: "INVALID_PROVIDER_PAYLOAD",
            statusCode: 502,
            details: {
                providerKey: this.descriptor.key,
                dataPath: config.dataPath,
            },
        });
    }
    buildUtmPayload(payload) {
        const mergedNested = ["utms", "utm", "dimensions"]
            .map((key) => payload[key])
            .filter(isRecord)
            .reduce((accumulator, entry) => ({
            ...accumulator,
            ...entry,
        }), {});
        const flattened = Object.fromEntries(Object.entries(payload).filter(([key]) => /^utm_/i.test(key) ||
            /^(source|medium|campaign|term|content)$/i.test(key)));
        return {
            ...mergedNested,
            ...flattened,
        };
    }
}
exports.BaseJsonApiProvider = BaseJsonApiProvider;
