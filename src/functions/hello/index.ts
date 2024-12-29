import { createDefaultApiFunction } from '@libs/functions';

export const testFunc = createDefaultApiFunction(__dirname, 'testFunc', 'post', '/v1/test');
