import type { CustomAPIGatewayEvent as ApiFunc } from '@libs/api-gateway';
import type { APIGatewayProxyResultV2 as ApiFuncRes } from 'aws-lambda';

import {
  getExampleTableDescription,
  getExampleItemById as getExampleItemByIdService,
  getExampleItemsByQuery as getExampleItemsByQueryService,
  createExampleItem,
} from '@services/example';
import { handleApiFuncError } from '@libs/error';
import { middyfy } from '@libs/middyfy';
import { extractMetadata } from '@services/utils/cognito-auth-service';
import { QueryRequestSchema } from '@type/dynamo.types';
import CustomError from '@configs/custom-error';

const getExampleTableDescFunc: ApiFunc<null> = async (): Promise<ApiFuncRes> => {
  try {
    return await getExampleTableDescription();
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getExampleItemByIdFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
    const { id } = event.pathParameters;
    return await getExampleItemByIdService(id);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const getExampleItemsByQueryFunc: ApiFunc<null> = async (event): Promise<ApiFuncRes> => {
  try {
    const { queryParams } = extractMetadata(event);
    if (!queryParams) throw new CustomError('Query params are missing!');
    const parseResult = QueryRequestSchema.safeParse({ indexName: queryParams.index, ...queryParams });

    if (!parseResult.success) {
      const validationErrors = parseResult.error.errors.map((err) => err.path).join(', ');
      throw new CustomError(`Query params are missing!, ${validationErrors}`);
    }

    return await getExampleItemsByQueryService(parseResult.data);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const postCreateExampleItemFunc: ApiFunc<object> = async (event): Promise<ApiFuncRes> => {
  try {
    const { body } = extractMetadata(event);
    if (!body) throw new CustomError('Request body is missing');
    return await createExampleItem(body as object);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

const putUpdateExampleItemFunc: ApiFunc<object> = async (event): Promise<ApiFuncRes> => {
  try {
    const { body } = extractMetadata(event);
    if (!body) throw new CustomError('Request body is missing');
    return await createExampleItem(body as object);
  } catch (error: unknown) {
    return handleApiFuncError(error);
  }
};

export const getExampleTableDesc = middyfy(getExampleTableDescFunc);
export const getExampleItemById = middyfy(getExampleItemByIdFunc);
export const getExampleItemsByQuery = middyfy(getExampleItemsByQueryFunc);
export const postCreateExampleItem = middyfy(postCreateExampleItemFunc);
export const putUpdateExampleItem = middyfy(putUpdateExampleItemFunc);
