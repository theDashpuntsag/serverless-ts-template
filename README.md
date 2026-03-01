# Serverless TypeScript Template

A production-ready serverless framework template for TypeScript with built-in best practices, type safety, and comprehensive tooling for building scalable AWS Lambda applications.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Architecture](#architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)
- [Best Practices](#best-practices)

## ✨ Features

- ✅ **Serverless Framework v4** with built-in esbuild for fast builds
- ✅ **TypeScript** with strict configuration and path aliases
- ✅ **ESLint & Prettier** for code quality and consistency
- ✅ **Vitest** for fast testing with coverage
- ✅ **Husky** for git hooks and pre-commit checks
- ✅ **AWS SDK v3** integration with DynamoDB, Lambda, and SSM
- ✅ **DynamoDB utilities** with query builder support
- ✅ **Structured logging** with Winston
- ✅ **Error handling** middleware with custom error types
- ✅ **API Gateway** response formatting and event parsing
- ✅ **Serverless Offline** for local development
- ✅ **Type-safe API handlers** with Zod validation
- ✅ **Middy middleware** support for Lambda functions

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** (LTS recommended)
- **pnpm 10+** (recommended) or npm/yarn
- **AWS CLI** configured with appropriate credentials
- **Serverless Framework CLI** (optional, included as dev dependency)
- **AWS Account** with appropriate IAM permissions

### AWS Setup

1. Configure AWS credentials:

   ```bash
   aws configure
   ```

2. Set up IAM role ARN in `.env`:
   ```bash
   AWS_IAM_ROLE=arn:aws:iam::YOUR_ACCOUNT:role/YOUR_LAMBDA_ROLE
   ```

## 🚀 Quick Start

```bash
# 1. Clone the repository (or use as template)
git clone https://github.com/theDashpuntsag/serverless-ts-template.git
cd serverless-ts-template

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env  # Create this if it doesn't exist
# Edit .env with your AWS settings

# 4. Run locally
pnpm run offline

# 5. Test the API
curl http://localhost:3000/dev/example

# 6. Run tests
pnpm run test

# 7. Deploy to AWS
pnpm run deploy
```

## 📁 Project Structure

```
serverless-template/
├── src/
│   ├── functions/           # Lambda function handlers
│   │   ├── api/            # API Gateway endpoints
│   │   │   └── example/    # Example API handlers
│   │   └── tasks/          # Background tasks/scheduled functions
│   │       └── example-item/
│   ├── libs/               # Shared libraries and utilities
│   │   ├── api/            # API Gateway utilities
│   │   ├── axios/          # HTTP client configuration
│   │   ├── error/          # Error handling utilities
│   │   ├── functions/      # Function configuration helpers
│   │   ├── lambda/         # Lambda invocation utilities
│   │   ├── ssm/            # AWS SSM Parameter Store client
│   │   └── utility/        # General utilities (logging, formatting)
│   ├── repository/         # Data access layer
│   │   ├── dynamo-client.ts       # DynamoDB operations
│   │   └── example-repository.ts  # Example domain repository
│   ├── services/           # Business logic layer
│   │   └── example/        # Example service functions
│   └── types/              # TypeScript type definitions
├── test/                   # Test files (mirrors src structure)
├── scripts/                # Build and deployment scripts
├── serverless.ts           # Serverless Framework configuration
├── tsconfig.json           # TypeScript configuration
├── vitest.config.ts        # Vitest test configuration
└── eslint.config.ts        # ESLint configuration
```

### Key Directories Explained

- **`functions/`**: Contains Lambda function handlers organized by type (API, tasks, events)
- **`libs/`**: Reusable utilities and middleware shared across functions
- **`repository/`**: Data access layer abstracting database operations
- **`services/`**: Business logic layer implementing core functionality
- **`types/`**: TypeScript interfaces and type definitions

## 🛠️ Development Guide

### Adding a New API Endpoint

1. **Create handler file** in `src/functions/api/your-endpoint/`:

```typescript
// src/functions/api/users/handler.ts
import { createHttpHandler, CustomError } from '@/libs';

export const getUsers = createHttpHandler<null>(async (event) => {
  // Your logic here
  return { users: [] };
});

export const createUser = createHttpHandler<{ name: string; email: string }>(async (event) => {
  const { body } = event;
  // Validation happens automatically with Zod
  // Your logic here
  return { id: '123', ...body };
});
```

2. **Create function configuration** in `src/functions/api/your-endpoint/index.ts`:

```typescript
// src/functions/api/users/index.ts
import { createApiFunction } from '@/libs/functions';

export const APIS_USERS = {
  GetUsers: createApiFunction({
    dir: import.meta.dirname,
    fnName: 'getUsers',
    method: 'GET',
    path: '/users',
  }),
  CreateUser: createApiFunction({
    dir: import.meta.dirname,
    fnName: 'createUser',
    method: 'POST',
    path: '/users',
  }),
};
```

3. **Register in serverless.ts**:

```typescript
import { APIS_USERS } from './src/functions/api/users';

const serverlessConfig: AWS = {
  // ...
  functions: {
    ...APIS_EXAMPLE,
    ...APIS_USERS, // Add your new functions
  },
};
```

### Adding a Repository

Create a new repository file in `src/repository/`:

```typescript
// src/repository/user-repository.ts
import { User } from '@/types';
import {
  createRecordOnDynamo,
  getRecordFromDynamo,
  updateRecordOnDynamo,
  deleteRecordFromDynamo,
} from './dynamo-client';

const TABLE_NAME = 'users-table';

export async function getUserById(id: string): Promise<User | undefined> {
  return await getRecordFromDynamo<User>(TABLE_NAME, { id });
}

export async function createUser(user: User): Promise<User> {
  return await createRecordOnDynamo<User>(TABLE_NAME, user);
}
```

### Adding a Service

Create business logic in `src/services/`:

```typescript
// src/services/user/user-create.ts
import { createUser as createUserRepo } from '@/repository/user-repository';
import { User } from '@/types';
import { logger } from '@/libs/utility';

export async function createUser(userData: Partial<User>): Promise<User> {
  logger.info('Creating new user', { userData });

  const user: User = {
    id: crypto.randomUUID(),
    ...userData,
    createdAt: new Date().toISOString(),
  };

  const result = await createUserRepo(user);

  logger.info('User created successfully', { userId: result.id });
  return result;
}
```

### Using Path Aliases

This template uses TypeScript path aliases for cleaner imports:

```typescript
// Instead of: import { logger } from '../../../libs/utility';
import { logger } from '@/libs/utility';

// Instead of: import { User } from '../../types';
import { User } from '@/types';
```

Available aliases:

- `@/libs` → `src/libs`
- `@/functions` → `src/functions`
- `@/repository` → `src/repository`
- `@/services` → `src/services`
- `@/types` → `src/types`

### Error Handling

Use `CustomError` for application errors:

```typescript
import { CustomError } from '@/libs/error';

// Throw with custom status code
throw new CustomError('User not found', 404);

// Default is 500
throw new CustomError('Internal error');

// Errors are automatically caught and formatted
```

### Logging

Use Winston logger for structured logging:

```typescript
import { logger } from '@/libs/utility';

logger.info('User created', { userId: '123' });
logger.error('Failed to create user', { error, userId: '123' });
logger.warn('User validation warning', { field: 'email' });
logger.debug('Debug information', { data });
```

## 🏗️ Architecture

This template follows a layered architecture:

```
┌─────────────────────────────────────┐
│   API Gateway / Lambda Triggers     │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│   Handlers (functions/)             │
│   - Parse events                    │
│   - Validate input                  │
│   - Format responses                │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│   Services (services/)              │
│   - Business logic                  │
│   - Orchestration                   │
│   - Error handling                  │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│   Repository (repository/)          │
│   - Data access                     │
│   - Database operations             │
│   - Data transformation             │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│   AWS Services (DynamoDB, etc.)     │
└─────────────────────────────────────┘
```

### Design Principles

- **Separation of Concerns**: Each layer has a specific responsibility
- **Type Safety**: Full TypeScript coverage with strict mode
- **Testability**: Pure functions and dependency injection
- **Reusability**: Shared utilities and middleware
- **Scalability**: Individual function packaging and optimization

## 🧪 Testing

### Running Tests

```bash
# Run tests in watch mode
pnpm run test

# Run tests once
pnpm run test:run

# Run tests with coverage
pnpm run test:coverage
```

### Writing Tests

Create test files in the `test/` directory mirroring your source structure:

```typescript
// test/services/user.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createUser } from '@/services/user/user-create';
import * as userRepo from '@/repository/user-repository';

describe('User Service', () => {
  it('should create a user', async () => {
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };

    vi.spyOn(userRepo, 'createUser').mockResolvedValue(mockUser);

    const result = await createUser({ name: 'John', email: 'john@example.com' });

    expect(result).toEqual(mockUser);
    expect(userRepo.createUser).toHaveBeenCalled();
  });
});
```

## 🚢 Deployment

### Environment Stages

```bash
# Deploy to development (default)
pnpm run deploy

# Deploy to specific stage
serverless deploy --stage production

# Deploy single function (faster updates)
serverless deploy function --function GetUsers --stage dev
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# AWS Configuration
AWS_IAM_ROLE=arn:aws:iam::123456789:role/lambda-execution-role

# Stage-specific variables
STAGE=dev
REGION=ap-southeast-1

# Feature flags
ENABLE_DEBUG_LOGGING=true
```

### Deployment Script

The template includes a deployment script at `scripts/deploy.sh`:

```bash
# Make it executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run test:run
      - run: pnpm run deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📜 Scripts Reference

| Command                  | Description                                  |
| ------------------------ | -------------------------------------------- |
| `pnpm install`           | Install dependencies                         |
| `pnpm run build`         | Compile TypeScript to JavaScript             |
| `pnpm run clean`         | Remove build artifacts and dependencies      |
| `pnpm run dev`           | Start serverless offline (alias for offline) |
| `pnpm run offline`       | Run locally with serverless-offline          |
| `pnpm run deploy`        | Deploy to AWS (uses deploy script)           |
| `pnpm run test`          | Run tests in watch mode                      |
| `pnpm run test:run`      | Run tests once                               |
| `pnpm run test:coverage` | Run tests with coverage report               |
| `pnpm run type-check`    | Check TypeScript types without emitting      |
| `pnpm run lint`          | Check code for linting errors                |
| `pnpm run lint:fix`      | Fix auto-fixable linting errors              |
| `pnpm run format`        | Format code with Prettier                    |
| `pnpm run format:check`  | Check code formatting                        |

## 💡 Best Practices

### 1. Keep Functions Small

Each Lambda function should do one thing well. Don't create monolithic handlers.

### 2. Use Environment Variables

Store configuration in environment variables, never hardcode values.

### 3. Implement Proper Error Handling

Always use try-catch blocks and return meaningful error messages.

### 4. Log Structured Data

Use Winston logger with structured data for better observability:

```typescript
logger.info('Operation completed', { userId, actionType, duration });
```

### 5. Type Everything

Leverage TypeScript's type system. Avoid `any` types.

### 6. Write Tests

Aim for high test coverage, especially for business logic.

### 7. Optimize Cold Starts

- Keep dependencies minimal
- Use Lambda layers for shared dependencies
- Enable function warming for critical paths

### 8. Monitor and Alert

Set up CloudWatch alarms for:

- Error rates
- Execution duration
- Throttling

### 9. Version Control

Use semantic versioning and maintain a changelog.

### 10. Security

- Rotate credentials regularly
- Use AWS Secrets Manager for sensitive data
- Apply principle of least privilege to IAM roles

## 🔧 Configuration

### Serverless Configuration

Edit `serverless.ts` to customize:

```typescript
const serverlessConfig: AWS = {
  service: 'your-service-name', // Change service name
  provider: {
    stage: "${opt:stage, 'dev'}",
    runtime: 'nodejs24.x', // Node.js version
    region: 'ap-southeast-1', // AWS region
    timeout: 29, // Function timeout (seconds)
    memorySize: 512, // Memory allocation (MB)
    architecture: 'arm64', // arm64 or x86_64
  },
};
```

### TypeScript Configuration

The `tsconfig.json` is configured with:

- Strict mode enabled
- ES2022 target
- Path aliases (@/libs, @/types, etc.)
- Source maps for debugging

### ESLint Configuration

Extends `@serverless/eslint-config` with TypeScript support.

## 📚 Additional Resources

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**theDashpuntsag**

- GitHub: [@theDashpuntsag](https://github.com/theDashpuntsag)
