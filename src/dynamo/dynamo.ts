import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type {
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandInput,
  CustomQueryCommandOutput,
  CustomUpdateItemInput
} from './types';

import { DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { logger } from '@/libs';
import { CustomError } from '@/error';
import * as build from './command';

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

export async function getTableDescription(tableName: string): Promise<DescribeTableCommandOutput> {
  try {
    return await docClient.send(new DescribeTableCommand({ TableName: tableName }));
  } catch (error: unknown) {
    logger.error(`Failed to retrieve table description for "${tableName}":`, error);
    throw new Error(`Unable to describe table "${tableName}": ${error instanceof Error ? error.message : error}`);
  }
}

export async function getRecordByKey<T>(inputs: CustomGetCommandInput): Promise<T | undefined> {
  try {
    const result = await docClient.send(new GetCommand(build.buildGetCommandInput(inputs)));
    return result.Item ? (result.Item as T) : undefined;
  } catch (error: unknown) {
    logger.error(`Error retrieving record from table "${inputs.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while retrieving record.');
  }
}

export async function queryRecords<T>(input: CustomQueryCommandInput): Promise<CustomQueryCommandOutput<T>> {
  try {
    const result = await docClient.send(new QueryCommand(build.buildQueryCommandInput(input)));
    return {
      lastEvaluatedKey: result.LastEvaluatedKey ? result.LastEvaluatedKey : {},
      items: result.Items ? (result.Items as T[]) : []
    };
  } catch (error: unknown) {
    logger.error(`Error querying records from table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while querying records.');
  }
}

export async function createRecord<T>(input: CustomPutCommandInput<T>): Promise<T> {
  try {
    await docClient.send(new PutCommand(build.buildPutCommandInput(input)));
    return input.item;
  } catch (error: unknown) {
    logger.error(`Error creating record in table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while creating record.');
  }
}

export async function updateRecord<T>(input: CustomUpdateItemInput<T>): Promise<T | undefined> {
  try {
    const result = await docClient.send(new UpdateCommand(build.buildUpdateCommandInput<T>(input)));
    return result.Attributes as T;
  } catch (error: unknown) {
    logger.error(`Error updating record in table "${input.tableName}": ${error}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error while updating record.');
  }
}
