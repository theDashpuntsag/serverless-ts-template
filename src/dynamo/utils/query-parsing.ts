import type { ValidatedAPIGatewayProxyEvent } from '@/libs';
import type { QueryRequest } from '../dynamo.types';
import { QueryRequestSchema } from '../dynamo.types';
import { CustomError } from '@/error';

type EventType = ValidatedAPIGatewayProxyEvent<object | null>;

export function extractQueryParamsFromEvent(event: EventType, indexName: string, query: QueryRequest): QueryRequest {
  const queryParams = event.queryStringParameters || {};

  // Early return if no matching index
  if (!queryParams.index || queryParams.index !== indexName) {
    const parseResult = QueryRequestSchema.safeParse({
      indexName: query.indexName,
      limit: '10',
      ...query,
    });

    if (!parseResult.success) {
      throw new CustomError(`Bad request!,${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
    }
    return parseResult.data;
  }

  // Define optional parameters with proper typing
  const optionalParams = {
    ...(queryParams.sKey && { sKey: queryParams.sKey }),
    ...(queryParams.sKeyType && { sKeyType: queryParams.sKeyType }),
    ...(queryParams.sKeyProp && { sKeyProp: queryParams.sKeyProp }),
    ...(queryParams.skValue2 && { skValue2: queryParams.skValue2 }),
    ...(queryParams.skValue2Type && { skValue2Type: queryParams.skValue2Type }),
    ...(queryParams.skComparator && { skComparator: queryParams.skComparator }),
    ...(queryParams.limit && { limit: queryParams.limit }),
    ...(queryParams.lastEvaluatedKey && { lastEvaluatedKey: queryParams.lastEvaluatedKey }),
  };

  const mergedParams = {
    indexName: query.indexName,
    pKey: queryParams.pKey || query.pKey,
    pKeyType: queryParams.pKeyType || query.pKeyType,
    pKeyProp: queryParams.pKeyProps || query.pKeyProp,
    limit: queryParams.limit || '10',
    ...optionalParams,
  };

  const parseResult = QueryRequestSchema.safeParse(mergedParams);

  if (!parseResult.success) {
    throw new CustomError(`Bad request!,${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
  }

  return parseResult.data;
}
