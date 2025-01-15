import type { PutCommandInput } from '@aws-sdk/lib-dynamodb';
import type { CustomPutCommandInput } from '../dynamo.types';
import { extractExpAttributeNamesFromString, replaceReservedKeywordsFromProjection } from '../utils';

/**
 * Constructs a valid `PutCommandInput` object for DynamoDB operations.
 *
 * @template T - The type of the item being inserted or updated.
 * @param {CustomPutCommandInput<T>} input - The input parameters required to build the `PutCommandInput`.
 * @returns {PutCommandInput} - The constructed `PutCommandInput` object for DynamoDB.
 *
 * ### Parameters
 * - `tableName` (`string`): The name of the DynamoDB table (required).
 * - `item` (`T`): The item to insert or update in the table (required).
 * - `conditionExpression` (`string`): A conditional expression to ensure certain criteria are met before performing the operation (optional).
 * - `expressionAttributeNames` (`Record<string, string>`): Custom attribute names to avoid reserved keywords (optional).
 * - `expressionAttributeValues` (`Record<string, any>`): Custom attribute values used in conditional expressions (optional).
 * - `returnValues` (`'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'`): Specifies what values should be returned by the operation (default: `'NONE'`).
 * - `returnConsumedCapacity` (`'INDEXES' | 'TOTAL' | 'NONE'`): Determines the amount of throughput information to return (optional).
 * - `returnItemCollectionMetrics` (`'SIZE' | 'NONE'`): Indicates whether item collection metrics should be returned (optional).
 *
 * ### Steps
 * 1. Extracts relevant fields from the input object.
 * 2. Builds the initial `commandInput` object with the table name, item, and optional parameters.
 * 3. Dynamically generates `ExpressionAttributeNames` by:
 *    - Extracting all keys from the item.
 *    - Replacing reserved keywords using `replaceReservedKeywordsFromProjection`.
 *    - Generating placeholders using `extractExpAttributeNamesFromString`.
 * 4. Merges custom and generated `ExpressionAttributeNames`.
 * 5. Includes `ExpressionAttributeValues` if provided.
 * 6. Returns the final `PutCommandInput` object.
 *
 * ### Example Usage
 * ```typescript
 * const input = {
 *   tableName: "Products",
 *   item: {
 *     id: "123",
 *     name: "Test Product",
 *     size: "large", // Reserved keyword
 *   },
 *   conditionExpression: "attribute_not_exists(#id)",
 *   expressionAttributeNames: {
 *     "#id": "id",
 *   },
 *   expressionAttributeValues: {
 *     ":size": "large",
 *   },
 *   returnValues: "ALL_NEW",
 * };
 *
 * const commandInput = buildPutCommandInput(input);
 * console.log(commandInput);
 * ```
 *
 * ### Output
 * ```json
 * {
 *   "TableName": "Products",
 *   "Item": {
 *     "id": "123",
 *     "name": "Test Product",
 *     "size": "large"
 *   },
 *   "ConditionExpression": "attribute_not_exists(#id)",
 *   "ReturnValues": "ALL_NEW",
 *   "ExpressionAttributeNames": {
 *     "#id": "id",
 *     "#name": "name",
 *     "#size": "size"
 *   },
 *   "ExpressionAttributeValues": {
 *     ":size": "large"
 *   }
 * }
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
