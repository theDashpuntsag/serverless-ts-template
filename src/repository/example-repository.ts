import type { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import type { CustomGetCommandInput, CustomQueryCommandOutput as QueryOutput, QueryRequest } from '@type/dynamo.types';

import { createRecord, getRecordByKey, getTableDescription, queryRecords, updateRecord } from './dynamo';
import { buildDynamoQueryInput, getExpressionAttributeNByProjection } from './dynamo-utils';

const TABLE_NAME = '';

export async function getExampleTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(TABLE_NAME);
}

export async function getExampleItemById(id: string, keys?: string): Promise<object | undefined> {
  const params: CustomGetCommandInput = {
    tableName: TABLE_NAME,
    key: '',
    value: id,
  };

  if (keys) {
    params.options = {
      ProjectionExpression: keys,
      ExpressionAttributeNames: getExpressionAttributeNByProjection(keys),
    };
  }

  return await getRecordByKey<object>(params);
}

export async function getExampleByQuery(queryRequest: QueryRequest): Promise<QueryOutput<Partial<object>>> {
  return await queryRecords<object>({ ...buildDynamoQueryInput(queryRequest, TABLE_NAME) });
}

export async function createExampleItem(newItem: object): Promise<object> {
  return await createRecord<object>({ tableName: TABLE_NAME, item: newItem });
}

export async function updateExampleItem(exampleItem: object): Promise<object | undefined> {
  return await updateRecord<object>({ tableName: TABLE_NAME, key: { id: 3 }, item: exampleItem });
}
