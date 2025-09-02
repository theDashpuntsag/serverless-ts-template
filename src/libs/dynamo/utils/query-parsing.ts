import type { QueryRequest } from '../types';
import type { ValidatedAPIGatewayProxyEvent } from '@/types';

import { QueryRequestSchema } from '../types';
import { logger } from '@/libs';
import { CustomError } from '@/libs/error';

type EventType = ValidatedAPIGatewayProxyEvent<object | null>;

/**
 * Extracts and validates query parameters from an API Gateway event, applying defaults conditionally.
 *
 * @param event - The API Gateway event containing query string parameters
 * @param query - Default query parameters to use when no parameters are provided or when only a matching index is given
 * @returns Validated QueryRequest object containing the merged and parsed parameters
 * @throws CustomError - If the parsed parameters fail validation against QueryRequestSchema
 *
 * The function handles three cases:
 * 1. No query parameters: Returns the default `query` after validation.
 * 2. Only an index matching `query.indexName`: Merges with `query` defaults and validates.
 * 3. Any other parameters: Uses only `queryParams` with a default limit of '10', including optional fields if present.
 *
 * Example usage:
 * ```typescript
 * const event = { queryStringParameters: { index: "users" } };
 * const defaultQuery = { indexName: "users", pKey: "defaultId", limit: "20" };
 * const result = extractQueryParamsFromEvent(event, defaultQuery);
 * // Returns: { indexName: "users", pKey: "defaultId", limit: "20" }
 * ```
 */
export function extractQueryParamsFromEvent(event: EventType, query: QueryRequest): QueryRequest {
  // Extract query parameters from the event, defaulting to an empty object if undefined
  const queryParams = event.queryStringParameters || {};

  // Case 1: No query parameters provided
  // Return the default `query` after ensuring it conforms to the schema
  if (Object.keys(queryParams).length === 0) {
    const parseResult = QueryRequestSchema.safeParse(query);
    if (!parseResult.success) {
      const errorDetails = parseResult.error.issues.map((err) => `${err.path}: ${err.message}`).join(', ');
      logger.warn(`Invalid default query! ${errorDetails}`);
      throw new CustomError(`Invalid default query! ${errorDetails}`, 400);
    }
    return parseResult.data;
  }

  // Case 2: Only an index is provided and it matches query.indexName
  // Merge with defaults from `query` to provide a full set of parameters
  const isPkeyExists = queryParams.pKey && queryParams.pKey?.length > 0;
  if (!isPkeyExists && queryParams.index === query.indexName) {
    const params = {
      indexName: query.indexName,
      pKey: queryParams.pKey || query.pKey, // Use queryParams.pKey if provided, else query.pKey
      pKeyType: queryParams.pKeyType || query.pKeyType,
      pKeyProp: queryParams.pKeyProp || query.pKeyProp,
      limit: queryParams.limit || query.limit || '10', // Fallback chain: queryParams -> query -> '10'
      sKey: queryParams.sKey || query.sKey,
      sKeyType: queryParams.sKeyType || query.sKeyType,
      sKeyProp: queryParams.sKeyProp || query.sKeyProp,
      skValue2: queryParams.skValue2 || query.skValue2,
      skValue2Type: queryParams.skValue2Type || query.skValue2Type,
      skComparator: queryParams.skComparator || query.skComparator,
      lastEvaluatedKey: queryParams.lastEvaluatedKey || query.lastEvaluatedKey,
      sorting: queryParams.sorting || query.sorting,
    };

    // Validate the merged parameters against the schema
    const parseResult = QueryRequestSchema.safeParse(params);
    if (!parseResult.success) {
      const errorDetails = parseResult.error.issues.map((err) => `${err.path}: ${err.message}`).join(', ');
      logger.warn(`Bad request! ${errorDetails}`);
      throw new CustomError(`Bad request! ${errorDetails}`, 400);
    }
    return parseResult.data;
  }

  // Case 3: Any other query parameters provided
  // Build the result from queryParams only, with a default limit and optional fields as specified
  const params = {
    indexName: queryParams.index, // Fallback to query.indexName if index is missing
    pKey: queryParams.pKey, // No default fallback; schema will enforce requirement
    pKeyType: queryParams.pKeyType,
    pKeyProp: queryParams.pKeyProp,
    limit: queryParams.limit || '10', // Default to '10' if not provided
    ...(queryParams.sKey && { sKey: queryParams.sKey }), // Include optional fields only if present
    ...(queryParams.sKeyType && { sKeyType: queryParams.sKeyType }),
    ...(queryParams.sKeyProp && { sKeyProp: queryParams.sKeyProp }),
    ...(queryParams.skValue2 && { skValue2: queryParams.skValue2 }),
    ...(queryParams.skValue2Type && { skValue2Type: queryParams.skValue2Type }),
    ...(queryParams.skComparator && { skComparator: queryParams.skComparator }),
    ...(queryParams.lastEvaluatedKey && { lastEvaluatedKey: queryParams.lastEvaluatedKey }),
    ...(queryParams.sorting && { sorting: queryParams.sorting }),
  };

  // Validate the constructed parameters against the schema
  const parseResult = QueryRequestSchema.safeParse(params);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((err) => `${err.path}: ${err.message}`).join(', ');
    logger.warn(`Bad request! ${errorDetails}`);
    throw new CustomError(`Bad request! ${errorDetails}`, 400);
  }
  return parseResult.data;
}
