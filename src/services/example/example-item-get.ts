import { logger } from '@/libs';
import type { OptPartialExampleItem, QueriedExampleItems } from '@/repository/example-repository';
import {
  getExampleItemById as getExampleItemByIdRepo,
  getExampleItemsByQuery as getExampleItemsByQueryRepo,
  getExampleItemTableDescription,
} from '@/repository/example-repository';
import { TableDescription } from '@aws-sdk/client-dynamodb';
import type { DynamoQueryRequest as Query } from 'dynamo-command-builder';

export async function getExampleItemTableDesc(): Promise<TableDescription> {
  const { Table } = await getExampleItemTableDescription();

  if (!Table) {
    logger.warn('Table description is undefined');
    throw new Error('Table description is undefined');
  }

  return Table;
}

export async function getExampleItemById(id: string, proj?: string): Promise<OptPartialExampleItem> {
  return await getExampleItemByIdRepo(id, proj);
}

export async function getExampleItemsByQuery(query: Query, proj?: string): Promise<QueriedExampleItems> {
  return await getExampleItemsByQueryRepo(query, proj);
}
