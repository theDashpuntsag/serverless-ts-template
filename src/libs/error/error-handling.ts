import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import { formatApiResponse, formatResponse, logger } from '@/libs';
import { LbdFuncResponse } from '@/types';
import { ZodError } from 'zod';
import CustomError from './custom-error';

/**
 * Logs error messages based on the type of error.
 * @param error - The error object to log.
 * @param func - The function name where the error occurred.
 * @returns
 */
export function logErrorMessage(error: unknown, func: string = 'Error'): void {
  logger.error(`Error occurred with type: ${typeof error}`);

  if (error instanceof CustomError) {
    logger.error(`Custom error ${func}: ${error.message}`);
    return;
  }
  if (error instanceof ZodError) {
    logger.error(`Zod error ${func}: ${error.message}`);
    return;
  }
  if (error instanceof Error) {
    logger.error(`Error ${func}: ${JSON.stringify(error.message)}`);
    return;
  }
}

/**
 * Handles errors for API Gateway functions and formats the response accordingly.
 *
 * @param error - The error object to handle.
 * @returns
 */
export function handleApiFuncError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof Error) logger.error(`Error occurred!: ${JSON.stringify(error.message)}`);
  if (error instanceof CustomError) return formatApiResponse({ message: error.message }, error.statusCode);
  if (error instanceof ZodError) return handleZodError(error);
  if (error instanceof Error) return formatApiResponse({ message: error.message }, 500);
  return formatApiResponse({ message: 'Unexpected error occurred' }, 500);
}

/**
 * Handles errors for Lambda functions and formats the response accordingly.
 *
 *s @param error
 * @returns
 */
export function handleDefaultError(error: unknown): LbdFuncResponse {
  if (error instanceof Error) logger.error(`Error occurred!: ${JSON.stringify(error.message)}`);
  if (error instanceof CustomError) return formatResponse({ message: error.message }, error.statusCode);
  if (error instanceof ZodError) return handleZodFuncError(error);
  if (error instanceof Error) return formatResponse({ message: error.message }, 500);
  return formatResponse({ message: 'Unexpected error occurred' }, 500);
}

function handleZodError(error: ZodError): APIGatewayProxyResultV2 {
  const missingFields = error.issues.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatApiResponse({ message: formattedMessage }, 400);
}

function handleZodFuncError(error: ZodError): LbdFuncResponse {
  const missingFields = error.issues.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatResponse({ message: formattedMessage }, 400);
}
