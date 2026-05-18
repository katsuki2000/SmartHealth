import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any);
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
        'GlobalExceptionFilter',
      );
    }

    // Log error for audit trail
    this.logger.warn(
      `[${request.method}] ${request.url} - Status: ${status} - ${message}`,
      'GlobalExceptionFilter',
    );

    // If the request is for a FHIR endpoint, return a proper FHIR OperationOutcome resource
    if (request.url.startsWith('/fhir') || request.url.startsWith('/api/v1/fhir')) {
      let severity = 'error';
      let issueCode = 'invalid';

      if (status >= 500) {
        severity = 'fatal';
        issueCode = 'exception';
      } else if (status === 401 || status === 403) {
        severity = 'error';
        issueCode = 'security';
      } else if (status === 404) {
        severity = 'error';
        issueCode = 'not-found';
      }

      const operationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity,
            code: issueCode,
            diagnostics: message,
          },
        ],
      };

      response.status(status).json(operationOutcome);
      return;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }
}
