import { LbdFuncResponse, GenericFuncResponse as Response } from '@/types';
import { InvocationType as IType, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { logger } from '../utility';

const lambdaClient = new LambdaClient({ region: 'ap-southeast-1' });

// Default (RequestResponse)
export async function invokeLambdaFn<T>(_fnName: string, _payload: unknown): Promise<Response<T>>;
// Explicit RequestResponse
export async function invokeLambdaFn<T>(
  _fnName: string,
  _payload: unknown,
  _iType: 'RequestResponse'
): Promise<Response<T>>;
// Event type → fire and forget
export async function invokeLambdaFn<_T>(_fnName: string, _payload: unknown, _iType: 'Event'): Promise<void>;
// DryRun → validates only
export async function invokeLambdaFn<T>(_fnName: string, _payload: unknown, _iType: 'DryRun'): Promise<Response<T>>;

/**
 * Invokes an AWS Lambda function with the specified name, payload, and invocation type.
 *
 * This function supports three invocation modes through TypeScript overloads:
 * - **RequestResponse** (default): Synchronously invokes the Lambda and returns the response.
 * - **Event**: Asynchronously invokes the Lambda (fire-and-forget) and returns void.
 * - **DryRun**: Validates the invocation parameters without executing the function.
 *
 * @template T - The expected type of the response body from the Lambda function.
 *
 * @param {string} fnName - The name of the AWS Lambda function to invoke.
 * @param {unknown} payload - The payload to send to the Lambda function. Must not be null or undefined.
 * @param {IType} [iType='RequestResponse'] - The type of invocation:
 *        - `'RequestResponse'`: Waits for the function to complete and returns the response (default).
 *        - `'Event'`: Invokes the function asynchronously without waiting for a response.
 *        - `'DryRun'`: Validates the request without invoking the function.
 *
 * @returns {Promise<Response<T> | void>}
 *          - For `'RequestResponse'` and `'DryRun'`: Returns an object with:
 *            - `statusCode`: HTTP status code from the Lambda function.
 *            - `body`: The parsed response body of type T.
 *          - For `'Event'`: Returns void (no response expected).
 *
 * @throws {Error} - Throws an error if:
 *                   - The payload is null or undefined.
 *                   - The Lambda invocation fails (transport-level error).
 *                   - The Lambda returns a non-JSON payload for RequestResponse/DryRun modes.
 *                   - Event or DryRun invocations fail with a status code >= 400.
 *
 * @example
 * // Synchronous invocation (default RequestResponse)
 * const result = await invokeLambdaFn<{ message: string }>('MyLambdaFunction', { key: 'value' });
 * console.log(result.statusCode); // 200
 * console.log(result.body.message); // 'Success'
 *
 * @example
 * // Asynchronous invocation (fire-and-forget)
 * await invokeLambdaFn('MyLambdaFunction', { key: 'value' }, 'Event');
 * // No response returned
 *
 * @example
 * // Dry run (validation only)
 * const validation = await invokeLambdaFn('MyLambdaFunction', { key: 'value' }, 'DryRun');
 * console.log(validation.statusCode); // Status indicating validation result
 *
 * @remarks
 * - This function uses the AWS SDK for JavaScript v3's `LambdaClient` to send invocation commands.
 * - The Lambda function must exist in the `ap-southeast-1` region.
 * - Ensure proper IAM permissions are granted for Lambda invocation.
 * - The response body is automatically parsed from JSON strings when applicable.
 * - For `RequestResponse` mode, if the Lambda returns a standard format with `statusCode` and `body`,
 *   both are extracted and returned. Otherwise, the entire response is returned as the body.
 */
export async function invokeLambdaFn<T>(fnName: string, payload: unknown, iType?: IType): Promise<Response<T> | void> {
  try {
    const invocationType: IType = iType ?? 'RequestResponse';

    const awsResp = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: fnName,
        InvocationType: invocationType,
        Payload: ensurePayload(payload, fnName),
      })
    );
    const transportStatus = awsResp.StatusCode ?? 200;

    if (iType === 'Event') {
      // Optionally log success/failure
      if (transportStatus >= 400) {
        throw new Error(`Lambda ${fnName} Event invocation failed with status ${transportStatus}`);
      }
      return;
    }

    if (iType === 'DryRun') {
      if (transportStatus >= 400) {
        throw new Error(`Lambda ${fnName} DryRun failed with status ${transportStatus}`);
      }
      // No payload expected. Just surface the status.
      return { statusCode: transportStatus, body: null as unknown as T };
    }

    const raw = decodePayload(awsResp.Payload);
    if (!raw) {
      return { statusCode: transportStatus, body: null as unknown as T };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Lambda ${fnName} returned non-JSON payload: ${raw.slice(0, 200)}`);
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      ('statusCode' in (parsed as LbdFuncResponse) || 'body' in (parsed as LbdFuncResponse))
    ) {
      const { statusCode, body } = parsed as LbdFuncResponse;

      if (statusCode == null || body == null) {
        return { statusCode: transportStatus, body: parsed as T };
      }

      const finalBody = typeof body === 'string' ? JSON.parse(body) : body;
      return { statusCode: statusCode ?? 400, body: finalBody as T };
    }

    // Fallback: plain JSON object
    return { statusCode: transportStatus, body: parsed as T };
  } catch (error: unknown) {
    logger.error(`Error occurred on invokeLambdaFunc ${fnName}  ${JSON.stringify(error)}`);
    throw error;
  }
}

/**
 * Ensures the payload is valid and encodes it for Lambda invocation.
 *
 * @param payload - The payload to encode.
 * @param fnName
 * @returns
 */
function ensurePayload(payload: unknown, fnName: string): Uint8Array {
  if (payload == null) {
    throw new Error(`invokeLambdaFn: "payload" is null/undefined for ${fnName}`);
  }
  return new TextEncoder().encode(JSON.stringify(payload));
}

/**
 * Decodes the Lambda payload from various formats to a string.
 *
 * @param payload - The response payload from Lambda.
 * @returns - The decoded string payload.
 */
function decodePayload(payload?: Uint8Array | Blob | string): string {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  // Uint8Array in Node
  return new TextDecoder('utf-8').decode(payload as Uint8Array);
}
