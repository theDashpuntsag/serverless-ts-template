import { createDefaultApiGatewayFunc } from '@libs/generate';

export const printHelloWorld = createDefaultApiGatewayFunc(__dirname, 'printHelloWorld', 'post', '/v1/test');
