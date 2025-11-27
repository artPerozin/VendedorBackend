export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
}