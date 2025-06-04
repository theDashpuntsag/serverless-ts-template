import { createDefaultApiFunction } from '@/libs';

export const testFunc = createDefaultApiFunction(__dirname, 'testFunc', 'post', '/v1/test');
