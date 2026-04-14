export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  runId?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta: ResponseMeta;
}

export interface ApiErrorShape {
  code: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorShape;
  meta: ResponseMeta;
}
