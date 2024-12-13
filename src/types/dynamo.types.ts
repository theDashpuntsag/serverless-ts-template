import { z } from 'zod';

export type CustomQueryCommandInput = {
  tableName: string;
  lastEvaluatedKey?: string;
  keyConditionExpression: string;
  expressionAttributeValues: Record<string, any>;
  options?: {
    indexName?: string;
    filterExpression?: string;
    projectionExpression?: string;
    limit?: number;
    scanIndexForward?: boolean;
  };
};

export const CustomQueryCommandInputSchema = z.object({
  tableName: z.string(),
  lastEvaluatedKey: z.string().optional(),
  keyConditionExpression: z.string(),
  expressionAttributeValues: z.record(z.any()),
  options: z
    .object({
      indexName: z.string().optional(),
      filterExpression: z.string().optional(),
      projectionExpression: z.string().optional(),
      limit: z.number().optional(),
      scanIndexForward: z.boolean().optional(),
    })
    .optional(),
});

export type CustomPutCommandInput<T> = {
  tableName: string;
  item: T;
};

export const CustomPutCommandInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    tableName: z.string(),
    item: itemSchema,
  });

export type CustomUpdateItemInput<T> = {
  tableName: string;
  key: Record<string, any>;
  item: Partial<T>;
};

export const CustomUpdateItemInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    tableName: z.string(),
    key: z.record(z.any()),
    items: z.array(itemSchema),
  });

export type CustomGetCommandInput = {
  tableName: string;
  key: string;
  value: any;
};

export const CustomGetCommandInputSchema = z.object({
  tableName: z.string(),
  key: z.string(),
  value: z.any(),
});

export type CustomQueryCommandOutput<T> = {
  lastEvaluatedKey: string | undefined;
  items: T[];
};

export const CustomQueryCommandOutputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    lastEvaluatedKey: z.string().optional(),
    items: z.array(itemSchema),
  });
