export type LbdFuncResponse = {
  statusCode: number;
  body: object | string;
};

export type RequestMetadata = {
  token?: string;
  ipAddress?: string;
  headers: object;
  queryParams?: QueryParams | undefined;
  body?: object | string | number | null;
};

export type QueryParams = {
  [key: string]: string;
};

export type CognitoIdToken = {
  sub: string;
  email_verified: boolean;
  iss: string;
  'cognito:username': string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  email: string;
};
