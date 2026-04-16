import * as jwt from 'jsonwebtoken';
import { logErrorMessage } from '../error';
import { HttpEventMetadata, HttpEventMetadataWithAuth, httpEventMetadataWithAuthSch } from './api-event.types';
import { extractedCognitoTokenSch, ValidatedAPIGatewayProxyEvent } from './api-function.types';

type EventType = ValidatedAPIGatewayProxyEvent<unknown>;

/**
 * Extracts metadata from the API Gateway event.
 *
 * @param {APIGatewayProxyEvent} event - The API Gateway Proxy Event object.
 * @returns {HttpEventMetadata} - Extracted metadata including IP address, token, headers, query parameters, and body.
 */
export function extractMetadataFromEvent(event: EventType): HttpEventMetadata {
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

/**
 * Extracts metadata and authorization details from the API Gateway event.
 * Decodes the JWT token to extract user sub and email.
 *
 * @param {ValidatedAPIGatewayProxyEvent<unknown>} event - The API Gateway Proxy Event object.
 * @returns {HttpEventMetadataWithAuth} - Extracted metadata including IP address, user sub, email, headers, query parameters, and body.
 */
export function extractMetadataAndAuthorizationFromEvent(event: EventType): HttpEventMetadataWithAuth {
  try {
    const ipAddress = event.requestContext.identity.sourceIp;
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const headers = event.headers;
    const body = event.body;
    const { sub, email } = extractedCognitoTokenSch.parse(jwt.decode(token || '', { json: true }));

    return httpEventMetadataWithAuthSch.parse({ ipAddress, sub, email, headers, body });
  } catch (error: unknown) {
    logErrorMessage(error, `extractMetadataAndAuthorizationFromEvent`);
    throw error;
  }
}
