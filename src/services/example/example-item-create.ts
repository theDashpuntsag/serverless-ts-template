import type { ExampleItem } from '@/@types/';
import { createExampleItem as createExampleItemRepo } from '@/repository/example-repository';

export async function createExampleItem(newItem: ExampleItem): Promise<ExampleItem> {
  return await createExampleItemRepo(newItem);
}
