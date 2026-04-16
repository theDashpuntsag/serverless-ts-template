import { ApiFuncParams, CognitoFuncParams, FuncParams } from './function.types';

const DEFAULT_CORS_HEADERS = [
  'Content-Type',
  'X-Amz-Date',
  'Authorization',
  'X-Api-Key',
  'X-Amz-Security-Token',
  'X-Amz-User-Agent',
  'Permission',
];

/**
 * Builds the handler string in the format of 'relative/path/to/handlerFile.handlerFunctionName'.
 * @param directory The base directory where the handler file is located.
 * @param handlerPath Optional sub-path to the handler file (defaults to 'handler').
 * @param handlerFn  The name of the exported handler function in the handler file.
 * @returns A string representing the handler path for Serverless configuration.
 */
function buildHandler(directory: string, handlerPath: string | undefined, handlerFn: string): string {
  return `${generatePathname(directory)}/${handlerPath ?? 'handler'}.${handlerFn}`;
}

/**
 * Builds the CORS configuration for API Gateway based on the provided input.
 * @param cors The CORS configuration which can be a boolean or an object with specific CORS settings.
 * @returns  An object representing the CORS configuration for API Gateway, or undefined if CORS is disabled.
 */
function buildCorsConfig(cors: ApiFuncParams['http']['cors']) {
  if (cors === false) {
    return undefined;
  }

  if (cors && typeof cors === 'object') {
    return {
      origin: cors.origin ?? '*',
      headers: cors.headers ?? DEFAULT_CORS_HEADERS,
      ...cors,
    };
  }

  return {
    origin: '*',
    headers: DEFAULT_CORS_HEADERS,
  };
}

/**
 * Normalizes the Cognito authorizer configuration.
 * @param authorizer The Cognito authorizer configuration.
 * @returns A normalized Cognito authorizer configuration.
 */
function normalizeCognitoAuthorizer(authorizer: CognitoFuncParams['http']['authorizer']) {
  const normalizedArn = authorizer.arn.trim();
  if (!normalizedArn) {
    throw new Error('createCognitoAuthorizedApiFunction: `http.authorizer.arn` is required.');
  }

  if (authorizer.type && authorizer.type.toUpperCase() !== 'COGNITO_USER_POOLS') {
    throw new Error(
      'createCognitoAuthorizedApiFunction: `http.authorizer.type` must be `COGNITO_USER_POOLS` when using Cognito authorizer.'
    );
  }

  return {
    ...authorizer,
    arn: normalizedArn,
    type: 'COGNITO_USER_POOLS' as const,
  };
}

/**
 * Generates a normalized pathname relative to the project root.
 * Optimized to avoid multiple string operations.
 * @param context The context path to normalize.
 * @returns A normalized pathname relative to the project root.
 */
export function generatePathname(context: string): string {
  const cwd = process.cwd();
  return context.startsWith(cwd) ? context.slice(cwd.length + 1).replace(/\\/g, '/') : context.replace(/\\/g, '/');
}

/**
 * Returns a default Lambda function configuration.
 * @param params The parameters for the Lambda function.
 * @returns A default Lambda function configuration.

 */
export function createDefaultFunction(params: FuncParams) {
  const { directory, handlerPath, handlerFn, other } = params;
  return {
    handler: buildHandler(directory, handlerPath, handlerFn),
    ...(other ?? {}),
  };
}

/**
 * Returns a default API Lambda function configuration with HTTP event.
 * @param params The parameters for the API Lambda function.
 * @returns A default API Lambda function configuration with HTTP event.
 */
export function createDefaultApiFunc(params: ApiFuncParams) {
  const { directory, handlerPath, handlerFn, http, other } = params;
  const { method, path, cors, more } = http;
  const normalizedCors = buildCorsConfig(cors);
  return {
    handler: buildHandler(directory, handlerPath, handlerFn),
    events: [
      {
        http: {
          method,
          path,
          ...(normalizedCors ? { cors: normalizedCors } : {}),
          ...(more ?? {}),
        },
      },
    ],
    ...(other ?? {}),
  };
}

/**
 * Returns a Cognito-authorized API Lambda function configuration with HTTP event.
 * @param params The parameters for the Cognito-authorized API Lambda function.
 * @returns A Cognito-authorized API Lambda function configuration with HTTP event.
 */
export function createCognitoAuthorizedApiFunction(params: CognitoFuncParams) {
  const { directory, handlerPath, handlerFn, http, other } = params;
  const { method, path, cors, authorizer, more } = http;

  const normalizedCors = buildCorsConfig(cors);
  const normalizedAuthorizer = normalizeCognitoAuthorizer(authorizer);

  return {
    handler: buildHandler(directory, handlerPath, handlerFn),
    events: [
      {
        http: {
          method,
          path,
          authorizer: normalizedAuthorizer,
          ...(normalizedCors ? { cors: normalizedCors } : {}),
          ...(more ?? {}),
        },
      },
    ],
    ...(other ?? {}),
  };
}
