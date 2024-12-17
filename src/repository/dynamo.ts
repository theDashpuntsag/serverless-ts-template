import { GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import type {
  GetCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import type {
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandInput,
  CustomQueryCommandOutput,
  CustomUpdateItemInput,
} from '@type/dynamo.types';

import CustomError from '@configs/custom-error';
import logger from '@libs/winston';

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

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
      new GetCommand({
        TableName: tableName,
        Key: { [key]: value },
      })
    );
    return result.Item ? (result.Item as T) : undefined;
  } catch (error) {
    logger.error(`Error retrieving record from table "${tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while retrieving record.');
  }
}

/**
 * Query multiple records from a DynamoDB table based on a key condition.
 *
 * @param inputs - An object containing the following properties:
 *  - tableName: The name of the DynamoDB table.
 *  - lastEvaluatedKey: A string representing the last evaluated key for pagination (optional).
 *  - keyConditionExpression: A string defining the key condition for the query.
 *  - expressionAttributeValues: A map of attribute values used in the key condition expression.
 *  - options: Additional query options (optional), including:
 *    - indexName: The name of the index to query.
 *    - filterExpression: A filter expression to apply after the query.
 *    - projectionExpression: A projection expression to return specific attributes.
 *    - limit: The maximum number of items to return.
 *    - scanIndexForward: Whether to return results in ascending order of the sort key.
 * @returns A promise resolving to the query result containing items and the last evaluated key.
 */
export async function queryRecords<T>(inputs: CustomQueryCommandInput): Promise<CustomQueryCommandOutput<T>> {
  const {
    tableName,
    lastEvaluatedKey,
    keyConditionExpression,
    expressionAttributeValues,
    expressionAttributeNames,
    options,
  } = inputs;

  try {
    const queryInput: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames, // Include this
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
  } catch (error) {
    logger.error(`Error querying records from table "${tableName}": ${error}`);
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
