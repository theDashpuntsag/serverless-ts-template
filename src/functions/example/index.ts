import { createDefaultApiGatewayFunc } from '@libs/generate';

export const getExampleTableDesc = createDefaultApiGatewayFunc(
  __dirname,
  'getExampleTableDesc',
  'get',
  '/v1/example/table-desc'
);

export const getExampleItemById = createDefaultApiGatewayFunc(
  __dirname,
  'getExampleItemById',
  'get',
  '/v1/example/item/{id}'
);

export const getExampleItemsByQuery = createDefaultApiGatewayFunc(
  __dirname,
  'getExampleItemsByQuery',
  'get',
  '/v1/example/items'
);

export const postCreateExampleItem = createDefaultApiGatewayFunc(
  __dirname,
  'postCreateExampleItem',
  'post',
  '/v1/example/item'
);

export const putUpdateExampleItem = createDefaultApiGatewayFunc(
  __dirname,
  'putUpdateExampleItem',
  'put',
  '/v1/example/item'
);
