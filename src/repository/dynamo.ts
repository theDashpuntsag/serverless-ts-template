import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type {
  GetCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import type {
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandOutput,
  CustomUpdateItemInput,
} from '@type/dynamo.types';

import { GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import CustomError from '@configs/custom-error';
import logger from '@libs/winston';

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

/**
 * Retrieves the description of a DynamoDB table.
 *
 * @param {string} tableName - The name of the DynamoDB table to describe.
 * @returns {Promise<DescribeTableCommandOutput>} - A promise that resolves to the table description details.
 *
 * @throws {Error} - Throws an error if the table description retrieval fails.
 *
 * @example
 * ```ts
 * const tableDescription = await getTableDescription('example-table');
 * console.log(tableDescription.Table);
 * ```
 */
export async function getTableDescription(tableName: string): Promise<DescribeTableCommandOutput> {
  // Initialize DynamoDB client
  const client = new DynamoDBClient({ region: 'your-region' }); // Replace 'your-region' with your AWS region
  try {
    // Send DescribeTableCommand to fetch table details
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);

    return response;
  } catch (error) {
    console.error(`Failed to retrieve table description for "${tableName}":`, error);
    throw new Error(`Unable to describe table "${tableName}": ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Retrieve a single record from a DynamoDB table by its key.
 *
 * @param inputs - An object containing the following properties:
 *  - tableName: The name of the DynamoDB table.
 *  - key: The key name of the record to retrieve.
 *  - value: The value of the key for the record to retrieve.
 * @returns A promise resolving to the retrieved record of type T or undefined if not found.
 */
export async function getRecordByKey<T>(inputs: CustomGetCommandInput): Promise<T | undefined> {
  const { tableName, key, value } = inputs;

  try {
    const result: GetCommandOutput = await docClient.send(
      new GetCommand({ TableName: tableName, Key: { [key]: value } })
    );
    return result.Item ? (result.Item as T) : undefined;
  } catch (error) {
    logger.error(`Error retrieving record from table "${tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while retrieving record.');
  }
}

/**
 * Queries records from a DynamoDB table using the AWS SDK v3.
 *
 * @template T - The type of items expected in the query result.
 * @param {QueryCommandInput} inputs - The query parameters, including the table name, key conditions,
 *                                     and any optional query attributes (e.g., filters, projections).
 * @returns {Promise<CustomQueryCommandOutput<T>>} - A promise that resolves to an object containing:
 *   - `lastEvaluatedKey` (string): A serialized representation of the last evaluated key for pagination.
 *   - `items` (T[]): An array of items returned from the query, typed as `T`.
 * @throws {CustomError | Error} - Throws a `CustomError` if the error is unexpected or the original error
 *                                 if it is an instance of `Error`. Logs the error before rethrowing.
 *
 * @example
 * ```ts
 * const queryInput: QueryCommandInput = {
 *   TableName: 'example-table',
 *   KeyConditionExpression: 'userId = :userId',
 *   ExpressionAttributeValues: { ':userId': { S: '12345' } },
 * };
 *
 * const result = await queryRecords<MyItemType>(queryInput);
 * console.log(result.items);
 * console.log(result.lastEvaluatedKey);
 * ```
 */
export async function queryRecords<T>(inputs: QueryCommandInput): Promise<CustomQueryCommandOutput<T>> {
  try {
    const result: QueryCommandOutput = await docClient.send(new QueryCommand(inputs));
    return {
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : '',
      items: result.Items ? (result.Items as T[]) : [],
    };
  } catch (error) {
    logger.error(`Error querying records from table "${inputs.TableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while querying records.');
  }
}

/**
 * Create a new record in a DynamoDB table.
 *
 * @param input - An object containing the following properties:
 *  - tableName: The name of the DynamoDB table.
 *  - item: The item to create in the table.
 * @returns A promise resolving to the created item of type T.
 */
export async function createRecord<T>(input: CustomPutCommandInput<T>): Promise<T> {
  const { tableName, item } = input;

  try {
    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item as Record<string, any>,
      })
    );
    return item;
  } catch (error) {
    logger.error(`Error creating record in table "${tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while creating record.');
  }
}

/**
 * Update an existing record in a DynamoDB table.
 *
 * @param input - An object containing the following properties:
 *  - tableName: The name of the DynamoDB table.
 *  - key: A map representing the key identifying the record to update.
 *  - item: A partial object containing the fields to update and their new values.
 * @returns A promise resolving to the updated record of type T.
 */
export async function updateRecord<T>(input: CustomUpdateItemInput<T>): Promise<T | undefined> {
  const { tableName, item, key } = input;

  try {
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(item).forEach(([field, value]) => {
      const attributeKey = `:${field}`;
      updateExpressionParts.push(`${field} = ${attributeKey}`);
      expressionAttributeValues[attributeKey] = value;
    });

    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      } as UpdateCommandInput)
    );

    return result.Attributes as T;
  } catch (error) {
    logger.error(`Error updating record in table "${tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while updating record.');
  }
}
