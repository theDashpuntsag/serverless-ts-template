import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import type { LbdFuncResponse } from '@type/util.types';

import { formatJSONApiResponse as formatJSONApiRes, formatJSONResponse } from './format';
import { ZodError } from 'zod';
import axios, { AxiosError } from 'axios';
import logger from './winston';
import CustomError from '@configs/custom-error';

function handleApiFuncError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof Error) logger.error(`${error.message}`);
  if (axios.isAxiosError(error)) return handleAxiosApiError(error);
  if (error instanceof CustomError) return formatJSONApiRes({ error: { message: error.message } }, error.statusCode);
  if (error instanceof ZodError) return handleZodError(error);
  if (error instanceof TypeError) return formatJSONApiRes({ error: { message: 'Type error!' } }, 400);
  if (error instanceof ReferenceError) return formatJSONApiRes({ error: { message: 'Reference error!' } }, 400);
  if (error instanceof Error) return formatJSONApiRes({ error: { message: 'Generic error!' } }, 400);
  return formatJSONApiRes({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleDefaultError(error: unknown): LbdFuncResponse {
  if (error instanceof Error) logger.error(`Function Error occurred: ${error.message}`);
  if (axios.isAxiosError(error)) return handleAxiosFuncError(error);
  if (error instanceof CustomError) return formatJSONResponse({ error: { message: error.message } }, error.statusCode);
  if (error instanceof ZodError) return handleZodFuncError(error);
  if (error instanceof TypeError) return formatJSONResponse({ error: { message: 'Type error!' } }, 400);
  if (error instanceof ReferenceError) return formatJSONResponse({ error: { message: 'Reference error!' } }, 400);
  if (error instanceof Error) return formatJSONResponse({ error: { message: 'Generic error!' } }, 400);
  return formatJSONResponse({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleZodError(error: ZodError): APIGatewayProxyResultV2 {
  const missingFields = error.errors.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Bad request! Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatJSONApiRes({ error: { message: formattedMessage } }, 400);
}

function handleZodFuncError(error: ZodError): LbdFuncResponse {
  const missingFields = error.errors.map((err) => err.path.join('.') || 'unknown field');
  const formattedMessage = `Bad request! Missing or invalid fields: ${missingFields.join(', ')}`;
  return formatJSONResponse({ error: { message: formattedMessage } }, 400);
}

function handleAxiosApiError(error: AxiosError): APIGatewayProxyResultV2 {
  logger.error('Axios error in API function:', error);
  const status = error.response?.status || 500;
  const errorData = error.response?.data || { message: 'Unknown API error' };
  return formatJSONApiRes({ error: errorData }, status);
}

const handleAxiosFuncError = (error: AxiosError): LbdFuncResponse => {
  logger.error('Axios error in function:', error);
  const status = error.response?.status || 500;
  const errorData = error.response?.data || { message: 'Unknown function error' };
  return formatJSONResponse({ error: errorData }, status);
};

export { handleApiFuncError, handleDefaultError };
