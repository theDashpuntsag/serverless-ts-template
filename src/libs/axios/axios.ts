import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

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
export async function sendRequest<Response = unknown, Request = Record<string, unknown>>(
  params: AxiosRequestConfig<Request>
): Promise<AxiosResponse<Response>> {
  try {
    const response = await axios.request<Response, AxiosResponse<Response>, Request>(params);
    return response;
  } catch (error: unknown) {
    console.error(`Error occurred while invoking ${params.method?.toUpperCase()} request to ${params.url}`);
    throw error;
  }
}
