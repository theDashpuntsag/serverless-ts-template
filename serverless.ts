import type { AWS } from '@serverless/typescript';
import {
  getExampleTableDesc,
  getExampleItemById,
  getExampleItemsByQuery,
  postCreateExampleItem,
  putUpdateExampleItem,
} from '@/functions/example';

const serverlessConfig: AWS & { build?: { esbuild: Record<string, unknown> } } = {
  service: 'service-name',
  frameworkVersion: '4',
  app: 'app-name',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs20.x',
    region: 'ap-southeast-1',
    profile: 'default',
    logRetentionInDays: 365,
  },
  functions: {
    getExampleTableDesc,
    getExampleItemById,
    getExampleItemsByQuery,
    postCreateExampleItem,
    putUpdateExampleItem,
  },
  package: { individually: true },
  build: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['@aws-sdk/*'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  custom: {
    prune: {
      automatic: true,
      number: 2,
    },
    function_timeout: {
      main: 29,
    },
  },
};

module.exports = serverlessConfig;
