import type { LbdFuncResponse, GenericFuncResponse as Response } from '@/@types';
import { InvocationType as IType, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { logger } from '../utility';

const lambdaClient = new LambdaClient({ region: 'ap-southeast-1' });

/**
 * Invokes an AWS Lambda function with the specified name, payload, and invocation type.
 *
 * @param {string} fnName - The name of the AWS Lambda function to invoke.
 * @param {unknown} payload - The payload to send to the Lambda function.
 * @param {IType} iType - The type of invocation. Can be 'RequestResponse', 'Event', or 'DryRun'.
 *        Defaults to 'RequestResponse' if not specified.
 *
 * @returns {Promise<LbdFuncResponse>} - A promise that resolves to an object containing the status code and body
 *                                        returned by the Lambda function.
 *                                        - `statusCode`: HTTP status code returned by the function.
 *                                        - `body`: The parsed response body from the Lambda function.
 *
 * @throws {Error} - Throws an error if the Lambda invocation fails.
 *
 * @example
 * import { invokeLambdaFunc } from './lambdaInvoker';
 *
 * const payload = { key: 'value' };
 * const result = await invokeLambdaFunc('MyLambdaFunction', payload, 'RequestResponse');
 * console.log(result.statusCode); // 200
 * console.log(result.body); // Parsed response body
 *
 * @remarks
 * This function uses the AWS SDK for JavaScript v3's LambdaClient to send the invocation command.
 * Ensure that the Lambda function exists, the AWS region is set correctly, and the required IAM permissions are in place.
 */
export async function invokeLambdaFn<T>(fnName: string, payload: unknown, iType?: IType): Promise<Response<T>> {
  try {
    if (payload == null) {
      throw new Error(`invokeLambdaFn: "payload" is null/undefined for ${fnName}`);
    }

    const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));

    const awsResp = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: fnName,
        InvocationType: iType,
        Payload: encodedPayload,
      })
    );

    const raw = awsResp.Payload ? new TextDecoder('utf-8').decode(awsResp.Payload) : '';
    if (!raw) {
      throw new Error(`Failed to execute lambda function ${fnName}! No response payload.`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Lambda ${fnName} returned non-JSON payload: ${raw.slice(0, 200)}`);
    }
    const transportStatus = awsResp.StatusCode ?? 200;

    // If Lambda used the common { statusCode, body } shape
    if (
      parsed &&
      typeof parsed === 'object' &&
      ('statusCode' in (parsed as LbdFuncResponse) || 'body' in (parsed as LbdFuncResponse))
    ) {
      const { statusCode, body } = parsed as LbdFuncResponse;

      if (statusCode == null || body == null) {
        // Partial/atypical shape—return the whole parsed object
        return { statusCode: transportStatus, body: parsed as T };
      }

      // If body is a JSON string, parse it; otherwise pass through
      const finalBody = typeof body === 'string' ? JSON.parse(body) : body;
      return { statusCode: statusCode ?? 400, body: finalBody as T };
    }

    // Fallback: Lambda returned plain JSON (not APIGW-style)
    return { statusCode: transportStatus, body: parsed as T };
  } catch (error: unknown) {
    logger.error(`Error occurred on invokeLambdaFunc ${fnName}  ${JSON.stringify(error)}`);
    throw error;
  }
}
