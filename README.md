# Serverless TypeScript Template

A modern serverless framework template for TypeScript with built-in best practices.

## Features

- ✅ **Serverless Framework v4** with built-in esbuild
- ✅ **TypeScript** with strict configuration
- ✅ **ESLint & Prettier** for code quality
- ✅ **Vitest** for testing
- ✅ **Husky** for git hooks
- ✅ **AWS SDK v3** integration
- ✅ **DynamoDB** utilities and abstractions
- ✅ **Structured logging** with Winston
- ✅ **Error handling** middleware
- ✅ **API Gateway** response formatting

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- AWS CLI configured
- Serverless Framework CLI

## Quick Start

```bash
# Install dependencies
pnpm install

# Run locally
pnpm run dev

# Deploy to development
pnpm run deploy:dev

# Deploy to production
pnpm run deploy:prod
```

## Optional Packages

If you need environment variables support:

```sh
pnpm add -D serverless-dotenv-plugin
```

## Scripts

- `pnpm run build` - Compile TypeScript
- `pnpm run dev` - Start local development server
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once
- `pnpm run lint` - Check code quality
- `pnpm run format` - Format code with Prettier
