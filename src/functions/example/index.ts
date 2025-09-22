import { createDefaultApiFunction } from '@/libs';

export const APIS_EXAMPLE = {
  getExampleTableDesc: createDefaultApiFunction(__dirname, 'getExampleTableDesc', 'get', '/v1/example/table-desc'),
  getExampleItemById: createDefaultApiFunction(__dirname, 'getExampleItemById', 'get', '/v1/example/item/{id}'),
  getExampleItemsByQuery: createDefaultApiFunction(__dirname, 'getExampleItemsByQuery', 'get', '/v1/example/items'),
  postCreateExampleItem: createDefaultApiFunction(__dirname, 'postCreateExampleItem', 'post', '/v1/example/item'),
  putUpdateExampleItem: createDefaultApiFunction(__dirname, 'putUpdateExampleItem', 'put', '/v1/example/item'),
};
