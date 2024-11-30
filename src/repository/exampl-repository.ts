import type { GetCommandOutput, QueryCommandInput, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import type { DynamoGetQueryResponse as GetQueryRes } from '@type/dynamo.types';

import { AttributeValue, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import CustomError from '@configs/custom-error';
import logger from '@libs/winston';
import docClient from './dynamo';

const TABLE_NAME = '';

function mapDynamoDBItemToPaymentRequest(item: Record<string, AttributeValue>): object {
  return unmarshall(item);
}

export async function getItemById(id: number): Promise<object | undefined> {
  try {
    const result: GetCommandOutput = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    return result.Item ? result.Item : undefined;
  } catch (error: unknown) {
    logger.info(`Error on getItemById: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

export async function getItemsByPage(value: string, page: number = 100, key?: string): Promise<GetQueryRes<object>> {
  try {
    const params: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: 'email-status-index',
      KeyConditionExpression: 'email = :email AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':email': value,
        ':status': value,
      },
      Limit: page,
      ExclusiveStartKey: key ? JSON.parse(key) : undefined,
    };
    const result = await docClient.send(new QueryCommand(params));
    return {
      items: result.Items?.map(mapDynamoDBItemToPaymentRequest) || [],
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : undefined,
    };
  } catch (error: unknown) {
    logger.info(`Error on getItemsByPage: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

export async function createItem(newItem: object): Promise<object | undefined> {
  try {
    await docClient.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall(newItem),
      })
    );
    return newItem;
  } catch (error: unknown) {
    logger.info(`Error on createItem: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

export async function updateItem(id: number): Promise<object | undefined> {
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: ``,
        ExpressionAttributeValues: {},
        ReturnValues: 'ALL_NEW',
      } as UpdateCommandInput)
    );
    return result as object;
  } catch (error: unknown) {
    logger.info(`Error on updateItem: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}

export async function deleteItem(): Promise<void> {
  try {
  } catch (error: unknown) {
    logger.info(`Error on deleteItem: ${error instanceof Error ? error : JSON.stringify(error ?? {})}`);
    throw error instanceof Error ? error : new CustomError('Unexpected error!');
  }
}
