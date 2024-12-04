import { GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import type {
  GetCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';

import CustomError from '@configs/custom-error';
import logger from '@libs/winston';

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

export type CustomQueryCommandOutput<T> = {
  lastEvaluatedKey: string;
  items: T[];
};

const dynamoDb = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

/**
 * Retrieve a single record from a DynamoDB table by its key.
 *
 * @param tName - The name of the DynamoDB table.
 * @param key - The key name of the record to retrieve.
 * @param value - The value of the key for the record to retrieve.
 * @returns A promise resolving to the retrieved record of type T or undefined if not found.
 */
async function getRecordByKey<T>(tName: string, key: string, value: any): Promise<T | undefined> {
  try {
    const result: GetCommandOutput = await docClient.send(
      new GetCommand({
        TableName: tName,
        Key: { [key]: value }, // Dynamically use the key-value pair
      })
    );

    return result.Item ? (result.Item as T) : undefined;
  } catch (error: unknown) {
    logger.info(`Error on getSingleItemByKey: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

/**
 * Query multiple records from a DynamoDB table based on a key condition.
 *
 * @param inputs - The query inputs, including table name, key condition, and optional parameters.
 * @returns A promise resolving to the query result containing items and the last evaluated key.
 */
async function queryRecords<T>(inputs: CustomQueryCommandInput): Promise<CustomQueryCommandOutput<T>> {
  try {
    const { tableName, lastEvaluatedKey, keyConditionExpression, expressionAttributeValues, options } = inputs;

    const queryInput: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      IndexName: options?.indexName,
      FilterExpression: options?.filterExpression,
      ProjectionExpression: options?.projectionExpression,
      Limit: options?.limit,
      ScanIndexForward: options?.scanIndexForward,
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    };

    const result: QueryCommandOutput = await docClient.send(new QueryCommand(queryInput));

    return {
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : '',
      items: result.Items ? (result.Items as T[]) : [],
    };
  } catch (error: unknown) {
    logger.info(`Error on queryRecords: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

/**
 * Create a new record in a DynamoDB table.
 *
 * @param tName - The name of the DynamoDB table.
 * @param item - The item to create in the table.
 * @returns A promise resolving to the created item.
 */
async function createRecord<T>(tName: string, item: T): Promise<T | undefined> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: tName,
        Item: item as Record<string, any>,
      })
    );
    return item;
  } catch (error: unknown) {
    logger.info(`Error on createItem: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

/**
 * Update an existing record in a DynamoDB table.
 *
 * @param tName - The name of the DynamoDB table.
 * @param key - The key identifying the record to update.
 * @param item - The partial item containing fields to update.
 * @returns A promise resolving to the updated record of type T.
 */
async function updateRecord<T>(tName: string, key: Record<string, any>, item: Partial<T>): Promise<T | undefined> {
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
        TableName: tName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      } as UpdateCommandInput)
    );

    return result.Attributes as T;
  } catch (error: unknown) {
    logger.info(`Error on updateRecord: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

export { getRecordByKey, queryRecords, createRecord, updateRecord };
export default docClient;
