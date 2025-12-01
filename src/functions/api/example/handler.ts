import { extractQueryParamsFromEvent } from '@/dynamo';
import { CustomError } from '@/libs/error';
import { createHttpHandler } from '@/libs/functions';
import {
  createExampleItem,
  getExampleItemById as getExampleItemByIdService,
  getExampleItemsByQuery as getExampleItemsByQueryService,
  getExampleItemTableDesc as getExampleTableDescription,
  updateExampleItem,
} from '@/services/example';
import { extractMetadataFromEvent } from '../../../libs/api';

/**
 *  Get example table description
 */
export const getExampleTableDesc = createHttpHandler<null>(async (_event) => {
  return await getExampleTableDescription();
});

/**
 *  Get example item by ID
 */
export const getExampleItemById = createHttpHandler<null>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
  const { id } = event.pathParameters;
  const response = await getExampleItemByIdService(id);
  if (!response) throw new CustomError(`Item with id: ${id} not found`, 404);
  return response;
});

/**
 *  Get example items by query
 */
export const getExampleItemsByQuery = createHttpHandler<object>(async (event) => {
  const { queryParams } = extractMetadataFromEvent(event);
  if (!queryParams) throw new CustomError('Query params are missing!');

  const queryRequest = extractQueryParamsFromEvent(event, {
    indexName: 'status-createdAt-index',
    pKey: `PENDING`,
    pKeyType: 'S',
    pKeyProp: 'status',
    ...queryParams,
  });

  return await getExampleItemsByQueryService(queryRequest);
});

/**
 *  Create a new example item
 */
export const postCreateExampleItem = createHttpHandler<object>(async (event) => {
  const { body } = extractMetadataFromEvent(event);
  if (!body) throw new CustomError('Request body is missing');
  return await createExampleItem(body);
});

/**
 *  Update an existing example item
 */
export const putUpdateExampleItem = createHttpHandler<object>(async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) throw new CustomError(`Path variable is missing`);
  const { body } = extractMetadataFromEvent(event);
  if (!body) throw new CustomError('Request body is missing');
  return await updateExampleItem(body);
});
