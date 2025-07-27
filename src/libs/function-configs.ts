export function generatePathname(context: string): string {
  return `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`;
}

export const defaultApiFunctionConfig = {
  cors: {
    origin: '*',
    headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent']
  }
};

export const authenticatedApiFunctionConfig = {
  authorizer: {
    type: 'COGNITO_USER_POOLS',
    authorizerId: {
      Ref: 'CognitoAuthorizer'
    }
  },
  cors: {
    origin: '*',
    headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent']
  }
};
