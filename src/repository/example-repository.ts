import type { ExampleItem } from '@/@types';
import type {
  DescribeTableCommandOutput,
  QueryRequest as Query,
  CustomQueryCommandOutput as QueryOutput,
} from '@/dynamo';
import { createRecord, getRecordByKey, getTableDescription, queryRecords, updateRecord } from '@/dynamo';
import { omit } from '@/libs/utility';

export type QueriedExampleItems = QueryOutput<PartialExampleItem>;
export type PartialExampleItem = Partial<ExampleItem>;
export type OptPartialExampleItem = Partial<ExampleItem> | undefined;
export type OptionalExampleItem = ExampleItem | undefined;
type ExtraType = Record<string, unknown>;

const TABLE_NAME = 'tableName';

async function getExampleItemTableDescription(): Promise<DescribeTableCommandOutput> {
  return await getTableDescription(TABLE_NAME);
}

async function getExampleItemById(id: string, proj?: string): Promise<OptPartialExampleItem> {
  const params = {
    tableName: TABLE_NAME,
    key: { id },
    projectionExpression: proj,
  };

  return await getRecordByKey<PartialExampleItem>(params);
}

async function getExampleItemsByQuery(query: Query, proj?: string): Promise<QueriedExampleItems> {
  return await queryRecords<Partial<ExampleItem>>({
    tableName: TABLE_NAME,
    queryRequest: query,
    projectionExpression: proj,
  });
}

async function createExampleItem(newItem: ExampleItem): Promise<ExampleItem> {
  return await createRecord<ExampleItem>({ tableName: TABLE_NAME, item: newItem });
}

async function updateExampleItem(item: ExampleItem, con?: string, ext?: ExtraType): Promise<ExampleItem> {
  await updateRecord<ExampleItem>({
    tableName: TABLE_NAME,
    key: { id: item.id },
    item: omit(item, ['id']),
    conditionExpression: con,
    extraExpressionAttributeValues: ext,
    returnValues: 'NONE',
  });
  return await item;
}

export {
  createExampleItem,
  getExampleItemById,
  getExampleItemsByQuery,
  getExampleItemTableDescription,
  updateExampleItem,
};
