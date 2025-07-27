import type { ParameterType } from '@aws-sdk/client-ssm';

import { GetParameterCommand, PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { logger } from '@/libs';

const client = new SSMClient({ region: 'ap-southeast-1' });

/**
 * Retrieves the value of a parameter from AWS SSM Parameter Store.
 *
 * @param {string} paramName - The name of the parameter to retrieve.
 * @param {boolean} [isDecrypt=false] - If set to `true`, the parameter value will be decrypted.
 * @returns {Promise<string | undefined>} The parameter value if found; otherwise, `undefined`.
 *
 * @throws {Error} Throws an error if the parameter cannot be retrieved.
 */
async function getParameterStoreVal(paramName: string, isDecrypt: boolean = false): Promise<string | undefined> {
  try {
    const response = await client.send(
      new GetParameterCommand({
        Name: paramName,
        WithDecryption: isDecrypt
      })
    );
    return response.Parameter?.Value;
  } catch (error: unknown) {
    logger.error(`Error retrieving parameter: ${error}`);
    throw new Error(`Failed to retrieve parameter: ${paramName}`);
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
async function updateParameterStoreVal(
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
        Overwrite: overwrite
      })
    );
  } catch (error: unknown) {
    logger.error(`Error updating parameter: ${error}`);
    throw new Error(`Failed to update parameter: ${paramName}`);
  }
}

export { getParameterStoreVal, updateParameterStoreVal };
