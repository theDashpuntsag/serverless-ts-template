import { createDefaultApiFunction } from '@/libs';

export const APIS_EXAMPLE = {
  getExampleTableDesc: createDefaultApiFunction({
    dir: __dirname,
    fn: 'getExampleTableDesc',
    http: {
      method: 'GET',
      url: '/v1/example/table-desc',
    },
  }),
  getExampleItemById: createDefaultApiFunction({
    dir: __dirname,
    fn: 'getExampleItemById',
    http: {
      method: 'GET',
      url: '/v1/example/item/{id}',
    },
  }),
  getExampleItemsByQuery: createDefaultApiFunction({
    dir: __dirname,
    fn: 'getExampleItemsByQuery',
    http: {
      method: 'GET',
      url: '/v1/example/items',
    },
  }),
  postCreateExampleItem: createDefaultApiFunction({
    dir: __dirname,
    fn: 'postCreateExampleItem',
    http: {
      method: 'POST',
      url: '/api/v1/example/item',
    },
  }),
  putUpdateExampleItem: createDefaultApiFunction({
    dir: __dirname,
    fn: 'putUpdateExampleItem',
    http: {
      method: 'PUT',
      url: '/api/v1/example/item',
    },
  }),
};
