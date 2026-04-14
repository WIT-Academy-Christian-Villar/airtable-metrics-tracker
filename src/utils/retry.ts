import { AppError } from "./errors";

interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const delay = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const defaultShouldRetry = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return (
      error.statusCode === 408 ||
      error.statusCode === 429 ||
      error.statusCode >= 500
    );
  }

  return error instanceof Error;
};

export const withRetry = async <T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      const shouldRetry = (options.shouldRetry ?? defaultShouldRetry)(
        error,
        attempt,
      );

      if (!shouldRetry || attempt === options.maxAttempts) {
        throw error;
      }

      const delayMs = Math.min(
        options.maxDelayMs,
        options.initialDelayMs * 2 ** (attempt - 1),
      );

      await delay(delayMs);
    }
  }

  throw lastError;
};
