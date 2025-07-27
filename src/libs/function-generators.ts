import { authenticatedApiFunctionConfig, defaultApiFunctionConfig, generatePathname } from './function-configs';

export function createDefaultFunction(dirname: string, handlerName: string, other: object = {}) {
  return {
    handler: `${generatePathname(dirname)}/handler.${handlerName}`,
    ...other
  };
}

export function createDefaultApiFunction(
  dirname: string,
  funcName: string,
  method: string,
  url: string,
  other: object = {}
): object {
  return {
    handler: `${generatePathname(dirname)}/handler.${funcName}`,
    events: [
      {
        http: {
          method: method,
          path: url,
          ...defaultApiFunctionConfig
        }
      }
    ],
    ...other
  };
}

export function createAuthenticatedApiFunction(
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
          ...authenticatedApiFunctionConfig
        }
      }
    ],
    ...other
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
          ...other
        }
      }
    ]
  };
}
