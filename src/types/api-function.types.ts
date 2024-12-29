import { z } from 'zod';

export const QueryParamsSchema = z.record(z.string());

export type QueryParams = z.infer<typeof QueryParamsSchema>;

export const RequestMetadataSchema = z.object({
  token: z.string().optional(),
  ipAddress: z.string().optional(),
  headers: z.object({}).passthrough(), // Allows any object
  queryParams: QueryParamsSchema.optional(),
  body: z.any(),
});

export type RequestMetadata = z.infer<typeof RequestMetadataSchema>;

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
