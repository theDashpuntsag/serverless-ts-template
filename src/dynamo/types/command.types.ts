import type { ReturnConsumedCapacity, ReturnItemCollectionMetrics, ReturnValue } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';
import { queryRequestSchema } from './query.types';

const returnConsumedCapacitySchema = z.enum(['INDEXES', 'TOTAL', 'NONE']);
const returnItemCollectionMetricsSchema = z.enum(['SIZE', 'NONE']);

/**
 * Zod schema describing inputs to a DynamoDB Get operation wrapper.
 * Use together with {@link CustomGetCommandInput} for runtime validation.
 */
export const CustomGetCommandInputSchema = z.object({
  /** The DynamoDB table name. */
  tableName: z.string(),
  /** Primary key map for the item to get. */
  key: z.record(z.string(), z.union([z.string(), z.number(), z.instanceof(Buffer)])),
  /** Optional projection expression limiting returned attributes. */
  projectionExpression: z.string().optional(),
  /** Optional attribute name substitutions for the projection expression. */
  expressionAttributeNames: z.record(z.string(), z.any()).optional(),
  /** Whether the read should be strongly consistent. */
  consistentRead: z.boolean().optional(),
  /** Throughput consumption details to return. */
  returnConsumedCapacity: returnConsumedCapacitySchema.optional(),
});

export type CustomGetCommandInput = z.infer<typeof CustomGetCommandInputSchema>;

/**
 * Zod schema describing inputs to a DynamoDB Query operation wrapper.
 * Combines a structured `queryRequest` with optional expressions and pagination hints.
 */
export const CustomQueryCommandInputSchema = z.object({
  /** The name of the DynamoDB table (required). */
  tableName: z.string(),
  /** Structured query parameters used to generate the key condition expression. */
  queryRequest: queryRequestSchema,
  /** Optional explicit key condition expression override. */
  keyConditionExpression: z.string().optional(),
  /** Optional filter expression applied after key conditions. */
  filterExpression: z.string().optional(),
  /** Substitution for attribute names used across expressions (optional). */
  expressionAttributeNames: z.record(z.string(), z.string()).optional(),
  /** Substitution for attribute values used across expressions (optional). */
  expressionAttributeValues: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
    .optional(),
  /** Extra substitution for attribute names (optional). */
  extraExpAttributeNames: z.record(z.string(), z.string()).optional(),
  /** Extra substitution for attribute values (optional). */
  extraExpAttributeValues: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
    .optional(),
  /** Attributes to retrieve (optional). */
  projectionExpression: z.string().optional(),
  /** Order in which to return the results (ascending if true) (optional). */
  scanIdxForward: z.boolean().optional(),
  /** Details about consumed capacity (optional). */
  returnConsumedCapacity: returnConsumedCapacitySchema.optional(),
});

export type CustomQueryCommandInput = z.infer<typeof CustomQueryCommandInputSchema>;

/**
 * Zod factory for typed query outputs. Provide the item schema to validate `items: T[]`.
 */
export const CustomQueryCommandOutputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    /** Opaque pagination cursor to resume querying; may be undefined on the last page. */
    lastEvaluatedKey: z.string().optional(),
    /** The list of items for this page. */
    items: z.array(itemSchema),
  });

/**
 * Output of a typed query. `lastEvaluatedKey` can be passed back for pagination.
 */
export type CustomQueryCommandOutput<T> = {
  /** Opaque pagination cursor to resume querying; undefined when no more pages. */
  lastEvaluatedKey: Record<string, unknown> | undefined;
  /** The list of items for this page. */
  items: T[];
};

/**
 * Zod factory describing inputs to a DynamoDB Put operation wrapper.
 */
export const CustomPutCommandInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    /** The name of the table (required). */
    tableName: z.string(),
    /** The item to be written (required). */
    item: itemSchema,
    /** A condition that must be satisfied for the operation to succeed (optional). */
    conditionExpression: z.string().optional(),
    /** A map of placeholder names to actual attribute names (optional). */
    expressionAttributeNames: z.record(z.string(), z.any()).optional(),
    /** A map of placeholder values to actual attribute values (optional). */
    expressionAttributeValues: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
      .optional(),
    /** Specifies what is returned (optional). */
    returnValues: z.enum(['NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW']).optional(),
    /** Specifies the level of consumed capacity details to return (optional). */
    returnConsumedCapacity: z.enum(['INDEXES', 'TOTAL', 'NONE']).optional(),
    /** Specifies whether item collection metrics are returned (optional). */
    returnItemCollectionMetrics: z.enum(['SIZE', 'NONE']).optional(),
  });

/**
 * Type representation of inputs to a DynamoDB Put operation wrapper.
 */
export type CustomPutCommandInput<T> = {
  /** The table name. */
  tableName: string;
  /** The item to put. */
  item: T;
  /** Optional condition expression for conditional writes. */
  conditionExpression?: string;
  /** Optional expression attribute names map. */
  expressionAttributeNames?: Record<string, string>;
  /** Optional expression attribute values map. */
  expressionAttributeValues?: Record<string, string>;
  /** What values to return from DynamoDB. */
  returnValues?: ReturnValue;
  /** Whether to return consumed capacity details. */
  returnConsumedCapacity?: ReturnConsumedCapacity;
  /** Whether to return item collection metrics. */
  returnItemCollectionMetrics?: ReturnItemCollectionMetrics;
};

/**
 * Zod factory describing inputs to a DynamoDB Update operation wrapper.
 */
export const CustomUpdateItemInputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    /** The table name. */
    tableName: z.string(),
    /** Primary key of the item to update. */
    key: z.record(z.string(), z.unknown()),
    /** One or more partial items used by higher-level flows; not required by the builder. */
    items: z.array(itemSchema),
    /** Explicit update expression; if omitted, it may be built dynamically by the helper. */
    updateExpression: z.string(),
    /** Optional condition expression. */
    conditionExpression: z.string().optional(),
    /** Substitution tokens for attribute names (optional). */
    expressionAttributeNames: z.record(z.string(), z.string()).optional(),
    /** Substitution tokens for attribute values (optional). */
    expressionAttributeValues: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.instanceof(Buffer)]))
      .optional(),
    /** Extra attribute name placeholders keys (optional). */
    extraExpAttributeNameKeys: z.string().optional(),
    /** Extra attribute value placeholder keys (optional). */
    extraExpressionAttributeValKeys: z.string().optional(),
    /** What values to return from DynamoDB after the update. */
    returnValues: z.string().optional(),
    /** Throughput consumption details to return. */
    returnConsumedCapacity: returnConsumedCapacitySchema.optional(),
    /** Whether to return item collection metrics. */
    returnItemCollectionMetrics: returnItemCollectionMetricsSchema.optional(),
  });

/**
 * Type representation of inputs to a DynamoDB Update operation wrapper used by builders.
 */
export type CustomUpdateItemInput<T> = {
  /** The table name. */
  tableName: string;
  /** Primary key of the item to update. */
  key: Record<string, unknown>;
  /** Partial entity with fields to set when generating expressions. */
  item?: Partial<T>;
  /** Explicit update expression; if omitted, it may be generated. */
  updateExpression?: string;
  /** Optional condition expression. */
  conditionExpression?: string;
  /** Substitution tokens for attribute names (optional). */
  expressionAttributeNames?: Record<string, string>;
  /** Substitution tokens for attribute values (optional). */
  expressionAttributeValues?: Record<string, string>;
  /** Extra attribute name placeholders (optional). */
  extraExpAttributeNames?: Record<string, string>;
  /** Extra attribute value placeholders (optional). */
  extraExpressionAttributeValues?: Record<string, unknown>;
  /** What values to return from DynamoDB. */
  returnValues?: ReturnValue;
  /** Throughput consumption details to return. */
  returnConsumedCapacity?: ReturnConsumedCapacity;
  /** Whether to return item collection metrics. */
  returnItemCollectionMetrics?: ReturnItemCollectionMetrics;
};
