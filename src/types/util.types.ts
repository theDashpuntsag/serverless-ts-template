import { z } from 'zod';

export const LbdFuncResponseSchema = z.object({
  statusCode: z.number(),
  body: z.any(),
});

export type LbdFuncResponse = z.infer<typeof LbdFuncResponseSchema>;

export type GenericFuncResponse<T> = {
  statusCode: number;
  body: T;
};
