import type { LbdFuncResponse as FuncRes } from '@/types/util.types';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

/**
 * Formats a standard Lambda function response.
 *
 * @param response - The response object to be returned
 * @param statusCode - The HTTP status code (default is 200)
 * @param other - Additional properties to include in the response
 * @returns - The formatted Lambda function response
 */
export function formatResponse(response: object, statusCode: number = 200, other: object = {}): FuncRes {
  return {
    statusCode,
    body: JSON.stringify(response),
    ...other,
  };
}

/**
 * Formats an API Gateway Lambda function response.
 *
 * @param response - The response object to be returned
 * @param statusCode - The HTTP status code (default is 200)
 * @param other - Additional properties to include in the response
 * @returns The formatted API Gateway response
 */
export function formatApiResponse(response: object, statusCode: number = 200, other: object = {}): ApiFuncRes {
  return {
    statusCode,
    body: JSON.stringify(response),
    headers: {
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
    },
    ...other,
  };
}
