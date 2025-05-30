/* eslint-disable no-undef */
import { createDefaultApiFunction } from '@/libs';

export const getExampleTableDesc = createDefaultApiFunction(
  __dirname,
  'getExampleTableDesc',
  'get',
  '/v1/example/table-desc'
);

export const getExampleItemById = createDefaultApiFunction(
  __dirname,
  'getExampleItemById',
  'get',
  '/v1/example/item/{id}'
);

export const getExampleItemsByQuery = createDefaultApiFunction(
  __dirname,
  'getExampleItemsByQuery',
  'get',
  '/v1/example/items'
);

export const postCreateExampleItem = createDefaultApiFunction(
  __dirname,
  'postCreateExampleItem',
  'post',
  '/v1/example/item'
);

export const putUpdateExampleItem = createDefaultApiFunction(
  __dirname,
  'putUpdateExampleItem',
  'put',
  '/v1/example/item'
);
