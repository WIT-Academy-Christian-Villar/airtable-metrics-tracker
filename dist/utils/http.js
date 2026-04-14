"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJson = void 0;
const env_1 = require("../config/env");
const errors_1 = require("./errors");
const retry_1 = require("./retry");
const shouldRetryHttpError = (statusCode) => statusCode === 408 || statusCode === 429 || statusCode >= 500;
const fetchJson = async (url, options) => {
    const requestUrl = new URL(url);
    for (const [key, value] of Object.entries(options.query ?? {})) {
        requestUrl.searchParams.set(key, value);
    }
    const timeoutMs = options.timeoutMs ?? env_1.env.requestTimeoutMs;
    return (0, retry_1.withRetry)(async (attempt) => {
        options.logger?.debug({
            operationName: options.operationName,
            url: requestUrl.toString(),
            attempt,
        }, "Executing outbound HTTP request");
        const requestInit = {
            method: options.method ?? "GET",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers ?? {}),
            },
            signal: AbortSignal.timeout(timeoutMs),
        };
        if (options.body !== undefined) {
            requestInit.body = JSON.stringify(options.body);
        }
        const response = await fetch(requestUrl, requestInit);
        if (!response.ok) {
            const bodyText = await response.text();
            throw new errors_1.AppError({
                message: `${options.operationName} failed with status ${response.status}`,
                code: "UPSTREAM_REQUEST_FAILED",
                statusCode: shouldRetryHttpError(response.status) ? 502 : 400,
                details: {
                    upstreamStatus: response.status,
                    url: requestUrl.toString(),
                    bodyText,
                },
            });
        }
        return (await response.json());
    }, {
        maxAttempts: env_1.env.retryMaxAttempts,
        initialDelayMs: env_1.env.retryInitialMs,
        maxDelayMs: env_1.env.retryMaxMs,
    });
};
exports.fetchJson = fetchJson;
