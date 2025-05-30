/* eslint-disable no-undef */
import { logger } from '@/libs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export type CustomHeader = { Authorization: string; 'Content-Type': string };

/**
 * Creates a Bearer Authorization header object.
 * @param token - The Bearer token.
 * @param contentType - Content type for the header
 * @returns An object containing the Authorization header.
 */
function createBearerAuthHeader(token: string, contentType: string = 'application/json'): CustomHeader {
  return { Authorization: `Bearer ${token}`, 'Content-Type': contentType };
}

/**
 * Creates a Basic Authorization header object.
 * @param username - The username for basic auth.
 * @param password - The password for basic auth.
 * @param contentType - ContentType for basic auth
 * @returns An object containing the Authorization header.
 */
function createBasicAuthHeader(username: string, password: string, contentType = 'application/json'): CustomHeader {
  const credentials = `${username}:${password}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  return {
    Authorization: `Basic ${encodedCredentials}`,
    'Content-Type': contentType,
  };
}

/**
 * Sends an HTTP request using Axios and returns the response.
 *
 * @template Response - The expected type of the response data.
 * @template Request - The expected type of the request data.
 *
 * @param {AxiosRequestConfig<Request>} params - The Axios request configuration object.
 *   - `url` (string): The endpoint URL.
 *   - `method` (Method): The HTTP method to use (GET, POST, etc.).
 *   - `headers` (AxiosRequestHeaders): Optional HTTP headers.
 *   - `params` (object): URL parameters to be sent with the request.
 *   - `data` (Request): The request payload for methods like POST or PUT.
 *   - `timeout` (number): Optional timeout in milliseconds.
 *
 * @returns {Promise<AxiosResponse<Response>>} - A promise that resolves to the Axios response.
 *
 * @throws Will throw an error if the HTTP request fails.
 *
 * @example
 * // Sending a GET request
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const response = await sendRequest<User>({
 *   url: '/api/users/1',
 *   method: 'GET',
 * });
 * console.log(response.data); // User data
 *
 * @example
 * // Sending a POST request with data
 * interface NewUser {
 *   name: string;
 * }
 *
 * const newUser: NewUser = { name: 'John Doe' };
 *
 * const response = await sendRequest<User, NewUser>({
 *   url: '/api/users',
 *   method: 'POST',
 *   data: newUser,
 * });
 * console.log(response.data); // Created user data
 */
async function sendRequest<Response = unknown, Request = Record<string, unknown>>(
  params: AxiosRequestConfig<Request>
): Promise<AxiosResponse<Response>> {
  try {
    const response = await axios.request<Response, AxiosResponse<Response>, Request>(params);
    return response;
  } catch (error: unknown) {
    logger.error(`Error occurred while invoking ${params.method?.toUpperCase()} request to ${params.url}`);
    throw error;
  }
}

export { createBasicAuthHeader, createBearerAuthHeader, sendRequest };
