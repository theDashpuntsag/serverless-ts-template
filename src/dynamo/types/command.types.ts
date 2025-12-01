import { z } from 'zod';
import { dynamoQueryRequestSch } from './dynamo-query-request.types';

const returnConsumedCapacityOptionsSchema = z.enum(['INDEXES', 'TOTAL', 'NONE']);
const returnItemCollectionMetricsOptionsSchema = z.enum(['SIZE', 'NONE']);

export const customGetCommandInputSchema = z.object({
  tableName: z.string(),
  key: z.record(z.string(), z.unknown()),
  projectionExpression: z.string().optional(),
  expressionAttributeNames: z.record(z.string(), z.string()).optional(),
  consistentRead: z.boolean().optional(),
  returnConsumedCapacity: returnConsumedCapacityOptionsSchema.optional(),
});

export type CustomGetCommandInput = z.infer<typeof customGetCommandInputSchema>;

export const customQueryCommandInputSchema = z.object({
  tableName: z.string(),
  queryRequest: dynamoQueryRequestSch,
  keyConditionExpression: z.string().optional(),
  filterExpression: z.string().optional(),
  expressionAttributeNames: z.record(z.string(), z.string()).optional(),
  expressionAttributeValues: z.record(z.string(), z.unknown()).optional(),
  extraExpAttributeNames: z.record(z.string(), z.string()).optional(),
  extraExpAttributeValues: z.record(z.string(), z.unknown()).optional(),
  projectionExpression: z.string().optional(),
  scanIndexForward: z.boolean().optional(),
  returnConsumedCapacity: returnConsumedCapacityOptionsSchema.optional(),
});

export type CustomQueryCommandInput = z.infer<typeof customQueryCommandInputSchema>;

export const customPutCommandInputSchema = z.object({
  tableName: z.string(),
  item: z.record(z.string(), z.unknown()),
  conditionExpression: z.string().optional(),
  expressionAttributeNames: z.record(z.string(), z.string()).optional(),
  expressionAttributeValues: z.record(z.string(), z.unknown()).optional(),
  returnValues: z.enum(['NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW']).optional(),
  returnConsumedCapacity: returnConsumedCapacityOptionsSchema.optional(),
  returnItemCollectionMetrics: returnItemCollectionMetricsOptionsSchema.optional(),
});

export type CustomPutCommandInput = z.infer<typeof customPutCommandInputSchema>;

export const customUpdateCommandInputSchema = z.object({
  tableName: z.string(),
  key: z.record(z.string(), z.unknown()),
  item: z.record(z.string(), z.unknown()).optional(),
  updateExpression: z.string().optional(),
  conditionExpression: z.string().optional(),
  expressionAttributeNames: z.record(z.string(), z.string()).optional(), // Overwrite ExpressionAttributeNames
  expressionAttributeValues: z.record(z.string(), z.unknown()).optional(), // Overwrite ExpressionAttributeValues
  extraExpAttributeNames: z.record(z.string(), z.string()).optional(), // Add ExpressionAttributeNames without overwriting existing ones
  extraExpAttributeValues: z.record(z.string(), z.unknown()).optional(), // Add ExpressionAttributeValues without overwriting existing ones
  returnValues: z.enum(['NONE', 'ALL_OLD', 'UPDATED_OLD', 'ALL_NEW', 'UPDATED_NEW']).optional(),
  returnConsumedCapacity: returnConsumedCapacityOptionsSchema.optional(),
  returnItemCollectionMetrics: returnItemCollectionMetricsOptionsSchema.optional(),
});

export type CustomUpdateCommandInput = z.infer<typeof customUpdateCommandInputSchema>;
