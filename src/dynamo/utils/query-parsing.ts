import type { ValidatedAPIGatewayProxyEvent } from '@/libs';
import type { QueryRequest } from '../dynamo.types';

import { QueryRequestSchema } from '../dynamo.types';
import { CustomError } from '@/error';

type EventType = ValidatedAPIGatewayProxyEvent<object | null>;

/**
 * Extracts and validates query parameters from an API Gateway event, merging them with default query values.
 *
 * @param event - The API Gateway event containing query string parameters
 * @param query - Default query parameters to fall back to or merge with
 * @returns Validated QueryRequest object containing the merged and parsed parameters
 * @throws CustomError - If the parsed parameters don't match the QueryRequestSchema
 *
 * The function:
 * 1. Extracts query parameters from the event (defaults to empty object if none exist)
 * 2. If no index is provided or matches the default query's index:
 *    - Uses default query with a default limit of 10
 *    - Validates against schema
 * 3. Otherwise:
 *    - Merges event query params with defaults
 *    - Includes optional parameters only if present
 *    - Validates the merged result
 *
 * Example usage:
 * ```typescript
 * const event = {
 *   queryStringParameters: {
 *     index: "users",
 *     pKey: "userId",
 *     limit: "5"
 *   }
 * };
 * const defaultQuery = {
 *   indexName: "users",
 *   pKey: "defaultId"
 * };
 *
 * try {
 *   const result = extractQueryParamsFromEvent(event, defaultQuery);
 *   // Returns: {
 *   //   indexName: "users",
 *   //   pKey: "userId",
 *   //   limit: "5"
 *   // }
 * } catch (error) {
 *   // Handles validation errors
 * }
 * ```
 */
export function extractQueryParamsFromEvent(event: EventType, query: QueryRequest): QueryRequest {
  // Get query parameters from event, default to empty object if undefined
  const queryParams = event.queryStringParameters || {};

  // Check if index is absent or matches the default query's index
  if (!queryParams.index || queryParams.index === query.indexName) {
    // Parse with default values merged with query
    const parseResult = QueryRequestSchema.safeParse({
      indexName: query.indexName,
      limit: '10', // Default limit if not specified
      ...query,
    });

    // Throw error if validation fails, including problematic field names
    if (!parseResult.success) {
      throw new CustomError(`Bad request!,${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
    }
    return parseResult.data;
  }

  // Merge query parameters with defaults, only including optional fields if present
  const mergedParams = {
    indexName: queryParams.index!, // Non-null assertion since we checked it exists
    pKey: queryParams.pKey || query.pKey,
    pKeyType: queryParams.pKeyType || query.pKeyType,
    pKeyProp: queryParams.pKeyProps || query.pKeyProp,
    limit: queryParams.limit || '10', // Default limit if not specified
    // Optional parameters included only if present in queryParams
    ...(queryParams.sKey && { sKey: queryParams.sKey }),
    ...(queryParams.sKeyType && { sKeyType: queryParams.sKeyType }),
    ...(queryParams.sKeyProp && { sKeyProp: queryParams.sKeyProp }),
    ...(queryParams.skValue2 && { skValue2: queryParams.skValue2 }),
    ...(queryParams.skValue2Type && { skValue2Type: queryParams.skValue2Type }),
    ...(queryParams.skComparator && { skComparator: queryParams.skComparator }),
    ...(queryParams.limit && { limit: queryParams.limit }),
    ...(queryParams.lastEvaluatedKey && { lastEvaluatedKey: queryParams.lastEvaluatedKey }),
  };

  // Validate the merged parameters against the schema
  const parseResult = QueryRequestSchema.safeParse(mergedParams);

  // Throw error if validation fails, including problematic field names
  if (!parseResult.success) {
    throw new CustomError(`Bad request!,${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
  }

  return parseResult.data;
}
