import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const correlationId = request.headers['x-correlation-id']?.toString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const responseMessage = exceptionResponse.message;

        message = Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : String(responseMessage);
      }
    } else if (axios.isAxiosError(exception)) {
      statusCode = exception.response?.status ?? HttpStatus.BAD_GATEWAY;

      const gatewayData = exception.response?.data;

      if (
        typeof gatewayData === 'object' &&
        gatewayData !== null &&
        'message' in gatewayData
      ) {
        message = String(gatewayData.message);
      } else {
        message = 'Erro na comunicação com o gateway';
      }
    }

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      correlationId,
    });
  }
}
