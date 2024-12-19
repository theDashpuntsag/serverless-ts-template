import { z } from 'zod';

// ------------------------------------ Non-generic types --------------------------------------------------
export const QueryOptionsSchema = z
  .object({
    ProjectionExpression: z.string().optional(),
    ScanIndexForward: z.boolean().optional(),
    FilterExpression: z.string().optional(),
  })
  .optional();

export type QueryOptions = z.infer<typeof QueryOptionsSchema>;

export const QueryRequestSchema = z.object({
  pKey: z.string().min(1, 'Partition key is required'),
  pKeyType: z.string().min(1, 'Partition key type is required'),
  pKeyProp: z.string().min(1, 'Partition key property is required'),
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
  options: QueryOptionsSchema,
});

export type QueryRequest = z.infer<typeof QueryRequestSchema>;

export const CustomGetCommandInputSchema = z.object({
  tableName: z.string(),
  key: z.string(),
  value: z.any(),
  options: QueryOptionsSchema,
});

export type CustomGetCommandInput = z.infer<typeof CustomGetCommandInputSchema>;

// ------------------------------------ Generic types --------------------------------------------------
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
  });

export type CustomUpdateItemInput<T> = {
  tableName: string;
  key: Record<string, any>;
  item: Partial<T>;
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
