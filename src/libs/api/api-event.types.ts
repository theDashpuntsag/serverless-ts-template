import { z } from 'zod';

export const httpEventMetadataSch = z.object({
  token: z.string().optional(),
  ipAddress: z.string().optional(),
  headers: z.record(z.string(), z.unknown()).optional(),
  queryParams: z.record(z.string(), z.unknown()).optional(),
  body: z.any(),
});

export type HttpEventMetadata = z.infer<typeof httpEventMetadataSch>;
