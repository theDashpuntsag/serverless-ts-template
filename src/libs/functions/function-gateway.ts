import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ValidatedAPIGatewayProxyEvent } from '../../types';
import { handleApiFuncError } from '../error';
import { formatApiResponse } from '../utility';

/**
 * Creates an HTTP handler function with middleware support by middy.
 *
 * ### Note:
 * This function wraps the provided callback with error handling and JSON body parsing middleware.
 *
 * @param callback - The main handler function to process the event.
 * @returns {MiddyfiedHandler<ValidatedAPIGatewayProxyEvent<S>>} A middy-wrapped handler function that processes API Gateway events.
 */
export function createHttpHandler<S>(callback: (_event: ValidatedAPIGatewayProxyEvent<S>) => Promise<object>) {
  return middy(async (event: ValidatedAPIGatewayProxyEvent<S>): Promise<APIGatewayProxyResultV2> => {
    try {
      const result = await callback(event);
      return formatApiResponse(result);
    } catch (error: unknown) {
      return handleApiFuncError(error);
    }
  }).use(middyJsonBodyParser());
}
