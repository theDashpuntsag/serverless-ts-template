import type { GenericFuncResponse, LbdFuncResponse } from '@/types';

import { InvocationType, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { logger } from '../utility/winston';

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });

/**
 * Invokes an AWS Lambda function with the specified name, payload, and invocation type.
 *
 * @param {string} fnName - The name of the AWS Lambda function to invoke.
 * @param {object} payload - The payload to send to the Lambda function.
 * @param {InvocationType} invokeType - The type of invocation. Can be 'RequestResponse', 'Event', or 'DryRun'.
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
 * Ensure that the Lambda function exists, the AWS  is set correctly, and the required IAM permissions are in place.
 */
export async function invokeLambdaFunc<T>(
  fnName: string,
  payload: object,
  invokeType: InvocationType = 'RequestResponse'
): Promise<GenericFuncResponse<T>> {
  try {
    const response = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: fnName,
        Payload: JSON.stringify({ ...payload }),
        InvocationType: invokeType ? invokeType : 'RequestResponse',
      })
    );
    const resPayload = JSON.parse(new TextDecoder('utf-8').decode(response.Payload)) as LbdFuncResponse;
    if (!resPayload) {
      logger.error(`Failed to execute lambda function ${fnName}! No response from lambda function`);
      throw new Error(`Failed to execute lambda function ${fnName}! No response from lambda function`);
    }
    return { statusCode: resPayload.statusCode || 400, body: JSON.parse(resPayload.body) as T };
  } catch (error: unknown) {
    logger.error(`Error occurred on invokeLambdaFunc ${fnName}  ${JSON.stringify(error)}`);
    throw error;
  }
}
