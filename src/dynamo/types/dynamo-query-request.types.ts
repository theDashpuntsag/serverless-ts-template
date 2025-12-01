import { z } from 'zod';

export const dynamoQueryRequestSch = z
  .object({
    pKey: z.string(),
    pKeyType: z.string(),
    pKeyProp: z.string(),
    sKey: z.string().optional(),
    sKeyType: z.string().optional(),
    sKeyProp: z.string().optional(),
    skValue2: z.string().optional(),
    skValue2Type: z.string().optional(),
    skComparator: z.string().optional(),
    indexName: z.string().optional(),
    limit: z.number().optional(),
    lastEvaluatedKey: z.object({}).optional(),
    sorting: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.skComparator) {
      if (!data.sKey) {
        ctx.addIssue({
          path: ['sKey'],
          message: 'sKey is required when skComparator is present',
          code: 'invalid_type',
          expected: 'string',
          received: typeof data.sKey,
        });
      }
      if (!data.sKeyProp) {
        ctx.addIssue({
          path: ['sKeyProp'],
          message: 'sKeyProp is required when skComparator is present',
          code: 'invalid_type',
          expected: 'string',
          received: typeof data.sKeyProp,
        });
      }
      if (!data.sKeyType) {
        ctx.addIssue({
          path: ['sKeyType'],
          message: 'sKeyType is required when skComparator is present',
          code: 'invalid_type',
          expected: 'string',
          received: typeof data.sKeyType,
        });
      }
    }
  });

export type DynamoQueryRequest = z.infer<typeof dynamoQueryRequestSch>;
