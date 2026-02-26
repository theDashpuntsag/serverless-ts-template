import type { AWS } from '@serverless/typescript';
import 'dotenv/config';
import { APIS_EXAMPLE } from './src/functions/api/example';

const serverlessConfig: AWS = {
  service: 'service-name',
  frameworkVersion: '4',
  app: 'service-name',
  plugins: ['serverless-offline', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    stage: "${opt:stage, 'dev'}",
    runtime: 'nodejs24.x',
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
    environment: {},
    iam: { role: process.env.AWS_IAM_ROLE },
  },
  functions: {
    ...APIS_EXAMPLE,
  },
  package: { individually: true },
  custom: { prune: { automatic: true, number: 2 } },
};

export default serverlessConfig;
