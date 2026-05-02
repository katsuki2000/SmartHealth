import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, body } = req;
    const userAgent = req.get('user-agent');
    const userId = (req as any).user?.userId || 'anonymous';

    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // Log request details
      const logMessage = `[${userId}] ${method} ${originalUrl} - ${statusCode} (${duration}ms) - ${userAgent}`;

      if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }

      // Log request body for POST/PUT requests (exclude sensitive data)
      if ((method === 'POST' || method === 'PUT') && body && Object.keys(body).length > 0) {
        const safeBody = this.sanitizeBody(body);
        this.logger.debug(`Request body: ${JSON.stringify(safeBody)}`);
      }
    });

    next();
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
