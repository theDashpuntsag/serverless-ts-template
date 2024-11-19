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

function createDefaultFunc(dirname: string, handlerName: string, other: object = {}) {
  return {
    handler: `${generatePathname(dirname)}/handler.${handlerName}`,
    ...other,
  };
}

function createDefaultApiGatewayFunc(
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

function createAuthApiGatewayFunc(
  dirname: string,
  handlerName: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dirname)}/handler.${handlerName}`,
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

export { createDefaultFunc, createDefaultApiGatewayFunc, createAuthApiGatewayFunc };
