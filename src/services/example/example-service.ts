import {
  getExampleTableDescription as getExampleTableDesc,
  getExampleItemById as getExampleItemByIdRepo,
  getExampleByQuery as getExampleByQueryRepo,
  createExampleItem as createExampleItemRepo,
  updateExampleItem as updateExampleItemRepo,
} from '@/repository/example-repository';
import { QueryRequest } from '@/libs/dynamo';
import CustomError from '@/libs/error/custom-error';

export async function getExampleTableDescription(): Promise<object> {
  const tableDescription = await getExampleTableDesc();
  return tableDescription;
}

export async function getExampleItemById(id: string, keys?: string): Promise<object> {
  const item = await getExampleItemByIdRepo(id, keys);
  return item || { message: 'Item not found' };
}

export async function getExampleItemsByQuery(queryRequest: QueryRequest): Promise<object> {
  const response = await getExampleByQueryRepo(queryRequest);
  return response;
}

export async function createExampleItem(newItem: object): Promise<object> {
  const response = await createExampleItemRepo(newItem);
  if (!response) {
    throw new CustomError('Failed to create item', 500);
  }
  return response;
}

export async function updateExampleItem(exampleItem: object): Promise<object> {
  const response = await updateExampleItemRepo(exampleItem);
  if (!response) {
    throw new CustomError('Failed to create item', 500);
  }
  return response;
}
