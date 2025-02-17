import type { CustomAPIGatewayEvent as ApiFunc } from '@/libs/api-gateway';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import { formatApiResponse } from '@/libs/response-format';
import { middyfy } from '@/libs/middyfy';
import { logger } from '@/libs';
import { handleApiFuncError } from '@/error';

const testFunction: ApiFunc<object> = async (event): Promise<ApiFuncRes> => {
  try {
    logger.info(`Event: ${JSON.stringify(event.body)}`);
    return formatApiResponse(event.body);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const testFunc = middyfy(testFunction);
