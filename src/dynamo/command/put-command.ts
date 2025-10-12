import type { PutCommandInput } from '@aws-sdk/lib-dynamodb';
import type { CustomPutCommandInput } from '../types';
import { extractExpAttributeNamesFromString, replaceReservedKeywordsFromProjection } from '../utils';

/**
 * Build a DynamoDB {@link PutCommandInput} from a higher-level input shape.
 *
 * Contract
 * - Input: {@link CustomPutCommandInput} carrying table name, item, and optional expressions.
 * - Output: A fully-formed `PutCommandInput` safe to pass to the AWS SDK.
 * - Error: This function does not throw; let the caller handle AWS command errors.
 *
 * Notes
 * - Put will overwrite an existing item with the same PK/SK unless a `conditionExpression`
 *   prevents it. Provide one for create-only semantics.
 * - When a condition is present, we auto-generate `ExpressionAttributeNames` from the item keys
 *   to help with reserved keywords, and merge with any user-provided names.
 *
 * @typeParam T - The item type to put.
 * @param input - Parameters for building the Put command.
 * @returns A configured `PutCommandInput`.
 *
 * @example Conditional create-only
 * ```ts
 * const cmd = buildPutCommandInput<User>({
 *   tableName: 'Users',
 *   item: { pk: 'USER#1', sk: 'PROFILE', email: 'x@y.z' },
 *   conditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
 *   expressionAttributeNames: { '#pk': 'pk', '#sk': 'sk' },
 *   returnValues: 'NONE',
 * });
 * ```
 */
export function buildPutCommandInput<T>(input: CustomPutCommandInput<T>): PutCommandInput {
  const {
    tableName: TableName,
    item,
    conditionExpression: ConditionExpression,
    expressionAttributeNames: providedNames,
    expressionAttributeValues: providedValues,
    returnValues: ReturnValues = 'NONE',
    returnConsumedCapacity: ReturnConsumedCapacity,
    returnItemCollectionMetrics: ReturnItemCollectionMetrics,
  } = input;

  const Item = item as Record<string, unknown>;

  const commandInput: PutCommandInput = {
    TableName,
    Item,
    ConditionExpression,
    ReturnValues,
    ReturnConsumedCapacity,
    ReturnItemCollectionMetrics,
  };

  // Generate `ExpressionAttributeNames` if `ConditionExpression` exists
  const generatedNames = ConditionExpression
    ? extractExpAttributeNamesFromString(replaceReservedKeywordsFromProjection(Object.keys(Item).join(', ')))
    : {};

  // Merge provided and generated names if either exists
  const mergedNames = { ...generatedNames, ...providedNames };
  if (Object.keys(mergedNames).length > 0) {
    commandInput.ExpressionAttributeNames = mergedNames;
  }

  // Include `ExpressionAttributeValues` if provided
  if (providedValues) {
    commandInput.ExpressionAttributeValues = providedValues;
  }

  return commandInput;
}
