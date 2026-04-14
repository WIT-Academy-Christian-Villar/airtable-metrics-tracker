import type { Logger } from "pino";

import { env } from "../config/env";
import { AppError } from "./errors";
import { withRetry } from "./retry";

interface FetchJsonOptions {
  method?: "GET" | "POST" | "PATCH";
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  operationName: string;
  logger?: Logger;
}

const shouldRetryHttpError = (statusCode: number): boolean =>
  statusCode === 408 || statusCode === 429 || statusCode >= 500;

export const fetchJson = async <T>(
  url: string,
  options: FetchJsonOptions,
): Promise<T> => {
  const requestUrl = new URL(url);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    requestUrl.searchParams.set(key, value);
  }

  const timeoutMs = options.timeoutMs ?? env.requestTimeoutMs;

  return withRetry(
    async (attempt) => {
      options.logger?.debug(
        {
          operationName: options.operationName,
          url: requestUrl.toString(),
          attempt,
        },
        "Executing outbound HTTP request",
      );

      const requestInit: RequestInit = {
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

        throw new AppError({
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

      return (await response.json()) as T;
    },
    {
      maxAttempts: env.retryMaxAttempts,
      initialDelayMs: env.retryInitialMs,
      maxDelayMs: env.retryMaxMs,
    },
  );
};
