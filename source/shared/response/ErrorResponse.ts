import { ErrorCode } from "../error/ErrorCode";
import ErrorDetails from "../error/ErrorsDetails";

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails[];
  };
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
}