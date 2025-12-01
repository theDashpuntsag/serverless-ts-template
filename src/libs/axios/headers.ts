export type CustomHeader = { Authorization: string; 'Content-Type': string };

/**
 * Creates a Bearer Authorization header object.
 * @param token - The Bearer token.
 * @param contentType - Content type for the header
 * @returns An object containing the Authorization header.
 */
export function createBearerAuthHeader(token: string, contentType: string = 'application/json'): CustomHeader {
  return { Authorization: `Bearer ${token}`, 'Content-Type': contentType };
}

/**
 * Creates a Basic Authorization header object.
 * @param username - The username for basic auth.
 * @param password - The password for basic auth.
 * @param contentType - ContentType for basic auth
 * @returns An object containing the Authorization header.
 */
export function createBasicAuthHeader(
  username: string,
  password: string,
  contentType = 'application/json'
): CustomHeader {
  const credentials = `${username}:${password}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  return {
    Authorization: `Basic ${encodedCredentials}`,
    'Content-Type': contentType,
  };
}
