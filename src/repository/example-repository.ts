import { omit } from '@/libs/utility';
import type { ExampleItem } from '@/types';
import { exampleItemSch } from '@/types';
import { DescribeTableCommandOutput } from '@aws-sdk/client-dynamodb';
import { DynamoQueryRequest } from 'dynamo-command-builder';
import {
  createRecordOnDynamo,
  getRecordFromDynamo,
  getTableDescFromDynamo,
  queryRecordFromDynamo,
  updateRecordOnDynamo,
} from './dynamo-client';

export type QueryOutput<T> = { items: T[]; lastEvaluatedKey?: Record<string, unknown> };
export type QueriedExampleItems = QueryOutput<PrtExampleItem>;
export type PrtExampleItem = Partial<ExampleItem>;
export type OptPartialExampleItem = Partial<ExampleItem> | undefined;
export type OptionalExampleItem = ExampleItem | undefined;
type ExtraType = Record<string, unknown>;

const TABLE_NAME = 'example-table';

/**
 * Retrieves the description of the ExampleItem table from DynamoDB.
 * @returns The description of the ExampleItem table.
 */
async function getExampleItemTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescFromDynamo(TABLE_NAME);
}

/**
 * Retrieves an ExampleItem from DynamoDB by its ID.
 *
 * @param id - The ID of the ExampleItem to retrieve.
 * @param proj - Optional projection expression to specify which attributes to retrieve.
 * @returns The ExampleItem if found, otherwise undefined.
 */
async function getExampleItemById(id: string, proj?: string): Promise<OptPartialExampleItem> {
  const params = {
    tableName: TABLE_NAME,
    key: { id },
    projectionExpression: proj,
  };

  const { Item } = await getRecordFromDynamo(params);
  return Item ? (Item as ExampleItem | Partial<ExampleItem>) : undefined;
}

/**
 * Retrieves ExampleItems from DynamoDB based on the provided query conditions.
 *
 * @param query - The query conditions to filter the ExampleItems.
 * @param proj - Optional projection expression to specify which attributes to retrieve.
 * @returns The queried ExampleItems along with the last evaluated key for pagination.
 */
async function getExampleItemsByQuery(query: DynamoQueryRequest, proj?: string): Promise<QueriedExampleItems> {
  const result = await queryRecordFromDynamo({
    tableName: TABLE_NAME,
    queryRequest: query,
    projectionExpression: proj,
  });

  return {
    lastEvaluatedKey: result.LastEvaluatedKey ?? {},
    items: result.Items ? (result.Items as ExampleItem[] | Partial<ExampleItem>[]) : [],
  };
}

/**
 * Creates a new ExampleItem in DynamoDB.
 *
 * @param newItem - The ExampleItem to be created.
 * @returns The created ExampleItem with all attributes as stored in DynamoDB.
 */
async function createExampleItem(newItem: ExampleItem): Promise<ExampleItem> {
  await createRecordOnDynamo({
    tableName: TABLE_NAME,
    item: newItem,
    conditionExpression: 'attribute_not_exists(id)',
  });
  return exampleItemSch.parse(newItem);
}

/**
 * Updates an existing ExampleItem in DynamoDB directly.
 *
 * @param item - The ExampleItem to be updated.
 * @param con - Optional condition expression to ensure the update only occurs if certain conditions are met.
 * @param ext - Optional extra expression attribute values for the update operation.
 * @returns The updated ExampleItem.
 */
async function updateExampleItemDirectly(item: PrtExampleItem, con?: string, ext?: ExtraType): Promise<PrtExampleItem> {
  await updateRecordOnDynamo({
    tableName: TABLE_NAME,
    key: { id: item.id },
    item: omit(item, ['id']),
    conditionExpression: con,
    extraExpAttributeValues: ext,
    returnValues: 'NONE',
  });
  return await item;
}

/**
 * Updates an existing ExampleItem in DynamoDB using an update expression.
 *
 * @param id  - The ID of the ExampleItem to be updated.
 * @param updateExp - The update expression specifying the attributes to be updated.
 * @param con - Optional condition expression to ensure the update only occurs if certain conditions are met.
 * @param ext - Optional extra expression attribute values for the update operation.
 */
async function updateExampleItemByExpression(
  id: string,
  updateExp: string,
  con?: string,
  ext?: ExtraType
): Promise<void> {
  await updateRecordOnDynamo({
    tableName: TABLE_NAME,
    key: { id },
    updateExpression: updateExp,
    conditionExpression: con,
    extraExpAttributeValues: ext,
    returnValues: 'NONE',
  });
}

export {
  createExampleItem,
  getExampleItemById,
  getExampleItemsByQuery,
  getExampleItemTableDescription,
  updateExampleItemByExpression,
  updateExampleItemDirectly,
};
