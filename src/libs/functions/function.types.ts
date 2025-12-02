import type { AWS } from '@serverless/typescript';

export type FunctionDefinition = NonNullable<AWS['functions']>[string];

export type FuncParams = {
  dir: string;
  fnName: string;
  other?: Record<string, unknown>;
};

export type ApiFuncParams = {
  dir: string;
  fnName: string;
  http: {
    method: string;
    url: string;
    more?: Record<string, unknown>;
  };
  other?: Record<string, unknown>;
};
