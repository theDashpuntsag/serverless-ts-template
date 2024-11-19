import { CustomAPIGatewayEvent as ApiFunType } from '@libs/api-gateway';
import { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';
import { formatJSONApiResponse } from '@libs/format';
import { middyfy } from '@libs/middyfy';
import { handleApiFuncError } from '@libs/error';
import logger from '@libs/winston';

const printHelloWorldFunc: ApiFunType<object> = async (event): Promise<ApiFuncRes> => {
  try {
    logger.info(`Event: ${JSON.stringify(event.body)}`);
    return formatJSONApiResponse(event.body);
  } catch (error: unknown) {
    logger.error(`Error occurred on printHelloWorldFunc: ${JSON.stringify(error)}`);
    return handleApiFuncError(error);
  }
};

export const printHelloWorld = middyfy(printHelloWorldFunc);
