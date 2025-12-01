import type { UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import type { CustomUpdateCommandInput } from '../types';
import { extractExpAttributeNamesFromUpdateExp, replaceReservedKeywordsFromUpdateExp } from '../utils';

/**
 * Builds a DynamoDB {@link UpdateCommandInput} from a higher-level input shape.
 *
 * ### Process flow:
 * 1. Extracts relevant fields from the input object.
 * 2. Merges `ExpressionAttributeNames` and `ExpressionAttributeValues` from:
 *    - Provided attributes in the input.
 *    - Additional attributes specified in `extraExpAttributeNames` and `extraExpAttributeValues`.
 * 3. If `updateExpression` is provided, it uses it directly after merging attributes.
 * 4. If `updateExpression` is not provided, it generates one from the `item` field.
 * 5. Replaces reserved keywords in the update expression with attribute aliases.
 * 6. Extracts attribute names from the final update expression and merges them.
 * 7. Constructs and returns the final `UpdateCommandInput`.
 *
 * ### Notes:
 * - If `updateExpression` is provided, it is used directly.
 * - If not, an update expression is generated from the `item` field.
 * - Reserved keywords in the update expression are replaced with attribute aliases.
 * - `ExpressionAttributeNames` and `ExpressionAttributeValues` are merged from multiple sources.
 *
 * ### Contract:
 * - Input: {@link CustomUpdateCommandInput} containing table name, key, and optional parameters.
 * - Output: A fully-formed `UpdateCommandInput` safe to pass to the AWS SDK.
 *
 * @param input - The higher-level input for building the UpdateCommand.
 * @returns The constructed {@link UpdateCommandInput}.
 */
export function buildUpdateCommandInput(input: CustomUpdateCommandInput): UpdateCommandInput {
  const commandInput: UpdateCommandInput = {
    TableName: input.tableName,
    Key: input.key,
    ConditionExpression: input.conditionExpression,
    ReturnValues: input.returnValues ?? 'NONE',
    ReturnConsumedCapacity: input.returnConsumedCapacity,
    ReturnItemCollectionMetrics: input.returnItemCollectionMetrics,
  };

  // These will hold the final merged names/values.
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  // Merge provided ExpressionAttributeNames
  if (input.expressionAttributeNames) {
    for (const key in input.expressionAttributeNames) {
      names[key] = input.expressionAttributeNames[key];
    }
  }
  if (input.extraExpAttributeNames) {
    for (const key in input.extraExpAttributeNames) {
      names[key] = input.extraExpAttributeNames[key];
    }
  }

  // Merge provided ExpressionAttributeValues
  if (input.expressionAttributeValues) {
    for (const key in input.expressionAttributeValues) {
      values[key] = input.expressionAttributeValues[key];
    }
  }
  if (input.extraExpAttributeValues) {
    for (const key in input.extraExpAttributeValues) {
      values[key] = input.extraExpAttributeValues[key];
    }
  }

  let updateExpression = input.updateExpression;

  // ── Mode 1: explicit updateExpression ──────────────────────────────────────
  if (updateExpression) {
    if (Object.keys(names).length > 0) {
      commandInput.ExpressionAttributeNames = names;
    }
    if (Object.keys(values).length > 0) {
      commandInput.ExpressionAttributeValues = values;
    }
    commandInput.UpdateExpression = updateExpression;
    return commandInput;
  }

  // ── Mode 2: generated from `item` ─────────────────────────────────────────
  const item = input.item;

  if (!item || Object.keys(item).length === 0) {
    throw new Error('Either updateExpression or item with at least one field must be provided.');
  }

  const updateParts: string[] = [];
  const itemRecord = item as Record<string, unknown>;

  for (const field in itemRecord) {
    const value = itemRecord[field];

    let valueKey = `:${field}`;
    if (values[valueKey] !== undefined) {
      // Avoid collisions with existing placeholders from caller
      let counter = 1;
      let candidate: string;
      do {
        candidate = `:${field}_update_${counter++}`;
      } while (values[candidate] !== undefined);
      valueKey = candidate;
    }

    updateParts.push(`${field} = ${valueKey}`);
    values[valueKey] = value;
  }

  const rawExpression = `SET ${updateParts.join(', ')}`;
  updateExpression = replaceReservedKeywordsFromUpdateExp(rawExpression);

  // Auto-extract names from the final UpdateExpression.
  // Caller-provided names (in `names`) must win on conflicts
  const autoNames = extractExpAttributeNamesFromUpdateExp(updateExpression);
  for (const key in autoNames) {
    if (!(key in names)) {
      names[key] = autoNames[key];
    }
  }

  if (Object.keys(names).length > 0) {
    commandInput.ExpressionAttributeNames = names;
  }
  if (Object.keys(values).length > 0) {
    commandInput.ExpressionAttributeValues = values;
  }

  commandInput.UpdateExpression = updateExpression;

  return commandInput;
}
