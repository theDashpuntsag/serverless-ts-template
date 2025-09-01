import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';

export const middyfy = (handler: object) => {
  return middy(handler).use(middyJsonBodyParser());
};
