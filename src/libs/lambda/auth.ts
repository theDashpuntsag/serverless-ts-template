import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { QueryParams, RequestMetadata } from '@/types';

import { logger } from '@/libs';

interface ExtendedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  body?: unknown;
}
/**
 * Extracts metadata from the API Gateway event.
 *
 * @param event
 * @returns
 */
const extractMetadata = (event: ExtendedAPIGatewayProxyEvent): RequestMetadata => {
  try {
    const ipAddress = event.requestContext.identity.sourceIp;
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const queryParams = event.queryStringParameters as QueryParams;
    const headers = event.headers;
    const body = event.body;
    return { ipAddress, token, headers, queryParams, body };
  } catch (error) {
    logger.error('Error', error);
    throw new Error('Unable to process request!');
  }
};

export { extractMetadata };
