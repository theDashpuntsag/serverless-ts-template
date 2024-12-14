import type { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

export type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: S };
export type CustomAPIGatewayEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResultV2>;
