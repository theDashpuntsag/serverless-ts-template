import { createDefaultApiFunction } from '@/libs';

export const APIS_EXAMPLE = {
  getExampleTableDesc: createDefaultApiFunction({
    dir: __dirname,
    fnName: 'getExampleTableDesc',
    http: {
      method: 'GET',
      url: '/v1/example/table-desc',
    },
  }),
  getExampleItemById: createDefaultApiFunction({
    dir: __dirname,
    fnName: 'getExampleItemById',
    http: {
      method: 'GET',
      url: '/v1/example/item/{id}',
    },
  }),
  getExampleItemsByQuery: createDefaultApiFunction({
    dir: __dirname,
    fnName: 'getExampleItemsByQuery',
    http: {
      method: 'GET',
      url: '/v1/example/items',
    },
  }),
  postCreateExampleItem: createDefaultApiFunction({
    dir: __dirname,
    fnName: 'postCreateExampleItem',
    http: {
      method: 'POST',
      url: '/api/v1/example/item',
    },
  }),
  putUpdateExampleItem: createDefaultApiFunction({
    dir: __dirname,
    fnName: 'putUpdateExampleItem',
    http: {
      method: 'PUT',
      url: '/api/v1/example/item',
    },
  }),
};
