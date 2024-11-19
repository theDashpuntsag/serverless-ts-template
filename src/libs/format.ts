import { LbdFuncResponse } from '@type/util.types';
import { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

export function formatJSONResponse(response: object, statusCode: number = 200, other: object = {}): LbdFuncResponse {
  return {
    statusCode,
    body: JSON.stringify(response),
    ...other,
  };
}

export function formatJSONApiResponse(response: object, statusCode: number = 200, other: object = {}): ApiFuncRes {
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
