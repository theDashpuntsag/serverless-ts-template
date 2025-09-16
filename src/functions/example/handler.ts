import { createApiGatewayFunction } from '@/libs';
import { QueryRequestSchema } from '@/libs/dynamo';
import { CustomError } from '@/libs/error';
import { extractMetadata } from '@/libs/lambda/auth';
import {
  createExampleItem,
  getExampleItemById as getExampleItemByIdService,
  getExampleItemsByQuery as getExampleItemsByQueryService,
  getExampleItemTableDesc as getExampleTableDescription,
  updateExampleItem,
} from '@/services/example';

/**
 *  Get example table description
 *
 */
export const getExampleTableDesc = createApiGatewayFunction<null>(async (_event) => {
  return await getExampleTableDescription();
});

/**
 *  Get example item by ID
 *
 */
export const getExampleItemById = createApiGatewayFunction<null>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
  const { id } = event.pathParameters;
  const response = await getExampleItemByIdService(id);
  if (!response) throw new CustomError(`Item with id: ${id} not found`, 404);
  return response;
});

/**
 *  Get example items by query
 *
 */
export const getExampleItemsByQuery = createApiGatewayFunction<object>(async (event) => {
  const { queryParams } = extractMetadata(event);
  if (!queryParams) throw new CustomError('Query params are missing!');
  const parseResult = QueryRequestSchema.safeParse({ indexName: queryParams.index, ...queryParams });

  if (!parseResult.success) {
    const validationErrors = parseResult.error.issues.map((err) => err.path).join(', ');
    throw new CustomError(`Query params are missing!, ${validationErrors}`);
  }

  return await getExampleItemsByQueryService(parseResult.data);
});

/**
 *  Create a new example item
 *
 */
export const postCreateExampleItem = createApiGatewayFunction<object>(async (event) => {
  const { body } = extractMetadata(event);
  if (!body) throw new CustomError('Request body is missing');
  return await createExampleItem(body);
});

/**
 *  Update an existing example item
 *
 */
export const putUpdateExampleItem = createApiGatewayFunction<object>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
  const { body } = extractMetadata(event);
  if (!body) throw new CustomError('Request body is missing');
  return await updateExampleItem(event.pathParameters.id, body);
});
