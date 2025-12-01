import { ValidatedAPIGatewayProxyEvent } from '../../types';
import { logErrorMessage } from '../error';
import { HttpEventMetadata } from './api-event.types';

/**
 * Extracts metadata from the API Gateway event.
 *
 * @param {APIGatewayProxyEvent} event - The API Gateway Proxy Event object.
 * @returns {HttpEventMetadata} - Extracted metadata including IP address, token, headers, query parameters, and body.
 */
export function extractMetadataFromEvent(event: ValidatedAPIGatewayProxyEvent<object>): HttpEventMetadata {
  try {
    const ipAddress = event.requestContext.identity.sourceIp;
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const queryParams = event.queryStringParameters || {};
    const headers = event.headers;
    const body = event.body;

    return { ipAddress, token, headers, queryParams, body };
  } catch (error) {
    logErrorMessage(event, `extractMetadataFromEvent`);
    throw error;
  }
}
