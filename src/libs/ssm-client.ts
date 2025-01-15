import { logger } from '@/libs';
import { GetParameterCommand, ParameterType, PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'ap-southeast-1' });

async function getParameterStoreVal(paramName: string, isDecrypt: boolean = false): Promise<string | undefined> {
  try {
    const response = await client.send(
      new GetParameterCommand({
        Name: paramName,
        WithDecryption: isDecrypt,
      })
    );
    return response.Parameter?.Value;
  } catch (error: unknown) {
    logger.error(`Error retrieving parameter: ${error}`);
    throw new Error(`Failed to retrieve parameter: ${paramName}`);
  }
}

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
        Overwrite: overwrite,
      })
    );
  } catch (error: unknown) {
    logger.error(`Error retrieving parameter: ${error}`);
    throw new Error(`Failed to retrieve parameter: ${paramName}`);
  }
}

export { getParameterStoreVal, updateParameterStoreVal };
