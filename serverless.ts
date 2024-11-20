import type { AWS } from '@serverless/typescript';
import { printHelloWorld } from '@functions/hello';

const serverlessConfig: AWS = {
  service: 'service-name',
  frameworkVersion: '4',
  app: 'app-name',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs18.x',
    region: 'ap-southeast-1',
    profile: 'default',
    logRetentionInDays: 365,
  },
  functions: {
    printHelloWorld,
  },
  package: { individually: true },
  custom: {
    prune: {
      automatic: true,
      number: 2,
    },
    function_timeout: {
      ain: 29,
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-hstore'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfig;