export interface AppErrorOptions {
  message: string;
  code: string;
  statusCode?: number;
  details?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: unknown | undefined;

  public constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.details = options.details;
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
