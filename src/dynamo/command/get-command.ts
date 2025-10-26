import type { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import type { CustomGetCommandInput } from '../types';

import { extractExpAttributeNamesFromString, replaceReservedKeywordsFromProjection } from '../utils';

/**
 * Build a DynamoDB {@link GetCommandInput} from a higher-level input shape.
 *
 * Contract
 * - Input: {@link CustomGetCommandInput} containing table name, key, and optional projection.
 * - Output: A fully-formed `GetCommandInput` safe to pass to the AWS SDK.
 * - Error: This function does not throw; let the caller handle AWS command errors.
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
 *
 * ### Notes
 * - If `projectionExpression` is provided, reserved keywords are replaced and
 *   `ExpressionAttributeNames` are composed automatically from the projection.
 * - Any provided `expressionAttributeNames` are merged on top of the extracted ones.
 *
 * @param input - Parameters for building the Get command.
 * @returns A configured `GetCommandInput`.
 *
 * @example With projection aliases
 * ```ts
 * const input: CustomGetCommandInput = {
 *   tableName: 'UsersTable',
 *   key: { userId: '123' },
 *   projectionExpression: '#name, #age',
 *   consistentRead: true,
 *   returnConsumedCapacity: 'TOTAL',
 * };
 * const commandInput = buildGetCommandInput(input);
 * // commandInput.ExpressionAttributeNames includes { '#name': 'name', '#age': 'age' }
 * ```
 *
 * @example Without projection
 * ```ts
 * const commandInput = buildGetCommandInput({
 *   tableName: 'UsersTable',
 *   key: { userId: '123' },
 * });
 * // No ProjectionExpression or ExpressionAttributeNames are included
 * ```
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

  // Generate ProjectionExpression and merge reserved keyword replacements
  const ProjectionExpression = projectionExpression
    ? replaceReservedKeywordsFromProjection(projectionExpression)
    : undefined;

  // Build the initial GetCommandInput object
  const commandInput: GetCommandInput = {
    TableName,
    Key,
    ProjectionExpression,
    ConsistentRead,
    ReturnConsumedCapacity,
  };

  // Combine extracted attribute names from the projection expression with additional ones
  const expressionAttributeNames: Record<string, string> = {
    ...(ProjectionExpression && extractExpAttributeNamesFromString(ProjectionExpression)),
    ...extraExpressionAttributesNames,
  };

  // Add ExpressionAttributeNames to the command if any are present
  if (expressionAttributeNames && Object.keys(expressionAttributeNames).length > 0) {
    commandInput.ExpressionAttributeNames = expressionAttributeNames;
  }

  return commandInput;
}
