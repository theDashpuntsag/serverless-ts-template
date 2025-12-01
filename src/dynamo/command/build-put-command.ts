import { PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { CustomPutCommandInput } from '../types';
import { extractExpAttributeNamesFromExpression } from '../utils';

/**
 * Build a DynamoDB {@link PutCommandInput} from a higher-level input shape.
 *
 * ### Process flow
 * 1. Extracts relevant fields from the input object.
 * 2. Builds the initial `PutCommandInput` object with table name, item, and optional parameters.
 * 3. If `conditionExpression` is provided, it extracts attribute names and merges them with any provided names.
 * 4. Adds `ExpressionAttributeNames` and `ExpressionAttributeValues` to the command if any are present.
 * 5. Returns the final `PutCommandInput` object.
 *
 * ### Notes
 * - If `conditionExpression` is provided, `ExpressionAttributeNames` are composed automatically from the condition.
 * - Any provided `expressionAttributeNames` are merged on top of the extracted ones.
 * - `expressionAttributeValues` are added directly if provided.
 *
 * ### Contract
 * - Input: {@link CustomPutCommandInput} containing table name, item, and optional parameters.
 * - Output: A fully-formed `PutCommandInput` safe to pass to the AWS SDK.
 * - Error: This function does not throw; let the caller handle AWS command errors.
 *
 * @param input - The higher-level input for building the PutCommand.
 * @returns The constructed {@link PutCommandInput}.
 */
export function buildPutCommandInput(input: CustomPutCommandInput): PutCommandInput {
  const {
    tableName,
    item,
    conditionExpression,
    expressionAttributeNames,
    expressionAttributeValues,
    returnValues = 'NONE',
    returnConsumedCapacity,
    returnItemCollectionMetrics,
  } = input;

  const commandInput: PutCommandInput = {
    TableName: tableName,
    Item: item as Record<string, unknown>,
    ConditionExpression: conditionExpression,
    ReturnValues: returnValues,
    ReturnConsumedCapacity: returnConsumedCapacity,
    ReturnItemCollectionMetrics: returnItemCollectionMetrics,
  };

  // Only do any name/values work if needed
  const hasCondition = !!conditionExpression;
  const hasProvidedNames = !!expressionAttributeNames && Object.keys(expressionAttributeNames).length > 0;

  if (hasCondition || hasProvidedNames) {
    const generatedNames = hasCondition ? extractExpAttributeNamesFromExpression(conditionExpression) : {};

    const mergedNames = hasProvidedNames ? { ...generatedNames, ...expressionAttributeNames } : generatedNames;

    if (Object.keys(mergedNames).length > 0) {
      commandInput.ExpressionAttributeNames = mergedNames;
    }
  }

  if (expressionAttributeValues && Object.keys(expressionAttributeValues).length > 0) {
    commandInput.ExpressionAttributeValues = expressionAttributeValues;
  }

  return commandInput;
}
