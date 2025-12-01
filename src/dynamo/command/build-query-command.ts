import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { CustomQueryCommandInput } from '../types';
import {
  createKeyConditionExpression,
  extractExpAttributeNamesFromExpression,
  replaceReservedKeywordsFromProjection,
  parseDynamoKeyValue,
} from '../utils';

/**
 * Build a DynamoDB {@link QueryCommandInput} from a structured input shape.
 *
 * ### Process flow
 * 1. Extracts relevant fields from the input object.
 * 2. Generates `KeyConditionExpression` using `generateKeyConditionExpression`. `generateKeyConditionExpression` constructs the key condition expression based on the provided sort key and its value.
 * 3. Normalizes `ProjectionExpression` to avoid reserved keywords and extracts attribute names.
 * 4. Combines all `ExpressionAttributeNames` from:
 *  - Base key attributes (`pKeyProp`, `sKeyProp`).
 *  - Extracted names from `ProjectionExpression`.
 *  - Any additional names provided in `extraExpAttributeNames`.
 *
 *
 * ### Contract
 * - Input: {@link CustomQueryCommandInput} including `queryRequest` to drive key conditions.
 * - Output: A fully-formed `QueryCommandInput` safe to pass to the AWS SDK.
 * - Error: This function does not throw; let the caller handle AWS command errors.
 *
 * ### Notes
 * - `KeyConditionExpression` is generated from `queryRequest` via `generateKeyConditionExpression`.
 * - `ProjectionExpression` is normalized to avoid reserved keywords and names are extracted.
 * - `ExpressionAttributeNames` are combined from base, projection, and extras.
 * - `Pagination` (`ExclusiveStartKey`) is parsed from `lastEvaluatedKey` JSON when present.
 * - `ScanIndexForward` defaults to ascending; can be controlled by `sorting` or `scanIdxForward`.
 *
 * @param {CustomQueryCommandInput} input - The input parameters for the query command.
 * @returns {QueryCommandInput} - The constructed DynamoDB `QueryCommandInput` object.
 */
export function buildQueryCommandInput(input: CustomQueryCommandInput): QueryCommandInput {
  const { queryRequest } = input;
  const KeyConditionExpression = createKeyConditionExpression(queryRequest);

  const ProjectionExpression: string | undefined = input.projectionExpression
    ? replaceReservedKeywordsFromProjection(input.projectionExpression)
    : undefined;

  const ExpressionAttributeNames: Record<string, string> = {
    '#pk': queryRequest.pKeyProp,
    ...(queryRequest.sKeyProp && { '#sk': queryRequest.sKeyProp }),
    ...(ProjectionExpression && extractExpAttributeNamesFromExpression(ProjectionExpression)),
    ...(input.extraExpAttributeNames || {}),
  };

  const ExpressionAttributeValues: Record<string, unknown> = {
    ':pk': parseDynamoKeyValue(queryRequest.pKey, queryRequest.pKeyType),
    ...(queryRequest.sKey && {
      ':sk': parseDynamoKeyValue(queryRequest.sKey, queryRequest.sKeyType ?? `S`),
      ...(queryRequest.skValue2 && {
        ':skValue2': parseDynamoKeyValue(queryRequest.skValue2, queryRequest.sKeyType ?? `S`),
      }),
    }),
    ...(input.extraExpAttributeValues || {}),
  };

  const commandInput: QueryCommandInput = {
    TableName: input.tableName,
    IndexName: queryRequest.indexName,
    KeyConditionExpression,
    FilterExpression: input.filterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ProjectionExpression,
    ScanIndexForward:
      queryRequest.sorting !== undefined ? queryRequest.sorting.toUpperCase() === 'ASC' : input.scanIndexForward,
    ReturnConsumedCapacity: input.returnConsumedCapacity,
    ExclusiveStartKey: queryRequest.lastEvaluatedKey,
    Limit: queryRequest.limit,
  };

  return commandInput;
}
