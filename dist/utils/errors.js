"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAppError = exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(options) {
        super(options.message);
        this.name = "AppError";
        this.code = options.code;
        this.statusCode = options.statusCode ?? 500;
        this.details = options.details;
    }
}
exports.AppError = AppError;
const isAppError = (error) => error instanceof AppError;
exports.isAppError = isAppError;
