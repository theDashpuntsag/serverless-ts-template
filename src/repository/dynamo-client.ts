import { DescribeTableCommand, DescribeTableCommandOutput, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  buildGetCommandInput,
  buildPutCommandInput,
  buildQueryCommandInput,
  buildUpdateCommandInput,
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandInput,
  CustomUpdateCommandInput,
} from '../dynamo';
import { logger } from '../libs';

const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(dynamoDb);

/**
 * Retrieves the description and metadata of a DynamoDB table.
 *
 * @param tableName - The name of the DynamoDB table to describe
 * @returns {Promise<DescribeTableCommandOutput>} table description output
 * @throws Error if the table description retrieval fails
 */
export async function getTableDescFromDynamo(tableName: string): Promise<DescribeTableCommandOutput> {
  try {
    return await docClient.send(new DescribeTableCommand({ TableName: tableName }));
  } catch (error) {
    logger.error(`Failed to retrieve table description for "${tableName}":`, error);
    throw error;
  }
}

/**
 * Retrieves a single record from DynamoDB using the Document Client.
 *
 * @param input - The get command input containing the table name, key, and optional projection expression
 * @returns {Promise<GetCommandOutput>} get command output containing the retrieved item
 * @throws Error if the record retrieval fails
 */
export async function getRecordFromDynamo(input: CustomGetCommandInput): Promise<GetCommandOutput> {
  try {
    const buildCommand = buildGetCommandInput(input);
    return await docClient.send(new GetCommand(buildCommand));
  } catch (error: unknown) {
    logger.error('Error retrieving record from DynamoDB:', error);
    throw error;
  }
}

/**
 * Queries records from DynamoDB based on partition key and optional sort key conditions.
 *
 * @param input - The query command input containing table name, key conditions, filter expressions, and projection settings
 * @returns {Promise<QueryCommandOutput>} query command output containing matching items and pagination information
 * @throws Error if the query operation fails
 */
export async function queryRecordFromDynamo(input: CustomQueryCommandInput): Promise<QueryCommandOutput> {
  try {
    const buildCommand = buildQueryCommandInput(input);
    return await docClient.send(new QueryCommand(buildCommand));
  } catch (error: unknown) {
    logger.error('Error querying records from DynamoDB:', error);
    throw error;
  }
}

/**
 * Creates a new record in DynamoDB using the PutCommand.
 *
 * @param input - The put command input containing the table name, item data, and optional condition expressions
 * @returns {Promise<PutCommandOutput>} put command output containing the result of the put operation
 * @throws Error if the record creation fails (e.g., condition expression not met or validation errors)
 */
export async function createRecordOnDynamo(input: CustomPutCommandInput): Promise<PutCommandOutput> {
  try {
    const buildCommand = buildPutCommandInput(input);
    return await docClient.send(new PutCommand(buildCommand));
  } catch (error: unknown) {
    logger.error('Error creating record in DynamoDB:', error);
    throw error;
  }
}

/**
 * Updates an existing record in DynamoDB using the PutCommand.
 * Note: This performs a full item replacement. For partial updates, consider using UpdateCommand.
 *
 * @param input - The put command input containing the table name, item data, and optional condition expressions
 * @returns {Promise<PutCommandOutput>} put command output containing the result of the put operation
 * @throws Error if the record update fails (e.g., condition expression not met or validation errors)
 */
export async function updateRecordOnDynamo(input: CustomUpdateCommandInput): Promise<PutCommandOutput> {
  try {
    const updateCommand = buildUpdateCommandInput(input);
    return await docClient.send(new UpdateCommand(updateCommand));
  } catch (error: unknown) {
    logger.error('Error updating record in DynamoDB:', error);
    throw error;
  }
}
