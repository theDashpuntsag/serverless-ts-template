import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type {
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandInput,
  CustomQueryCommandOutput,
  CustomUpdateItemInput,
} from '@type/dynamo.types';

import { GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import CustomError from '@configs/custom-error';
import logger from '@libs/winston';
import {
  buildGetCommandInput,
  buildPutCommandInput,
  buildQueryCommandInput,
  buildUpdateCommandInput,
} from './dynamo-builder';

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

export async function getTableDescription(tableName: string): Promise<DescribeTableCommandOutput> {
  try {
    return await docClient.send(new DescribeTableCommand({ TableName: tableName }));
  } catch (error: unknown) {
    console.error(`Failed to retrieve table description for "${tableName}":`, error);
    throw new Error(`Unable to describe table "${tableName}": ${error instanceof Error ? error.message : error}`);
  }
}

export async function getRecordByKey<T>(inputs: CustomGetCommandInput): Promise<T | undefined> {
  try {
    const result = await docClient.send(new GetCommand({ ...buildGetCommandInput(inputs) }));
    return result.Item ? (result.Item as T) : undefined;
  } catch (error: unknown) {
    logger.error(`Error retrieving record from table "${inputs.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while retrieving record.');
  }
}

export async function queryRecords<T>(input: CustomQueryCommandInput): Promise<CustomQueryCommandOutput<T>> {
  try {
    const result = await docClient.send(new QueryCommand({ ...buildQueryCommandInput(input) }));
    return {
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : '',
      items: result.Items ? (result.Items as T[]) : [],
    };
  } catch (error: unknown) {
    logger.error(`Error querying records from table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while querying records.');
  }
}

export async function createRecord<T>(input: CustomPutCommandInput<T>): Promise<T> {
  try {
    await docClient.send(new PutCommand({ ...buildPutCommandInput(input) }));
    return input.item;
  } catch (error: unknown) {
    logger.error(`Error creating record in table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while creating record.');
  }
}

export async function updateRecord<T>(input: CustomUpdateItemInput<T>): Promise<T | undefined> {
  try {
    const result = await docClient.send(new UpdateCommand({ ...buildUpdateCommandInput<T>(input) }));
    return result.Attributes as T;
  } catch (error: unknown) {
    logger.error(`Error updating record in table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while updating record.');
  }
}
