import { createDefaultApiGatewayFunc } from '@libs/generate';

export const testFunc = createDefaultApiGatewayFunc(__dirname, 'testFunc', 'post', '/v1/test');
