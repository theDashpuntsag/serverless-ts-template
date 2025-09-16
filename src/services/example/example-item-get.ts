import type { DescribeTableCommandOutput, QueryRequest as Query } from '@/libs/dynamo';
import type { OptPartialExampleItem, QueriedExampleItems } from '@/repository/example-repository';
import {
  getExampleItemById as getExampleItemByIdRepo,
  getExampleItemsByQuery as getExampleItemsByQueryRepo,
  getExampleItemTableDescription,
} from '@/repository/example-repository';

export async function getExampleItemTableDesc(): Promise<DescribeTableCommandOutput> {
  return await getExampleItemTableDescription();
}

export async function getExampleItemById(id: string, proj?: string): Promise<OptPartialExampleItem> {
  return await getExampleItemByIdRepo(id, proj);
}

export async function getExampleItemsByQuery(query: Query, proj?: string): Promise<QueriedExampleItems> {
  return await getExampleItemsByQueryRepo(query, proj);
}
