import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const defaultMessage = this.getDefaultMessage(request.method);
    const message = customMessage || defaultMessage;

    return next.handle().pipe(
      map((res) => {
        // If response is a paginated structure { data, total, page, limit }
        if (
          res &&
          typeof res === 'object' &&
          Array.isArray(res.data) &&
          typeof res.total === 'number' &&
          typeof res.page === 'number' &&
          typeof res.limit === 'number'
        ) {
          const totalPages =
            res.limit > 0 ? Math.ceil(res.total / res.limit) : 1;

          return {
            statusCode: response.statusCode,
            message,
            data: res.data,
            meta: {
              page: res.page,
              limit: res.limit,
              total: res.total,
              totalPages,
            },
          };
        }

        // Standard single resource / un-paginated response wrapper
        return {
          statusCode: response.statusCode,
          message,
          data: res,
        };
      }),
    );
  }

  private getDefaultMessage(method: string): string {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'Resource created successfully';
      case 'GET':
        return 'Resource fetched successfully';
      case 'PATCH':
      case 'PUT':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      default:
        return 'Operation completed successfully';
    }
  }
}
