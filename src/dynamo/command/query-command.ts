import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { CustomQueryCommandInput } from '../types';
import {
  extractExpAttributeNamesFromString,
  generateKeyConditionExpression,
  parseDynamoKeyValue,
  replaceReservedKeywordsFromProjection,
} from '../utils';

/**
 * Build a DynamoDB {@link QueryCommandInput} from a structured input shape.
 *
 * Contract
 * - Input: {@link CustomQueryCommandInput} including `queryRequest` to drive key conditions.
 * - Output: A fully-formed `QueryCommandInput` safe to pass to the AWS SDK.
 * - Error: This function does not throw; let the caller handle AWS command errors.
 *
 * Notes
 * - `KeyConditionExpression` is generated from `queryRequest` via `generateKeyConditionExpression`.
 * - `ProjectionExpression` is normalized to avoid reserved keywords and names are extracted.
 * - Expression name/value maps are combined from base, projection, and extras.
 * - Pagination (`ExclusiveStartKey`) is parsed from `lastEvaluatedKey` JSON when present.
 * - `ScanIndexForward` defaults to ascending; can be controlled by `sorting` or `scanIdxForward`.
 *
 * @param input - Parameters for building the Query command.
 * @returns A configured `QueryCommandInput`.
 *
 * @example Basic query with pagination
 * ```ts
 * const cmd = buildQueryCommandInput({
 *   tableName: 'OrdersTable',
 *   queryRequest: {
 *     pKey: 'ORG#42', pKeyType: 'S', pKeyProp: 'pk',
 *     sKey: 'ORDER#', sKeyType: 'S', sKeyProp: 'sk',
 *     skComparator: 'begins_with', skValue2: 'ORDER#', skValue2Type: 'S',
 *     limit: '25',
 *     lastEvaluatedKey: '{"pk":"ORG#42","sk":"ORDER#0009"}',
 *   },
 *   projectionExpression: 'pk, sk, total',
 *   filterExpression: 'total > :min',
 *   extraExpAttributeValues: { ':min': 100 },
 * });
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
      sorting,
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

  // ScanIdxForward defaults to true if not provided
  const finalScanIdxForward = sorting !== undefined ? sorting === 'asc' : scanIdxForward !== false;

  // Build and return the QueryCommandInput
  return {
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeNames: Object.keys(ExpressionAttributeNames).length ? ExpressionAttributeNames : undefined,
    ExpressionAttributeValues: Object.keys(ExpressionAttributeValues).length ? ExpressionAttributeValues : undefined,
    ProjectionExpression,
    ScanIndexForward: finalScanIdxForward,
    FilterExpression: filterExpression,
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    Limit: limit ? Number(limit) : undefined,
  };
}
