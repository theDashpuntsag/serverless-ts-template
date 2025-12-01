import axios from 'axios';

class ParsedAxiosError extends Error {
  public statusCode: number | null;
  public data: unknown;

  constructor(message: string, statusCode: number | null, data: unknown) {
    super(message);
    this.name = 'ParsedAxiosError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Parses an Axios error and extracts relevant information.
 *
 * @param error - The error object thrown by an Axios request.
 * @returns - A ParsedAxiosError containing the message, status code, and response data, or the original error if it's not an Axios error.
 */
export function parseAxiosError(error: unknown): unknown {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status ?? null;
    const data = error.response?.data ?? null;
    const message = error.message || 'An error occurred during the Axios request';
    return new ParsedAxiosError(message, statusCode, data);
  }
  return error;
}
