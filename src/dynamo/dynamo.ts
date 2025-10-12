/**
 * High-level, typed helpers around AWS DynamoDB (SDK v3) using the DocumentClient.
 *
 * This module exposes small, strongly-typed primitives for common access
 * patterns (Get, Query, Put, Update) and a utility for describing a table.
 *
 * Design notes
 * - Uses a single shared {@link DynamoDBDocumentClient} instance for efficiency.
 * - All helpers are generics, so you can provide the concrete item shape via `T`.
 * - Errors from AWS are passed through; unexpected values are wrapped in {@link CustomError}.
 * - The default AWS region falls back to `ap-southeast-1` when `AWS_REGION` is not set.
 *
 * See also
 * - {@link ./types | Dynamo custom input/output types}
 * - AWS SDK v3 clients: {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/index.html}
 */
import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type {
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandInput,
  CustomQueryCommandOutput,
  CustomUpdateItemInput,
} from './types';

import { logger } from '@/libs';
import { CustomError } from '@/libs/error';
import { DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import * as build from './command';

/**
 * Initialize low-level DynamoDB client.
 * @internal
 */
const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
/**
 * Shared DocumentClient used by all helpers in this module.
 * @internal
 */
const docClient = DynamoDBDocumentClient.from(dynamoDb);

/**
 * Describe a DynamoDB table by name.
 *
 * This is a thin wrapper over {@link DescribeTableCommand}. It is useful for health checks,
 * migrations, or debugging table settings (e.g., key schema, throughput modes, GSIs).
 *
 * Contract
 * - Input: the DynamoDB table name.
 * - Output: the raw {@link DescribeTableCommandOutput} from AWS.
 * - Error: rethrows AWS service exceptions; wraps unknown errors.
 *
 * @param tableName - The exact table name to describe.
 * @returns The AWS response describing the table.
 * @throws {@link Error} When the table cannot be described (e.g., not found or IAM denied).
 *
 * @example
 * ```ts
 * const info = await getTableDescription(process.env.TABLE_NAME!);
 * console.log(info.Table?.KeySchema);
 * ```
 */
export async function getTableDescription(tableName: string): Promise<DescribeTableCommandOutput> {
  try {
    return await docClient.send(new DescribeTableCommand({ TableName: tableName }));
  } catch (error: unknown) {
    logger.error(`Failed to retrieve table description for "${tableName}":`, error);
    throw new Error(`Unable to describe table "${tableName}": ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Get a single item by primary key.
 *
 * Provide a concrete type for `T` to get full type-safety for the returned item.
 * When no item exists for the provided key, `undefined` is returned.
 *
 * Contract
 * - Input: {@link CustomGetCommandInput} containing table name and key.
 * - Output: the item as `T`, or `undefined` if not found.
 * - Error: propagates AWS service exceptions; wraps unknown errors in {@link CustomError}.
 *
 * @typeParam T - The TypeScript interface/type representing the item shape stored in the table.
 * @param inputs - The key lookup parameters.
 * @returns The found item typed as `T`, or `undefined`.
 * @throws {@link CustomError} For unexpected error shapes.
 *
 * @example
 * ```ts
 * interface User {
 *   pk: string;
 *   sk: string;
 *   email: string;
 * }
 *
 * const user = await getRecordByKey<User>({
 *   tableName: process.env.TABLE_NAME!,
 *   key: { pk: 'USER#123', sk: 'PROFILE' }
 * });
 *
 * if (!user) {
 *   // handle not found
 * }
 * console.log(user.email);
 * ```
 */
export async function getRecordByKey<T>(inputs: CustomGetCommandInput): Promise<T | undefined> {
  try {
    const result = await docClient.send(new GetCommand(build.buildGetCommandInput(inputs)));
    return result.Item ? (result.Item as T) : undefined;
  } catch (error: unknown) {
    logger.error(`Error retrieving record from table "${inputs.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while retrieving record.');
  }
}

/**
 * Query a DynamoDB table or secondary index and return typed items with pagination state.
 *
 * The returned `lastEvaluatedKey` can be supplied back into successive calls to fetch the
 * next page of results. Items are typed as `T` for end-to-end type-safety.
 *
 * Contract
 * - Input: {@link CustomQueryCommandInput} including table/index name, key condition, and optional pagination.
 * - Output: {@link CustomQueryCommandOutput} containing `items: T[]` and `lastEvaluatedKey`.
 * - Error: propagates AWS service exceptions; wraps unknown errors in {@link CustomError}.
 *
 * @typeParam T - The TypeScript interface/type representing the item shape stored in the table.
 * @param input - The query parameters (keys, expressions, limits, etc.).
 * @returns Paginated query output with typed items.
 *
 * @example Query first page
 * ```ts
 * const page1 = await queryRecords<User>({
 *   tableName: process.env.TABLE_NAME!,
 *   indexName: 'GSI1',
 *   keyCondition: {
 *     partitionKeyName: 'gsi1pk',
 *     partitionKeyValue: 'ORG#42',
 *   },
 *   limit: 25,
 * });
 * console.log(page1.items.length);
 * ```
 *
 * @example Paginate until completion
 * ```ts
 * let cursor: Record<string, unknown> | undefined;
 * do {
 *   const { items, lastEvaluatedKey } = await queryRecords<User>({
 *     tableName: process.env.TABLE_NAME!,
 *     keyCondition: { partitionKeyName: 'pk', partitionKeyValue: 'USER#123' },
 *     exclusiveStartKey: cursor,
 *     limit: 50,
 *   });
 *   // process items
 *   cursor = Object.keys(lastEvaluatedKey || {}).length ? lastEvaluatedKey : undefined;
 * } while (cursor);
 * ```
 */
export async function queryRecords<T>(input: CustomQueryCommandInput): Promise<CustomQueryCommandOutput<T>> {
  try {
    const result = await docClient.send(new QueryCommand(build.buildQueryCommandInput(input)));
    return {
      lastEvaluatedKey: result.LastEvaluatedKey ? result.LastEvaluatedKey : {},
      items: result.Items ? (result.Items as T[]) : [],
    };
  } catch (error: unknown) {
    logger.error(`Error querying records from table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while querying records.');
  }
}

/**
 * Create (put) a record in DynamoDB and return the provided item.
 *
 * This helper delegates to {@link PutCommand}. By default, DynamoDB Put will blindly
 * overwrite an existing item with the same primary key. If you want conditional
 * writes (e.g., only create when not exists), ensure your {@link CustomPutCommandInput}
 * includes the appropriate condition expression via the command builder.
 *
 * Contract
 * - Input: {@link CustomPutCommandInput} carrying the item and table name.
 * - Output: returns the same `input.item` as `T` for convenience.
 * - Error: propagates AWS service exceptions; wraps unknown errors in {@link CustomError}.
 *
 * @typeParam T - The TypeScript interface/type representing the item shape stored in the table.
 * @param input - The put parameters including `item` and `tableName`.
 * @returns The original item `T`.
 *
 * @example
 * ```ts
 * const created = await createRecord<User>({
 *   tableName: process.env.TABLE_NAME!,
 *   item: { pk: 'USER#123', sk: 'PROFILE', email: 'x@y.z' },
 * });
 * ```
 */
export async function createRecord<T>(input: CustomPutCommandInput<T>): Promise<T> {
  try {
    await docClient.send(new PutCommand(build.buildPutCommandInput(input)));
    return input.item;
  } catch (error: unknown) {
    logger.error(`Error creating record in table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while creating record.');
  }
}

/**
 * Update a record and return the updated attributes when available.
 *
 * The returned value depends on the underlying Update command configuration. If
 * the builder sets `ReturnValues` to `ALL_NEW` (commonly done), this function returns
 * the fully updated entity `T`. Otherwise, `undefined` may be returned.
 *
 * Contract
 * - Input: {@link CustomUpdateItemInput} describing update expression and key.
 * - Output: updated item as `T` when attributes are returned; otherwise `undefined`.
 * - Error: propagates AWS service exceptions; wraps unknown errors in {@link CustomError}.
 *
 * @typeParam T - The TypeScript interface/type representing the item shape stored in the table.
 * @param input - The update parameters.
 * @returns The updated item as `T` or `undefined` if attributes were not returned.
 *
 * @example
 * ```ts
 * const updated = await updateRecord<User>({
 *   tableName: process.env.TABLE_NAME!,
 *   key: { pk: 'USER#123', sk: 'PROFILE' },
 *   // Additional fields like update expression are provided via the builder inputs
 * });
 * ```
 */
export async function updateRecord<T>(input: CustomUpdateItemInput<T>): Promise<T | undefined> {
  try {
    const result = await docClient.send(new UpdateCommand(build.buildUpdateCommandInput<T>(input)));
    return result.Attributes as T;
  } catch (error: unknown) {
    logger.error(`Error updating record in table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while updating record.');
  }
}
