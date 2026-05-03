import type { ParameterType } from '@aws-sdk/client-ssm';

import { GetParameterCommand, PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

type RetryableErrorLike = {
  $metadata?: {
    httpStatusCode?: number;
  };
  $retryable?: unknown;
};

function isRetryableErrorLike(error: unknown): error is RetryableErrorLike {
  return typeof error === 'object' && error !== null;
}

const client = new SSMClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });

/**
 * Retrieves the value of a parameter from AWS SSM Parameter Store.
 *
 * @param {string} paramName - The name of the parameter to retrieve.
 * @param {boolean} [isDecrypt=false] - If set to `true`, the parameter value will be decrypted.
 * @returns {Promise<string | undefined>} The parameter value if found; otherwise, `undefined`.
 *
 * @throws {Error} Throws an error if the parameter cannot be retrieved.
 */
export async function getParameterStoreVal(paramName: string, isDecrypt: boolean = false): Promise<string | undefined> {
  try {
    const response = await client.send(
      new GetParameterCommand({
        Name: paramName,
        WithDecryption: isDecrypt,
      })
    );
    return response.Parameter?.Value;
  } catch (error: unknown) {
    console.error(`Error retrieving parameter:`, error);
    throw error;
  }
}

/**
 * Updates or creates a parameter in AWS SSM Parameter Store.
 *
 * @param {string} paramName - The name of the parameter to update or create.
 * @param {string} paramValue - The value to set for the parameter.
 * @param {ParameterType} [paramType='String'] - The type of the parameter (e.g., String, SecureString).
 * @param {boolean} [overwrite=true] - Determines whether to overwrite an existing parameter with the same name.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @throws {Error} Throws an error if the parameter cannot be updated.
 */
export async function updateParameterStoreVal(
  paramName: string,
  paramValue: string,
  paramType: ParameterType = 'String',
  overwrite: boolean = true
): Promise<void> {
  try {
    await client.send(
      new PutParameterCommand({
        Name: paramName,
        Value: paramValue,
        Type: paramType,
        Overwrite: overwrite,
      })
    );
  } catch (error: unknown) {
    console.error(`Error updating parameter:`, error);
    throw error;
  }
}

/**
 * Updates a parameter in AWS SSM Parameter Store with retry logic for handling transient errors.
 * @param name - The name of the parameter to update.
 * @param value - The value to set for the parameter.
 * @param maxAttempts - The maximum number of retry attempts (default is 5).
 * @returns A promise that resolves when the parameter is successfully updated or rejects after exhausting retries.
 */
export async function updateParameterStoreValWithRetry(name: string, value: string, maxAttempts = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await updateParameterStoreVal(name, value);
      return;
    } catch (error: unknown) {
      const errorName = error instanceof Error ? error.name : undefined;
      const errorDetails = isRetryableErrorLike(error) ? error : undefined;

      const isRetryable =
        errorName === 'TooManyUpdates' ||
        errorName === 'ThrottlingException' ||
        errorDetails?.$metadata?.httpStatusCode === 429 ||
        Boolean(errorDetails?.$retryable);

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = Math.min(500 * 2 ** attempt, 8_000);
      const jitterMs = Math.floor(Math.random() * 300);

      console.warn(`Retrying SSM parameter update: ${name}. Attempt ${attempt}/${maxAttempts}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs + jitterMs));
    }
  }
}
