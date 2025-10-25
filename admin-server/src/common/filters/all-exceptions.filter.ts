import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Đã có lỗi xảy ra trên máy chủ';

    let responseMessage = 'Đã có lỗi xảy ra trên máy chủ';
    if (typeof errorResponse === 'string') {
      responseMessage = errorResponse;
    } else if (errorResponse && typeof errorResponse === 'object' && 'message' in errorResponse) {

      responseMessage = (errorResponse as any).message;
    }

    console.error(exception);

    response.status(status).json({
      success: false,
      status: status,
      message: responseMessage,

      stack: process.env.NODE_ENV === 'development' ? (exception as Error).stack : undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}