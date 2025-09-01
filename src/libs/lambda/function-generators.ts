import type { CustomAPIGatewayEvent as ApiFunc } from '@/types/api-gateway';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { authenticatedApiFunctionConfig, defaultApiFunctionConfig, generatePathname } from './function-configs';
import { handleApiFuncError } from '../error';
import { middyfy } from '../utility';
import { formatApiResponse } from './response-format';
/**
 * @fileoverview Lambda function configuration generators for serverless applications.
 * Provides utilities to create standardized Lambda function configurations for different use cases.
 */

/**
 * Generates a default Lambda function configuration.
 * @param dirname - Directory name containing the handler.
 * @param handlerName - Name of the handler function.
 * @param other - Additional configuration options to merge with defaults.
 * @returns Lambda function configuration object with handler path and additional options.
 * @example
 * ```typescript
 * const config = createDefaultFunction('users', 'getUser', { timeout: 30 });
 * // Returns: { handler: 'src/functions/users/handler.getUser', timeout: 30 }
 * ```
 */
export function createDefaultFunction(dirname: string, handlerName: string, other: object = {}) {
  return {
    handler: `${generatePathname(dirname)}/handler.${handlerName}`,
    ...other,
  };
}

/**
 * Generates a default API Lambda function configuration.
 * @param dirname - Directory name containing the handler.
 * @param funcName - Name of the handler function.
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param url - API endpoint path (e.g., '/users/{id}').
 * @param other - Additional configuration options to merge with defaults.
 * @returns API Lambda function configuration object with HTTP event configuration.
 * @example
 * ```typescript
 * const config = createDefaultApiFunction('users', 'getUser', 'GET', '/users/{id}');
 * // Returns configuration with HTTP GET event for /users/{id} endpoint
 * ```
 */
export function createDefaultApiFunction(
  dirname: string,
  funcName: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dirname)}/handler.${funcName}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...defaultApiFunctionConfig,
        },
      },
    ],
    ...other,
  };
}

/**
 * Generates an authenticated API Lambda function configuration.
 * Includes authentication/authorization requirements in the HTTP event configuration.
 * @param dirname - Directory name containing the handler.
 * @param handler - Name of the handler function.
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param url - API endpoint path (e.g., '/protected/resource').
 * @param other - Additional configuration options to merge with defaults.
 * @returns Authenticated API Lambda function configuration object with auth-enabled HTTP event.
 * @example
 * ```typescript
 * const config = createAuthenticatedApiFunction('admin', 'deleteUser', 'DELETE', '/users/{id}');
 * // Returns configuration with authenticated HTTP DELETE event
 * ```
 */
export function createAuthenticatedApiFunction(
  dirname: string,
  handler: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dirname)}/handler.${handler}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...authenticatedApiFunctionConfig,
        },
      },
    ],
    ...other,
  };
}

/**
 * Generates a scheduled Lambda function configuration.
 * Creates a function that runs on a specified schedule using CloudWatch Events.
 * @param dir - Directory name containing the handler.
 * @param handler - Name of the handler function.
 * @param schedule - Array of schedule rate expressions (e.g., ['rate(5 minutes)', 'cron(0 12 * * ? *)']).
 * @param name - Optional custom name for the scheduled event. Defaults to handler name.
 * @param description - Human-readable description of the scheduled event.
 * @param other - Additional configuration options to merge with the schedule event.
 * @returns Scheduled Lambda function configuration object with CloudWatch Events schedule.
 * @example
 * ```typescript
 * const config = createScheduledFunc(
 *   'jobs',
 *   'dailyReport',
 *   ['cron(0 9 * * ? *)'],
 *   'daily-report-job',
 *   'Generates daily reports at 9 AM'
 * );
 * ```
 */
export function createScheduledFunc(
  dir: string,
  handler: string,
  schedule: string[],
  name?: string,
  description = 'description',
  other: object = {}
) {
  return {
    handler: `${generatePathname(dir)}/handler.${handler}`,
    events: [
      {
        schedule: {
          rate: schedule,
          name: name ? name : handler,
          description: description,
          ...other,
        },
      },
    ],
  };
}

export function createApiGatewayFunction<S>(handler: (event: ApiFunc<S>) => Promise<object>) {
  const lambdaFunction = async (event: ApiFunc<S>) => {
    try {
      const result = await handler(event);
      return formatApiResponse(result);
    } catch (error: unknown) {
      return handleApiFuncError(error);
    }
  };

  return middyfy(lambdaFunction);
}
