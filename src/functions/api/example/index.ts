import { createDefaultApiFunc } from '@/libs';

export const APIS_EXAMPLE = {
  getExampleTableDesc: createDefaultApiFunc({
    directory: __dirname,
    handlerFn: 'getExampleTableDesc',
    http: {
      method: 'GET',
      path: '/v1/example/table-desc',
    },
  }),
  getExampleItemById: createDefaultApiFunc({
    directory: __dirname,
    handlerFn: 'getExampleItemById',
    http: {
      method: 'GET',
      path: '/v1/example/item/{id}',
    },
  }),
  getExampleItemsByQuery: createDefaultApiFunc({
    directory: __dirname,
    handlerFn: 'getExampleItemsByQuery',
    http: {
      method: 'GET',
      path: '/v1/example/items',
    },
  }),
  postCreateExampleItem: createDefaultApiFunc({
    directory: __dirname,
    handlerFn: 'postCreateExampleItem',
    http: {
      method: 'POST',
      path: '/v1/example/item',
    },
  }),
  putUpdateExampleItem: createDefaultApiFunc({
    directory: __dirname,
    handlerFn: 'putUpdateExampleItem',
    http: {
      method: 'PUT',
      path: '/v1/example/item',
    },
  }),
};
