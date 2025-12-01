import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { CustomGetCommandInput } from '../types/command.types';
import { extractExpAttributeNamesFromExpression, replaceReservedKeywordsFromProjection } from '../utils';

/**
 * Build a DynamoDB {@link GetCommandInput} from a higher-level input shape.
 *
 * ### Process flow
 * 1. Extracts relevant fields from the input object.
 * 2. If `projectionExpression` is provided, it replaces reserved keywords and prepares the expression.
 * 3. Builds the initial `GetCommandInput` object with table name, key, and optional parameters.
 * 4. Combines `ExpressionAttributeNames` from:
 *   - Extracted names from `ProjectionExpression`.
 *   - Any additional names provided in `extraExpressionAttributeNames`.
 * 5. Adds `ExpressionAttributeNames` to the command if any are present.
 * 6. Returns the final `GetCommandInput` object.
 *
 * ### Notes
 * - If `projectionExpression` is provided, reserved keywords are replaced and
 *   `ExpressionAttributeNames` are composed automatically from the projection.
 * - Any provided `expressionAttributeNames` are merged on top of the extracted ones.
 *
 * ### Contract
 * - Input: {@link CustomGetCommandInput} containing table name, key, and optional projection.
 * - Output: A fully-formed `GetCommandInput` safe to pass to the AWS SDK.
 * - Error: This function does not throw; let the caller handle AWS command errors.
 *
 * @param input - The higher-level input for building the GetCommand.
 * @returns The constructed {@link GetCommandInput}.
 */

export function buildGetCommandInput(input: CustomGetCommandInput): GetCommandInput {
  const {
    tableName: TableName, // The name of the DynamoDB table
    key: Key, // The key of the item to retrieve
    projectionExpression, // Optional: Specifies attributes to retrieve
    expressionAttributeNames: extraExpressionAttributesNames, // Additional expression attribute names
    consistentRead: ConsistentRead, // Optional: Specifies whether to use strongly consistent reads
    returnConsumedCapacity: ReturnConsumedCapacity, // Optional: Determines whether to return consumed capacity
  } = input;

  const ProjectionExpression = projectionExpression
    ? replaceReservedKeywordsFromProjection(projectionExpression)
    : undefined;

  const commandInput: GetCommandInput = {
    TableName,
    Key,
    ProjectionExpression,
    ConsistentRead,
    ReturnConsumedCapacity,
  };

  const expressionAttributeNames: Record<string, string> = {
    ...(ProjectionExpression ? extractExpAttributeNamesFromExpression(ProjectionExpression) : {}),
    ...(extraExpressionAttributesNames ?? {}),
  };

  if (Object.keys(expressionAttributeNames).length > 0) {
    commandInput.ExpressionAttributeNames = expressionAttributeNames;
  }

  return commandInput;
}
