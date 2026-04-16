import { z } from 'zod';

export const httpEventMetadataSch = z.object({
  token: z.string().optional(),
  ipAddress: z.string().optional(),
  headers: z.record(z.string(), z.unknown()).optional(),
  queryParams: z.record(z.string(), z.unknown()).optional(),
  body: z.unknown(),
});

export type HttpEventMetadata = z.infer<typeof httpEventMetadataSch>;

export const httpEventMetadataWithAuthSch = httpEventMetadataSch.extend({
  sub: z.string(),
  email: z.string(),
});

export type HttpEventMetadataWithAuth = z.infer<typeof httpEventMetadataWithAuthSch>;

export const httpEventMetadataWithAdminAuthSch = httpEventMetadataWithAuthSch.extend({
  permission: z.string(),
});

export type HttpEventMetadataWithAdminAuth = z.infer<typeof httpEventMetadataWithAdminAuthSch>;
