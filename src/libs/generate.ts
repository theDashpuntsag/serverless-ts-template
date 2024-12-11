function generatePathname(context: string): string {
  return `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`;
}

const defaultConfig = {
  cors: {
    origin: '*',
    headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
  },
};

const authHeader = {
  authorizer: {
    type: 'COGNITO_USER_POOLS',
    authorizerId: {
      Ref: 'CognitoAuthorizer',
    },
  },
  throttling: {
    maxRequestsPerSecond: 10000,
    maxConcurrentRequests: 5000,
  },
  cors: {
    origin: '*',
    headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
  },
};

export function createDefaultFunc(dirname: string, handlerName: string, other: object = {}) {
  return {
    handler: `${generatePathname(dirname)}/handler.${handlerName}`,
    ...other,
  };
}

export function createDefaultApiGatewayFunc(
  dirname: string,
  funcNm: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dirname)}/handler.${funcNm}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...defaultConfig,
        },
      },
    ],
    ...other,
  };
}

export function createAuthApiGatewayFunc(
  dirname: string,
  handler: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dirname)}/handler.${handler}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...authHeader,
        },
      },
    ],
    ...other,
  };
}

export function createScheduledFunc(
  dir: string,
  handler: string,
  schedule: string[],
  name?: string,
  description = 'description',
  other: object = {}
) {
  return {
    handler: `${generatePathname(dir)}/handler.${handler}`,
    events: [
      {
        schedule: {
          rate: schedule,
          name: name ? name : handler,
          description: description,
          ...other,
        },
      },
    ],
  };
}
