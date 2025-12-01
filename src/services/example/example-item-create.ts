import { createExampleItem as createExampleItemRepo } from '@/repository/example-repository';
import type { ExampleItem } from '@/types';

export async function createExampleItem(newItem: ExampleItem): Promise<ExampleItem> {
  return await createExampleItemRepo(newItem);
}
