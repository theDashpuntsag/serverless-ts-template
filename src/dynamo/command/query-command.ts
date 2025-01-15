import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { CustomQueryCommandInput } from '../dynamo.types';
import {
  extractExpAttributeNamesFromString,
  generateKeyConditionExpression,
  parseDynamoKeyValue,
  replaceReservedKeywordsFromProjection,
} from '../utils';

/**
 * Constructs a `QueryCommandInput` object for DynamoDB queries.
 *
 * This function dynamically generates the necessary fields for a DynamoDB query, including
 * key conditions, projection expressions, and expression attribute mappings, ensuring
 * compatibility with the DynamoDB SDK.
 *
 * @param {CustomQueryCommandInput} input - The input parameters for the query command.
 * @returns {QueryCommandInput} - The constructed DynamoDB `QueryCommandInput` object.
 *
 * ### Parameters
 * - **`tableName`** (`string`): The name of the DynamoDB table to query (required).
 * - **`queryRequest`** (`object`):
 *   - **`indexName`** (`string` | `undefined`): The name of the index to query (optional).
 *   - **`pKey`** (`string`): The partition key value (required).
 *   - **`pKeyType`** (`string`): The type of the partition key (`S` | `N` | `B`) (required).
 *   - **`pKeyProp`** (`string`): The attribute name of the partition key (required).
 *   - **`sKey`** (`string` | `undefined`): The sort key value (optional).
 *   - **`sKeyType`** (`string` | `undefined`): The type of the sort key (`S` | `N` | `B`) (default: `S`).
 *   - **`sKeyProp`** (`string` | `undefined`): The attribute name of the sort key (optional).
 *   - **`skValue2`** (`string` | `undefined`): A secondary value for the sort key condition (optional).
 *   - **`skValue2Type`** (`string` | `undefined`): The type of `skValue2` (`S` | `N` | `B`) (default: `S`).
 *   - **`skComparator`** (`string` | `undefined`): The comparator for the sort key condition (e.g., `=`, `>=`) (optional).
 *   - **`limit`** (`string` | `undefined`): The maximum number of items to retrieve (optional).
 *   - **`lastEvaluatedKey`** (`string` | `undefined`): The key to continue from for pagination (optional).
 * - **`extraExpAttributeNames`** (`Record<string, string>` | `undefined`): Additional attribute name substitutions (optional).
 * - **`extraExpAttributeValues`** (`Record<string, any>` | `undefined`): Additional attribute value substitutions (optional).
 * - **`projectionExpression`** (`string` | `undefined`): Specifies attributes to retrieve (optional).
 * - **`scanIdxForward`** (`boolean` | `undefined`): Specifies whether to sort results in ascending order (default: `true`).
 * - **`filterExpression`** (`string` | `undefined`): A condition to filter the items returned (optional).
 *
 * ### Steps
 * 1. **Key Condition Generation**:
 *    - Calls `generateKeyConditionExpression` to construct a condition based on the sort key and its comparator.
 *
 * 2. **Projection Expression**:
 *    - Uses `replaceReservedKeywordsFromProjection` to replace reserved keywords in the `projectionExpression`.
 *
 * 3. **Expression Attribute Names**:
 *    - Combines:
 *      - Partition key attribute name (`#pk`).
 *      - Sort key attribute name (`#sk`) (if provided).
 *      - Extracted names from the `ProjectionExpression`.
 *      - Additional attribute names (`extraExpAttributeNames`).
 *
 * 4. **Expression Attribute Values**:
 *    - Combines:
 *      - Partition key value (`:pk`).
 *      - Sort key value (`:sk`) (if provided).
 *      - Secondary sort key value (`:skValue2`) (if provided).
 *      - Additional attribute values (`extraExpAttributeValues`).
 *
 * 5. **Pagination**:
 *    - Parses `lastEvaluatedKey` into `ExclusiveStartKey` if provided.
 *
 * 6. **Limit**:
 *    - Converts `limit` to a `number`, if provided.
 *
 * ### Example Usage
 * ```typescript
 * const input: CustomQueryCommandInput = {
 *   tableName: "OrdersTable",
 *   queryRequest: {
 *     pKey: "userId",
 *     pKeyType: "S",
 *     pKeyProp: "userId",
 *     sKey: "orderDate",
 *     sKeyType: "S",
 *     sKeyProp: "orderDate",
 *     skComparator: ">",
 *     skValue2: "2023-01-01",
 *     skValue2Type: "S",
 *     limit: "20",
 *     lastEvaluatedKey: '{"userId": "123", "orderDate": "2023-01-01"}',
 *   },
 *   projectionExpression: "id, total, status",
 *   scanIdxForward: true,
 *   filterExpression: "total > :minTotal",
 *   extraExpAttributeNames: {
 *     "#total": "total",
 *   },
 *   extraExpAttributeValues: {
 *     ":minTotal": 100,
 *   },
 * };
 *
 * const commandInput = buildQueryCommandInput(input);
 * console.log(commandInput);
 * ```
 *
 * ### Output
 * ```json
 * {
 *   "TableName": "OrdersTable",
 *   "KeyConditionExpression": "orderDate > :skValue2",
 *   "ExpressionAttributeNames": {
 *     "#pk": "userId",
 *     "#sk": "orderDate",
 *     "#total": "total",
 *   },
 *   "ExpressionAttributeValues": {
 *     ":pk": "userId",
 *     ":sk": "orderDate",
 *     ":skValue2": "2023-01-01",
 *     ":minTotal": 100
 *   },
 *   "ProjectionExpression": "id, total, status",
 *   "ScanIndexForward": true,
 *   "FilterExpression": "total > :minTotal",
 *   "ExclusiveStartKey": {
 *     "userId": "123",
 *     "orderDate": "2023-01-01"
 *   },
 *   "Limit": 20
 * }
 * ```
 */
export function buildQueryCommandInput(input: CustomQueryCommandInput): QueryCommandInput {
  const {
    tableName: TableName,
    queryRequest: {
      indexName: IndexName,
      pKey,
      pKeyType,
      pKeyProp,
      sKey,
      sKeyType = 'S',
      sKeyProp,
      skValue2,
      skValue2Type = 'S',
      skComparator,
      limit,
      lastEvaluatedKey,
    },
    extraExpAttributeNames,
    extraExpAttributeValues,
    projectionExpression,
    scanIdxForward,
    filterExpression,
  } = input;

  // Generate KeyConditionExpression
  const KeyConditionExpression = generateKeyConditionExpression(sKey, skValue2, skComparator);

  // Generate ProjectionExpression and merge reserved keyword replacements
  const ProjectionExpression = projectionExpression
    ? replaceReservedKeywordsFromProjection(projectionExpression)
    : undefined;

  // Combine all ExpressionAttributeNames
  const ExpressionAttributeNames: Record<string, string> = {
    '#pk': pKeyProp,
    ...(sKeyProp && { '#sk': sKeyProp }),
    ...(ProjectionExpression && extractExpAttributeNamesFromString(ProjectionExpression)),
    ...(extraExpAttributeNames || {}),
  };

  // Combine all ExpressionAttributeValues
  const ExpressionAttributeValues: Record<string, unknown> = {
    ':pk': parseDynamoKeyValue(pKey, pKeyType),
    ...(sKey && { ':sk': parseDynamoKeyValue(sKey, sKeyType) }),
    ...(skValue2 && { ':skValue2': parseDynamoKeyValue(skValue2, skValue2Type) }),
    ...(extraExpAttributeValues || {}),
  };

  // Build and return the QueryCommandInput
  return {
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeNames: Object.keys(ExpressionAttributeNames).length ? ExpressionAttributeNames : undefined,
    ExpressionAttributeValues: Object.keys(ExpressionAttributeValues).length ? ExpressionAttributeValues : undefined,
    ProjectionExpression,
    ScanIndexForward: scanIdxForward,
    FilterExpression: filterExpression,
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    Limit: limit ? Number(limit) : undefined,
  };
}
