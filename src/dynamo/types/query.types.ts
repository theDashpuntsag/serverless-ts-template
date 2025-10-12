import { z } from 'zod';

/**
 * Zod schema for a structured description of a DynamoDB Query request.
 * This drives generation of a key condition expression and related maps.
 */
export const queryRequestSchema = z
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
    limit: z.string().optional(),
    lastEvaluatedKey: z.string().optional(),
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

/** Runtime type inferred from {@link queryRequestSchema}. */
export type QueryRequest = z.infer<typeof queryRequestSchema>;
