import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';

// ------------------------------------ Custom types --------------------------------------------------
export const QueryRequestSchema = z
  .object({
    pKey: z.string(),
    pKeyType: z.string(),
    pKeyProp: z.string(),
    sKey: z.string().optional(),
    sKeyType: z.string().optional(),
    sKeyProp: z.string().optional(),
    skValue2: z.string().optional(),
    skValue2Type: z.string().optional(),
    skValue2Prop: z.string().optional(),
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

export type QueryRequest = z.infer<typeof QueryRequestSchema>;

// ------------------------------------ Input types --------------------------------------------------
export const CustomQueryCommandInputSchema = z.object({
  tableName: z.string(),
  queryRequest: QueryRequestSchema,
  extraExpAttributeNames: z.record(z.string()).optional(),
  extraExpAttributeValues: z.record(z.any()).optional(),
  projectionExp: z.string().optional(),
  scanIdxForward: z.boolean().optional(),
  filterExp: z.string().optional(),
});

export type CustomQueryCommandInput = z.infer<typeof CustomQueryCommandInputSchema>;

export const CustomGetCommandInputSchema = z.object({
  tableName: z.string(),
  key: z.record(z.string(), z.any()),
  projectionExp: z.string().optional(),
  extraExpAttributeNames: z.record(z.string()).optional(),
});

export type CustomGetCommandInput = z.infer<typeof CustomGetCommandInputSchema>;

export const CustomPutCommandInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    tableName: z.string(),
    item: itemSchema,
  });

export type CustomPutCommandInput<T> = {
  tableName: string;
  item: T;
};

export const CustomUpdateItemInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    tableName: z.string(),
    key: z.record(z.any()),
    items: z.array(itemSchema),
    conditionalExp: z.string().optional(),
    extraExpAttributeNameKeys: z.string().optional(),
    extraExpressionAttributeValKeys: z.string().optional(),
    returnValues: z.string().optional(),
  });

export type CustomUpdateItemInput<T> = {
  tableName: string;
  key: Record<string, any>;
  item: Partial<T>;
  conditionalExp?: string;
  extraExpAttributeNameKeys?: string;
  extraExpressionAttributeValues?: Record<string, any>;
  returnValues?: ReturnValue;
};

export const CustomQueryCommandOutputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    lastEvaluatedKey: z.string().optional(),
    items: z.array(itemSchema),
  });

export type CustomQueryCommandOutput<T> = {
  lastEvaluatedKey: string | undefined;
  items: T[];
};
