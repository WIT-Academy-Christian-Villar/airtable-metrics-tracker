"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = exports.defaultShouldRetry = void 0;
const errors_1 = require("./errors");
const delay = async (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
const defaultShouldRetry = (error) => {
    if (error instanceof errors_1.AppError) {
        return (error.statusCode === 408 ||
            error.statusCode === 429 ||
            error.statusCode >= 500);
    }
    return error instanceof Error;
};
exports.defaultShouldRetry = defaultShouldRetry;
const withRetry = async (operation, options) => {
    let lastError;
    for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
        try {
            return await operation(attempt);
        }
        catch (error) {
            lastError = error;
            const shouldRetry = (options.shouldRetry ?? exports.defaultShouldRetry)(error, attempt);
            if (!shouldRetry || attempt === options.maxAttempts) {
                throw error;
            }
            const delayMs = Math.min(options.maxDelayMs, options.initialDelayMs * 2 ** (attempt - 1));
            await delay(delayMs);
        }
    }
    throw lastError;
};
exports.withRetry = withRetry;
