import { APIGatewayProxyResultV2 } from 'aws-lambda';
import logger from './winston';
import { formatJSONApiResponse, formatJSONResponse } from './format';
import axios, { AxiosError } from 'axios';
import CustomError from '@configs/custom-error';
import { LbdFuncResponse } from '@type/util.types';

function handleApiFuncError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof Error) logger.error(`API Error occurred: ${error.message}`);
  if (axios.isAxiosError(error)) return handleAxiosApiError(error);
  if (error instanceof Error) return formatJSONApiResponse({ error: { message: 'Generic error!' } }, 400);
  if (error instanceof TypeError) return formatJSONApiResponse({ error: { message: 'Type error!' } }, 400);
  if (error instanceof ReferenceError) return formatJSONApiResponse({ error: { message: 'Reference error!' } }, 400);
  if (error instanceof CustomError)
    return formatJSONApiResponse({ error: { message: error.message } }, error.statusCode);
  return formatJSONApiResponse({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleDefaultError(error: unknown): LbdFuncResponse {
  if (error instanceof Error) logger.error(`Function Error occurred: ${error.message}`);
  if (axios.isAxiosError(error)) return handleAxiosFuncError(error);
  if (error instanceof Error) return formatJSONResponse({ error: { message: 'Generic error!' } }, 400);
  if (error instanceof TypeError) return formatJSONResponse({ error: { message: 'Type error!' } }, 400);
  if (error instanceof ReferenceError) return formatJSONResponse({ error: { message: 'Reference error!' } }, 400);
  if (error instanceof CustomError) return formatJSONResponse({ error: { message: error.message } }, error.statusCode);
  return formatJSONResponse({ error: { message: 'Unexpected error occurred' } }, 500);
}

function handleAxiosApiError(error: AxiosError): APIGatewayProxyResultV2 {
  logger.error('Axios error in API function:', error);
  const status = error.response?.status || 500;
  const errorData = error.response?.data || { message: 'Unknown API error' };
  return formatJSONApiResponse({ error: errorData }, status);
}

const handleAxiosFuncError = (error: AxiosError): LbdFuncResponse => {
  logger.error('Axios error in function:', error);
  const status = error.response?.status || 500;
  const errorData = error.response?.data || { message: 'Unknown function error' };
  return formatJSONResponse({ error: errorData }, status);
};

export { handleApiFuncError, handleDefaultError };
