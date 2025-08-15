import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import { ZodError } from 'zod';
import { formatApiResponse, formatResponse } from '@/libs';
import axios, { AxiosError } from 'axios';
import CustomError from './custom-error';
import { LbdFuncResponse } from '@/types';
import { logger } from '@/libs';

export function logErrorMessage(error: unknown, func: string = 'Error'): void {
  if (axios.isAxiosError(error)) {
    logger.error(`Axios err ${func}: ${error.message}`);
    return;
  }
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

export function handleApiFuncError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof Error) logger.error(`Error occurred!: ${JSON.stringify(error.message)}`);
  if (axios.isAxiosError(error)) return handleAxiosApiError(error);
  if (error instanceof CustomError) return formatApiResponse({ message: error.message }, error.statusCode);
  if (error instanceof ZodError) return handleZodError(error);
  return formatApiResponse({ message: 'Unexpected error occurred' }, 500);
}

export function handleDefaultError(error: unknown): LbdFuncResponse {
  if (error instanceof Error) logger.error(`Error occurred!: ${JSON.stringify(error.message)}`);
  if (axios.isAxiosError(error)) return handleAxiosFuncError(error);
  if (error instanceof CustomError) return formatResponse({ message: error.message }, error.statusCode);
  if (error instanceof ZodError) return handleZodFuncError(error);
  return formatResponse({ message: 'Unexpected error occurred' }, 500);
}

function handleZodError(error: ZodError): APIGatewayProxyResultV2 {
  const missingFields = error.errors.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatApiResponse({ message: formattedMessage }, 400);
}

function handleZodFuncError(error: ZodError): LbdFuncResponse {
  const missingFields = error.errors.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatResponse({ message: formattedMessage }, 400);
}

function handleAxiosApiError(error: AxiosError): APIGatewayProxyResultV2 {
  logger.error('Axios error in API function:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data || { message: 'Unknown API error' };
  return formatApiResponse({ message }, status);
}

const handleAxiosFuncError = (error: AxiosError): LbdFuncResponse => {
  logger.error('Axios error in function:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data || 'Unknown function error';
  return formatResponse({ message }, status);
};
