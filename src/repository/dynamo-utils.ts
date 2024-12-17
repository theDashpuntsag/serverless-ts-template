import type { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import type { QueryRequest } from '@type/dynamo.types';

/**
 * Parses a partition key value based on its DynamoDB type.
 *
 * @param partitionKey - The value of the partition key as a string.
 * @param partitionKeyType - The type of the partition key ('S', 'N', 'BOOL', etc.).
 * @returns The parsed value of the partition key.
 * @throws Error if an unsupported partitionKeyType is provided.
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
 * @param sortKey - The first value for the sort key condition (required for most operations).
 * @param skValue2 - The second value for range-based operations (optional, required for BETWEEN).
 * @param operation - The comparison operator to use in the expression. Defaults to '='.
 *                    Supported operations: '=', '<', '>', '<=', '>=', 'BETWEEN', 'BEGINS_WITH'.
 * @returns A valid DynamoDB KeyConditionExpression string.
 * @throws Will throw an error if invalid operation is provided or required parameters are missing.
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
 * Returns the DynamoDB operator symbol or keyword based on the operation key.
 *
 * @param operation - The operation key as a string.
 * @returns A valid DynamoDB operator symbol or keyword.
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
 * Builds a DynamoDB QueryCommandInput based on QueryRequest.
 *
 * @param queryRequest - The validated QueryRequest object.
 * @param tableName - The table name for the DynamoDB query.
 * @returns A valid DynamoDB QueryCommandInput.
 */
export function buildDynamoQueryInput(queryRequest: QueryRequest, tableName: string): QueryCommandInput {
  const {
    indexName,
    pKey,
    pKeyType,
    pKeyProp,
    sKey,
    sKeyType: skeyType,
    sKeyProp,
    skValue2,
    skValue2Type,
    skValue2Prop,
    skComparator,
    limit,
    lastEvaluatedKey,
    sorting,
  } = queryRequest;

  // Step 1: KeyConditionExpression
  const keyConditionExpression = generateKeyConditionExpression(sKey, skValue2, skComparator);

  // Step 2: ExpressionAttributeNames
  const expressionAttributeNames: Record<string, string> = {
    '#pk': pKeyProp, // Partition key mapping
  };
  if (sKeyProp) {
    expressionAttributeNames['#sk'] = sKeyProp;
  }
  if (skValue2Prop) {
    expressionAttributeNames['#sk1'] = skValue2Prop;
  }

  // Step 3: ExpressionAttributeValues with type conversion
  const expressionAttributeValues: Record<string, any> = {
    ':pk': parsePartitionKeyValue(pKey, pKeyType),
  };

  if (sKey) {
    expressionAttributeValues[':sk'] = parsePartitionKeyValue(sKey, skeyType || 'S');
  }

  if (skValue2) {
    expressionAttributeValues[':skValue2'] = parsePartitionKeyValue(skValue2, skValue2Type || 'S');
  }

  // Step 4: Sorting Order
  const scanIndexForward = sorting === 'ASC' ? true : false;

  // Step 5: Build QueryCommandInput
  return {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    Limit: limit ? parseInt(limit, 10) : 10,
    ScanIndexForward: sorting ? scanIndexForward : undefined,
  };
}
