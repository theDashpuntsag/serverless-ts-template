export type FuncParams = {
  directory: string;
  handlerPath?: string;
  handlerFn: string;
  other?: Record<string, unknown>;
};

export type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'options'
  | 'head'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export type HttpCorsConfig =
  | boolean
  | {
      origin?: string;
      headers?: string[];
      [key: string]: unknown;
    };

export type ApiHttpConfig = {
  method: HttpMethod;
  path: string; // HTTP path (e.g., '/v1/deposits/{id}')
  cors?: HttpCorsConfig;
  more?: Record<string, unknown>;
};

export type ApiFuncParams = {
  directory: string;
  handlerPath?: string;
  handlerFn: string;
  http: ApiHttpConfig;
  other?: Record<string, unknown>;
};

export type CognitoAuthorizerConfig = {
  arn: string;
  type?: 'COGNITO_USER_POOLS' | 'cognito_user_pools';
  name?: string;
  [key: string]: unknown;
};

export type CognitoFuncParams = {
  directory: string;
  handlerPath?: string;
  handlerFn: string;
  http: ApiHttpConfig & {
    authorizer: CognitoAuthorizerConfig;
  };
  other?: Record<string, unknown>;
};
