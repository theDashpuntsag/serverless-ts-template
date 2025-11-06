import type { ValidatedAPIGatewayProxyEvent } from '@/@types';
import { queryRequestSchema, type QueryRequest } from '../types';

import { logger } from '@/libs';
import { CustomError } from '@/libs/error';

type EventType = ValidatedAPIGatewayProxyEvent<object | null>;

/**
 * Extracts and validates query parameters from an API Gateway event and merges them with default query configuration.
 *
 * This function handles four distinct scenarios for processing query parameters:
 * 1. **No query parameters**: Returns the default query configuration
 * 2. **Only limit/sorting parameters**: Merges these with the default query
 * 3. **Index matches default with no pKey**: Uses default pKey with query string overrides
 * 4. **Custom query parameters**: Builds entirely from query string parameters
 *
 * The function normalizes all query string parameters (trims whitespace, handles empty strings,
 * clamps limit values, and validates sorting options) before validation against the QueryRequest schema.
 *
 * @param {EventType} event - The validated API Gateway proxy event containing query string parameters
 * @param {QueryRequest} query - The default/fallback query configuration to use as base
 *
 * @returns {QueryRequest} A validated QueryRequest object with merged parameters
 *
 * @throws {CustomError} Throws a 400 status error if:
 *   - Query parameters fail schema validation
 *   - Required parameters are missing for the given scenario
 *   - Parameter values are invalid (e.g., invalid sorting direction)
 *
 * @example
 * ```typescript
 * // Example 1: No query parameters - uses defaults
 * const event1 = { queryStringParameters: null };
 * const defaultQuery = {
 *   indexName: 'user-index',
 *   pKey: 'userId',
 *   pKeyType: 'S',
 *   pKeyProp: 'id',
 *   limit: '10'
 * };
 * const result1 = extractQueryParamsFromEvent(event1, defaultQuery);
 * // Returns: defaultQuery
 *
 * // Example 2: Only limit and sorting
 * const event2 = {
 *   queryStringParameters: {
 *     limit: '25',
 *     sorting: 'desc'
 *   }
 * };
 * const result2 = extractQueryParamsFromEvent(event2, defaultQuery);
 * // Returns: { ...defaultQuery, limit: '25', sorting: 'desc' }
 *
 * // Example 3: Custom query with different index
 * const event3 = {
 *   queryStringParameters: {
 *     index: 'email-index',
 *     pKey: 'user@example.com',
 *     pKeyType: 'S',
 *     pKeyProp: 'email',
 *     limit: '50'
 *   }
 * };
 * const result3 = extractQueryParamsFromEvent(event3, defaultQuery);
 * // Returns: new QueryRequest built from query parameters
 *
 * // Example 4: Range query with sort key conditions
 * const event4 = {
 *   queryStringParameters: {
 *     index: 'timestamp-index',
 *     pKey: 'user123',
 *     pKeyType: 'S',
 *     pKeyProp: 'userId',
 *     sKey: '2023-01-01',
 *     sKeyType: 'S',
 *     sKeyProp: 'timestamp',
 *     skValue2: '2023-12-31',
 *     skComparator: 'between',
 *     limit: '100',
 *     sorting: 'asc'
 *   }
 * };
 * const result4 = extractQueryParamsFromEvent(event4, defaultQuery);
 * // Returns: QueryRequest for date range query
 * ```
 *
 * @since 1.0.0
 *
 * @see {@link QueryRequest} For the structure of query request objects
 * @see {@link normalizeQS} For query string normalization logic
 * @see {@link parseOrThrow} For validation and error handling
 */
export function extractQueryParamsFromEvent(event: EventType, query: QueryRequest): QueryRequest {
  try {
    const raw = event.queryStringParameters ?? {};
    const queryParams = normalizeQS(raw);

    // Case 1: no query parameters
    if (Object.keys(queryParams).length === 0) {
      return parseOrThrow(query, 'Invalid default query!');
    }

    // Case 2: only limit and/or sorting
    const keys = Object.keys(queryParams);
    const isOnlyLimitOrSorting =
      (keys.length === 1 && (queryParams.limit || queryParams.sorting)) ||
      (keys.length === 2 && queryParams.limit && queryParams.sorting);

    if (isOnlyLimitOrSorting) {
      return parseOrThrow(
        {
          ...query,
          ...(queryParams.limit && { limit: queryParams.limit }),
          ...(queryParams.sorting && { sorting: queryParams.sorting }),
        },
        'Bad request!'
      );
    }

    // Case 3: index matches defaults & no pKey supplied
    const hasNonEmptyPKey = Boolean(queryParams.pKey && queryParams.pKey.length > 0);
    if (!hasNonEmptyPKey && queryParams.index === query.indexName) {
      return parseOrThrow(
        {
          indexName: query.indexName,
          pKey: query.pKey,
          pKeyType: query.pKeyType,
          pKeyProp: query.pKeyProp,
          limit: queryParams.limit ?? query.limit ?? `20`,
          sKey: queryParams.sKey ?? query.sKey,
          sKeyType: queryParams.sKeyType ?? query.sKeyType,
          sKeyProp: queryParams.sKeyProp ?? query.sKeyProp,
          skValue2: queryParams.skValue2 ?? query.skValue2,
          skValue2Type: queryParams.skValue2Type ?? query.skValue2Type,
          skComparator: queryParams.skComparator ?? query.skComparator,
          lastEvaluatedKey: queryParams.lastEvaluatedKey ?? query.lastEvaluatedKey,
          sorting: queryParams.sorting ?? query.sorting,
        },
        'Bad request!'
      );
    }

    // Case 4: other params → build from qs only
    const params = {
      indexName: queryParams.index ?? query.indexName, // add safe fallback
      pKey: queryParams.pKey,
      pKeyType: queryParams.pKeyType,
      pKeyProp: queryParams.pKeyProp,
      limit: queryParams.limit ?? `20`,
      ...(queryParams.sKey && { sKey: queryParams.sKey }),
      ...(queryParams.sKeyType && { sKeyType: queryParams.sKeyType }),
      ...(queryParams.sKeyProp && { sKeyProp: queryParams.sKeyProp }),
      ...(queryParams.skValue2 && { skValue2: queryParams.skValue2 }),
      ...(queryParams.skValue2Type && { skValue2Type: queryParams.skValue2Type }),
      ...(queryParams.skComparator && { skComparator: queryParams.skComparator }),
      ...(queryParams.lastEvaluatedKey && { lastEvaluatedKey: queryParams.lastEvaluatedKey }),
      ...(queryParams.sorting && { sorting: queryParams.sorting }),
    };

    return parseOrThrow(params, 'Bad request!');
  } catch (error: unknown) {
    logger.error('Error extracting query params from event:', error);
    throw error;
  }
}

/**
 * Normalizes query string parameters.
 *
 * ### Process flow:
 * 1. Trims whitespace from string values.
 * 2. Converts blank strings to `undefined`.
 * 3. Clamps `limit` to a sensible range (1-100).
 * 4. Normalizes `sorting` to either 'asc' or 'desc', or `undefined` if invalid.
 *
 * @param qs
 * @returns
 */
function normalizeQS(qs: Record<string, unknown>) {
  const norm = Object.fromEntries(
    Object.entries(qs).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
  ) as Record<string, string | undefined>;

  // Treat blank strings as undefined
  for (const k of Object.keys(norm)) {
    if (norm[k] === '') norm[k] = undefined;
  }

  // Optional: clamp limit to a sensible range if your schema doesn’t already
  if (norm.limit) {
    const n = Number(norm.limit);
    if (!Number.isNaN(n)) norm.limit = String(Math.max(1, Math.min(100, n)));
  }

  // Optional: normalize sorting
  if (norm.sorting) {
    const s = norm.sorting.toLowerCase();
    if (s !== 'asc' && s !== 'desc') norm.sorting = undefined;
    else norm.sorting = s;
  }

  return norm;
}

/**
 * Parses and validates a candidate object as a QueryRequest.
 * @param {unknown} candidate - the object to parse
 * @param {string} prefix  - prefix for error messages
 * @returns the validated QueryRequest
 */
function parseOrThrow(candidate: unknown, prefix: string): QueryRequest {
  const parsed = queryRequestSchema.safeParse(candidate);
  if (!parsed.success) failBadRequest(prefix, parsed.error.issues);
  return parsed.data!;
}

/**
 * Handles bad request errors by logging and throwing a CustomError.
 * @param prefix - prefix for the error message
 * @param issues - validation issues
 * @throws {CustomError} with status code 400
 */
function failBadRequest(prefix: string, issues: unknown[]): never {
  const errorDetails = (issues as { path: (string | number)[]; message: string }[])
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  logger.warn(`${prefix} ${errorDetails}`);
  throw new CustomError(`${prefix} ${errorDetails}`, 400);
}
