import type { AWS } from '@serverless/typescript';
import { APIS_EXAMPLE } from './src/functions/example';

import * as dotenv from 'dotenv';
dotenv.config();

const serverlessConfig: AWS = {
  service: 'service-name',
  frameworkVersion: '4',
  app: 'app-name',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'prod'}",
    runtime: 'nodejs22.x',
    region: 'ap-southeast-1',
    profile: '',
    timeout: 29,
    memorySize: 512,
    architecture: 'arm64',
    deploymentBucket: {
      blockPublicAccess: true,
    },
    apiGateway: {
      minimumCompressionSize: 1024, // Compress responses larger than 1KB
      shouldStartNameWithService: true, // Include the service name in API Gateway endpoint URLs
      usagePlan: {
        throttle: {
          burstLimit: 150, // Maximum number of requests per second
          rateLimit: 100, // Average number of requests per second
        },
      },
    },
    logRetentionInDays: 365,
    environment: {
      STAGE: '${self:provider.stage}',
      REGION: '${self:provider.region}',
    },
    iam: { role: '' },
  },
  functions: {
    ...APIS_EXAMPLE,
  },
  package: { individually: true },
  custom: { prune: { automatic: true, number: 2 } },
};

export default serverlessConfig;
