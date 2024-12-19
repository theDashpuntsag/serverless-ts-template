import type { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import type { QueryRequest } from '@type/dynamo.types';

/**
 * Parses a partition key value based on its DynamoDB type.
 *
 * @param partitionKey - The value of the partition key as a string.
 * @param partitionKeyType - The type of the partition key ('S', 'N', 'BOOL', etc.).
 * @returns The parsed value of the partition key.
 * @throws Error if an unsupported partitionKeyType is provided.
 *
 * @example
 * parsePartitionKeyValue("123", "N"); // Output: 123 (number)
 * parsePartitionKeyValue("true", "BOOL"); // Output: true (boolean)
 */
export function parsePartitionKeyValue(partitionKey: string, partitionKeyType: string): any {
  switch (partitionKeyType) {
    case 'S': // String
      return partitionKey;
    case 'N': // Number
      return Number(partitionKey);
    case 'BOOL': // Boolean
      return partitionKey.toLowerCase() === 'true';
    case 'NULL': // Null
      return null;
    case 'M': // Map (JSON string)
      try {
        return JSON.parse(partitionKey);
      } catch {
        throw new Error('Invalid JSON format for partitionKeyType M (Map)');
      }
    case 'L': // List (JSON array)
      try {
        return JSON.parse(partitionKey);
      } catch {
        throw new Error('Invalid JSON format for partitionKeyType L (List)');
      }
    case 'SS': // String Set
      return partitionKey.split(',').map((item) => item.trim());
    case 'NS': // Number Set
      return partitionKey
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((num) => !isNaN(num));
    case 'BS': // Binary Set
      return partitionKey.split(',').map((item) => Buffer.from(item.trim(), 'base64'));
    default:
      throw new Error(`Unsupported partitionKeyType: ${partitionKeyType}`);
  }
}

/**
 * Generates a DynamoDB KeyConditionExpression based on the provided inputs.
 *
 * @param sortKey - The sort key value used in the condition (if applicable).
 * @param skValue2 - The secondary sort key value for range-based operations (optional).
 * @param skComparator - The comparison operator. Defaults to '='.
 *                       Supported operators: '=', '<', '>', '<=', '>=', 'BETWEEN', 'BEGINS_WITH'.
 * @returns A valid KeyConditionExpression string.
 * @throws Error if invalid operation or missing parameters for BETWEEN or BEGINS_WITH.
 *
 * @example
 * generateKeyConditionExpression("age", "30", ">"); // Output: "#pk = :pk AND #sk > :sk"
 * generateKeyConditionExpression("name", undefined, "BEGINS_WITH"); // Throws Error
 */
export function generateKeyConditionExpression(sortKey?: string, skValue2?: string, skComparator = '='): string {
  let keyConditionExpression = '#pk = :pk'; // Always include the primary key condition

  if (sortKey) {
    switch (getOperatorSymbolByKey(skComparator)) {
      case '=':
        keyConditionExpression += ' AND #sk = :sk';
        break;
      case '<':
        keyConditionExpression += ' AND #sk < :sk';
        break;
      case '>':
        keyConditionExpression += ' AND #sk > :sk';
        break;
      case '<=':
        keyConditionExpression += ' AND #sk <= :sk';
        break;
      case '>=':
        keyConditionExpression += ' AND #sk >= :sk';
        break;
      case 'BEGINS_WITH':
        if (!sortKey) throw new Error('BEGINS_WITH operation requires sortKey.');
        keyConditionExpression += ` AND begins_with(#sk, :skValue2)`;
        break;
      case 'BETWEEN':
        if (!sortKey || !skValue2) throw new Error('BETWEEN operation requires both sk and skValue2.');
        keyConditionExpression += ' AND #sk BETWEEN :sk AND :skValue2';
        break;
      default:
        throw new Error(`Invalid operation: ${skComparator}`);
    }
  }
  return keyConditionExpression;
}

/**
 * Parses a DynamoDB ProjectionExpression string and generates an object mapping
 * reserved keywords to their actual attribute names for use in ExpressionAttributeNames.
 *
 * DynamoDB reserved keywords (e.g., "id", "type") must be prefixed with `#` in a ProjectionExpression.
 * This function extracts those prefixed keywords and maps them to their original attribute names.
 *
 * @param projectionExpression - The ProjectionExpression string containing attribute names,
 * some of which may be prefixed with `#` to denote reserved keywords.
 * Example: "#id, title, iconUrl, #type, minAmount, maxAmount"
 *
 * @returns A mapping object where the keys are the prefixed keywords (e.g., "#id")
 * and the values are the actual attribute names (e.g., "id").
 * Example: { "#id": "id", "#type": "type" }
 *
 * @example
 * const projectionExpression = "#id, title, #type, minAmount";
 * const expressionAttributeNames = getExpressionAttributeNByProjection(projectionExpression);
 * console.log(expressionAttributeNames);
 * // Output: { "#id": "id", "#type": "type" }
 */
export function getExpressionAttributeNByProjection(projectionExpression: string): Record<string, string> {
  const reservedKeywords = projectionExpression
    .split(',')
    .map((attr) => attr.trim()) // Trim spaces around attributes
    .filter((attr) => attr.startsWith('#')); // Select only attributes prefixed with '#'

  const expressionAttributeNames: Record<string, string> = {};

  reservedKeywords.forEach((keyword) => {
    // Remove the '#' prefix for the actual attribute name
    const actualName = keyword.replace('#', '');
    expressionAttributeNames[keyword] = actualName;
  });

  return expressionAttributeNames;
}

/**
 * Maps an operation key to a DynamoDB operator symbol or keyword.
 *
 * @param operation - The operation key to map. Can be a shorthand or descriptive key.
 * @returns The corresponding DynamoDB operator symbol or keyword.
 * @throws Error if the operation key is invalid.
 *
 * @example
 * getOperatorSymbolByKey("="); // Output: "="
 * getOperatorSymbolByKey("BETWEEN"); // Output: "BETWEEN"
 * getOperatorSymbolByKey("INVALID"); // Throws Error
 */
export function getOperatorSymbolByKey(operation: string): string {
  switch (operation.toUpperCase()) {
    case 'BETWEEN':
      return 'BETWEEN';
    case 'BEGINS_WITH':
      return 'BEGINS_WITH';
    case 'GREATER_THAN':
    case '>':
      return '>';
    case 'LESS_THAN':
    case '<':
      return '<';
    case 'GREATER_THAN_OR_EQUAL':
    case '>=':
      return '>=';
    case 'LESS_THAN_OR_EQUAL':
    case '<=':
      return '<=';
    case 'EQUAL':
    case '=':
      return '=';
    default:
      throw new Error(`Invalid operation key: ${operation}`);
  }
}

/**
 * Builds a DynamoDB QueryCommandInput object based on the given query request.
 *
 * @param queryRequest - An object containing all necessary query parameters.
 * @param tableName - The name of the DynamoDB table to query.
 * @returns A QueryCommandInput object ready to be used with DynamoDB.
 *
 * @example
 * const queryRequest = {
 *   pKey: "user123",
 *   pKeyType: "S",
 *   pKeyProp: "userId",
 *   sKey: "order456",
 *   sKeyType: "S",
 *   sKeyProp: "orderId",
 *   skComparator: "=",
 * };
 * const tableName = "OrdersTable";
 * const queryInput = buildDynamoQueryInput(queryRequest, tableName);
 * console.log(queryInput);
 */
export function buildDynamoQueryInput(queryRequest: QueryRequest, tableName: string): QueryCommandInput {
  const {
    indexName,
    pKey,
    pKeyType,
    pKeyProp,
    sKey,
    sKeyType,
    sKeyProp,
    skValue2,
    skValue2Type,
    skValue2Prop,
    skComparator,
    limit,
    lastEvaluatedKey,
    options,
  } = queryRequest;

  // Step 1: KeyConditionExpression
  const keyConditionExpression = generateKeyConditionExpression(sKey, skValue2, skComparator);

  // Step 2: ExpressionAttributeNames
  const expressionAttributeNames: Record<string, string> = { '#pk': pKeyProp };
  if (sKeyProp) expressionAttributeNames['#sk'] = sKeyProp;
  if (skValue2Prop) expressionAttributeNames['#sk1'] = skValue2Prop;

  // Step 3: ExpressionAttributeValues with type conversion
  const expressionAttributeValues: Record<string, any> = { ':pk': parsePartitionKeyValue(pKey, pKeyType) };
  if (sKey) expressionAttributeValues[':sk'] = parsePartitionKeyValue(sKey, sKeyType || 'S');
  if (skValue2) expressionAttributeValues[':skValue2'] = parsePartitionKeyValue(skValue2, skValue2Type || 'S');

  // Step 4: Sorting Order
  limit ? Number(limit) : 10;
  return {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    Limit: limit ? Number(limit) : 10,
    ...options,
  };
}
