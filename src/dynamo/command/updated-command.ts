import type { UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { CustomUpdateItemInput } from '../types';
import { extractExpAttributeNamesFromUpdate, replaceReservedKeywordsFromUpdateExp } from '../utils';

/**
 * Build a DynamoDB {@link UpdateCommandInput} from a higher-level input shape.
 *
 * This helper supports two modes:
 * 1) Explicit: if `updateExpression` is provided, it is passed through as-is along with any
 *    provided expression attribute names/values.
 * 2) Generated: if `updateExpression` is not provided, an expression like
 *    `SET field1 = :field1, field2 = :field2, ...` is generated from `input.item` and
 *    reserved keywords are safely replaced. Attribute maps are merged accordingly.
 *
 * ### Process flow
 *  1. Extracts relevant fields from the input object.
 *  2. If `updateExpression` is provided:
 *    - Constructs the `UpdateCommandInput` directly using the provided expression and merges
 *      any additional attribute names/values.
 *  3. If `updateExpression` is not provided:
 *    - Iterates over the keys in `item` to build a `SET` clause for the update expression.
 *    - Generates unique placeholders for attribute values to avoid conflicts.
 *    - Replaces reserved keywords in the generated expression.
 *    - Merges dynamically generated attribute names and values with any provided ones.
 *  4. Returns the fully constructed `UpdateCommandInput`.
 *
 * ### Contract
 *  - Input: {@link CustomUpdateItemInput} describing table, key, and either an explicit update
 *    expression or an `item` whose fields will be set.
 *  - Output: A fully-formed {@link UpdateCommandInput} safe to pass to the AWS SDK.
 *  - Error: This function does not throw; let the caller handle AWS command errors.
 *
 * ### Notes
 *  - The return shape from AWS depends on `ReturnValues`.
 *  - When generating the expression, all keys in `item` are included in a single `SET` clause.
 *  - Expression attribute names are composed from detected placeholders and any extras provided.
 *
 * @typeParam T - The partial entity type containing fields being updated.
 * @param input - The high-level update input.
 * @returns A DynamoDB {@link UpdateCommandInput}.
 *
 * @example Explicit expression
 * ```ts
 * const cmd = buildUpdateCommandInput<User>({
 *   tableName: 'Users',
 *   key: { pk: 'USER#1', sk: 'PROFILE' },
 *   updateExpression: 'SET #email = :email',
 *   expressionAttributeNames: { '#email': 'email' },
 *   expressionAttributeValues: { ':email': 'new@example.com' },
 *   returnValues: 'ALL_NEW',
 * });
 * ```
 *
 * @example Generated expression from item fields
 * ```ts
 * const cmd = buildUpdateCommandInput<User>({
 *   tableName: 'Users',
 *   key: { pk: 'USER#1', sk: 'PROFILE' },
 *   item: { email: 'new@example.com', name: 'Alice' },
 *   returnValues: 'ALL_NEW',
 * });
 * // Produces SET email = :email, name = :name with appropriate maps
 * ```
 */
export function buildUpdateCommandInput<T>(input: CustomUpdateItemInput<T>): UpdateCommandInput {
  const {
    tableName: TableName,
    item,
    key: Key,
    updateExpression,
    conditionExpression: ConditionExpression,
    expressionAttributeNames,
    expressionAttributeValues,
    extraExpAttributeNames,
    extraExpressionAttributeValues = {},
    returnValues: ReturnValues = 'NONE',
    returnConsumedCapacity: ReturnConsumedCapacity,
    returnItemCollectionMetrics: ReturnItemCollectionMetrics,
  } = input;

  const mergedNames: Record<string, string> = { ...expressionAttributeNames, ...extraExpAttributeNames };
  const mergedValues = { ...expressionAttributeValues, ...extraExpressionAttributeValues };

  if (updateExpression) {
    return {
      TableName,
      Key,
      UpdateExpression: updateExpression,
      ConditionExpression,
      ExpressionAttributeNames: Object.keys(mergedNames).length ? mergedNames : undefined,
      ExpressionAttributeValues: Object.keys(mergedValues).length ? mergedValues : undefined,
      ReturnValues,
      ReturnConsumedCapacity,
      ReturnItemCollectionMetrics,
    };
  }

  if (!item || Object.keys(item).length === 0) {
    throw new Error('Either updateExpression or item with at least one field must be provided.');
  }

  // Dynamically generate UpdateExpression
  const updateExpParts: string[] = [];
  const dynamicValues: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(item)) {
    let attributeKey = `:${field}`;

    // Check for conflicts with existing attribute values and generate unique key if needed
    let counter = 0;
    while (mergedValues[attributeKey] !== undefined) {
      counter++;
      attributeKey = `:${field}_update_${counter}`;
    }

    updateExpParts.push(`${field} = ${attributeKey}`);
    dynamicValues[attributeKey] = value;
  }

  const UpdateExpression = replaceReservedKeywordsFromUpdateExp(`SET ${updateExpParts.join(', ')}`);

  return {
    TableName,
    Key,
    UpdateExpression,
    ConditionExpression,
    ...(Object.keys({
      ...extractExpAttributeNamesFromUpdate(UpdateExpression),
      ...mergedNames,
    }).length > 0 && {
      ExpressionAttributeNames: {
        ...extractExpAttributeNamesFromUpdate(UpdateExpression),
        ...mergedNames,
      },
    }),
    ...(Object.keys({
      ...mergedValues,
      ...dynamicValues,
    }).length > 0 && {
      ExpressionAttributeValues: {
        ...mergedValues,
        ...dynamicValues,
      },
    }),
    ReturnValues,
    ReturnConsumedCapacity,
    ReturnItemCollectionMetrics,
  };
}
