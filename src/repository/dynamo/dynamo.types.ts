import type { ReturnConsumedCapacity, ReturnItemCollectionMetrics, ReturnValue } from '@aws-sdk/client-dynamodb';
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
const returnConsumedCapacitySchema = z.enum(['INDEXES', 'TOTAL', 'NONE']);
const returnItemCollectionMetricsSchema = z.enum(['SIZE', 'NONE']);

export const CustomGetCommandInputSchema = z.object({
  tableName: z.string(),
  key: z.record(z.string(), z.union([z.string(), z.number(), z.instanceof(Buffer)])),
  projectionExpression: z.string().optional(),
  expressionAttributeNames: z.record(z.string(), z.any()).optional(),
  consistentRead: z.boolean().optional(),
  returnConsumedCapacity: returnConsumedCapacitySchema.optional(),
});

export type CustomGetCommandInput = z.infer<typeof CustomGetCommandInputSchema>;

export const CustomQueryCommandInputSchema = z.object({
  tableName: z.string(), // The name of the DynamoDB table (required)
  queryRequest: QueryRequestSchema, // QueryRequest to create keyConditionExpression
  keyConditionExpression: z.string().optional(),
  filterExpression: z.string().optional(), // A condition to filter the items returned (optional)
  expressionAttributeNames: z.record(z.string(), z.string()).optional(), // Substitution for attribute names (optional)
  expressionAttributeValues: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
    .optional(), // Substitution for attribute values (optional)
  extraExpAttributeNames: z.record(z.string(), z.string()).optional(), // Extra substitution for attribute names (optional)
  extraExpAttributeValues: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
    .optional(), // Extra substitution for attribute values (optional)
  projectionExpression: z.string().optional(), // Attributes to retrieve (optional)
  scanIdxForward: z.boolean().optional(), // Order in which to return the results (ascending if true) (optional)
  returnConsumedCapacity: returnConsumedCapacitySchema.optional(), // Details about consumed capacity (optional)
});

export type CustomQueryCommandInput = z.infer<typeof CustomQueryCommandInputSchema>;

export const CustomQueryCommandOutputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    lastEvaluatedKey: z.string().optional(),
    items: z.array(itemSchema),
  });

export type CustomQueryCommandOutput<T> = {
  lastEvaluatedKey: string | undefined;
  items: T[];
};

export const CustomPutCommandInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    tableName: z.string(), // The name of the table (required).
    item: itemSchema, // The item to be written (required).
    conditionExpression: z.string().optional(), // A condition that must be satisfied for the operation to succeed (optional).
    expressionAttributeNames: z.record(z.string(), z.any()).optional(), // A map of placeholder names to actual attribute names (optional).
    expressionAttributeValues: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
      .optional(), // A map of placeholder values to actual attribute values (optional).
    returnValues: z.enum(['NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW']).optional(), // Specifies what is returned (optional).
    returnConsumedCapacity: z.enum(['INDEXES', 'TOTAL', 'NONE']).optional(), // Specifies the level of consumed capacity details to return (optional).
    returnItemCollectionMetrics: z.enum(['SIZE', 'NONE']).optional(), // Specifies whether item collection metrics are returned (optional).
  });

export type CustomPutCommandInput<T> = {
  tableName: string;
  item: T;
  conditionExpression?: string;
  expressionAttributeNames?: Record<string, any>;
  expressionAttributeValues?: Record<string, any>;
  returnValues?: ReturnValue;
  returnConsumedCapacity?: ReturnConsumedCapacity;
  returnItemCollectionMetrics?: ReturnItemCollectionMetrics;
};

export const CustomUpdateItemInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    tableName: z.string(),
    key: z.record(z.any()),
    items: z.array(itemSchema),
    updateExpression: z.string(), // The update expression specifying attributes to update (required)
    conditionExpression: z.string().optional(),
    expressionAttributeNames: z.record(z.string(), z.string()).optional(), // Substitution tokens for attribute names (optional)
    expressionAttributeValues: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
      .optional(),
    extraExpAttributeNameKeys: z.string().optional(),
    extraExpressionAttributeValKeys: z.string().optional(),
    returnValues: z.string().optional(),
    returnConsumedCapacity: returnConsumedCapacitySchema.optional(),
    returnItemCollectionMetrics: returnItemCollectionMetricsSchema.optional(),
  });

export type CustomUpdateItemInput<T> = {
  tableName: string;
  key: Record<string, any>;
  item: Partial<T>;
  updateExpression?: string;
  conditionExpression?: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, any>;
  extraExpAttributeNames?: Record<string, any>;
  extraExpressionAttributeValues?: Record<string, any>;
  returnValues?: ReturnValue;
  returnConsumedCapacity?: ReturnConsumedCapacity;
  returnItemCollectionMetrics?: ReturnItemCollectionMetrics;
};
