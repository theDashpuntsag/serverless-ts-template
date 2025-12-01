import { updateExampleItemDirectly } from '@/repository/example-repository';
import type { ExampleItem } from '@/types';

export async function updateExampleItem(item: ExampleItem): Promise<ExampleItem> {
  return (await updateExampleItemDirectly(item)) as ExampleItem;
}
