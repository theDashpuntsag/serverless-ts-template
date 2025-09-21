import type { LbdFuncResponse as FuncRes } from '@/@types/util.types';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

export function formatResponse(response: object, statusCode: number = 200, other: object = {}): FuncRes {
  return {
    statusCode,
    body: JSON.stringify(response),
    ...other,
  };
}

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
