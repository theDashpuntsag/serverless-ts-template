import type { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

import { z } from 'zod';

export type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: S };
export type CustomAPIGatewayHandler<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResultV2>;

export const QueryParamsSchema = z.record(z.string(), z.unknown());

export type QueryParams = z.infer<typeof QueryParamsSchema>;

export const CognitoIdTokenSchema = z.object({
  sub: z.string(),
  email_verified: z.boolean(),
  iss: z.string(),
  'cognito:username': z.string(),
  origin_jti: z.string(),
  aud: z.string(),
  event_id: z.string(),
  token_use: z.string(),
  auth_time: z.number(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string(),
  email: z.string(),
});

export type CognitoIdToken = z.infer<typeof CognitoIdTokenSchema>;
