import { z } from 'zod';

export const exampleItemSch = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export type ExampleItem = z.infer<typeof exampleItemSch>;
