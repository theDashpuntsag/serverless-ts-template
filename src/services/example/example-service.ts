import type { APIGatewayProxyResultV2 as APIResponse } from 'aws-lambda';

import { formatJSONApiResponse } from '@libs/format';
import {
  getExampleTableDescription as getExampleTableDesc,
  getExampleItemById as getExampleItemByIdRepo,
  getExampleByQuery as getExampleByQueryRepo,
  createExampleItem as createExampleItemRepo,
  updateExampleItem as updateExampleItemRepo,
} from '@repository/example-repository';
import { QueryRequest } from '@type/dynamo.types';
import CustomError from '@configs/custom-error';

export async function getExampleTableDescription(): Promise<APIResponse> {
  const tableDescription = await getExampleTableDesc();
  return formatJSONApiResponse(tableDescription);
}

export async function getExampleItemById(id: string, keys?: string): Promise<APIResponse> {
  const item = await getExampleItemByIdRepo(id, keys);
  return item ? formatJSONApiResponse(item) : formatJSONApiResponse({ message: 'Item not found' }, 404);
}

export async function getExampleItemsByQuery(queryRequest: QueryRequest): Promise<APIResponse> {
  const response = await getExampleByQueryRepo(queryRequest);
  return formatJSONApiResponse(response);
}

export async function createExampleItem(newItem: object): Promise<APIResponse> {
  const response = await createExampleItemRepo(newItem);
  if (!response) {
    throw new CustomError('Failed to create item', 500);
  }
  return formatJSONApiResponse(response);
}

export async function updateExampleItem(exampleItem: object): Promise<APIResponse> {
  const response = await updateExampleItemRepo(exampleItem);
  if (!response) {
    throw new CustomError('Failed to create item', 500);
  }
  return formatJSONApiResponse(response);
}
