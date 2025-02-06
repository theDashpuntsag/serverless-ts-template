import type { ValidatedAPIGatewayProxyEvent } from '@/libs';
import type { QueryRequest } from '../dynamo.types';
import { QueryRequestSchema } from '../dynamo.types';
import { CustomError } from '@/error';

type EventType = ValidatedAPIGatewayProxyEvent<object | null>;

export function extractQueryParamsFromEvent(event: EventType, indexName: string, query: QueryRequest): QueryRequest {
  let parsedQueries = event.queryStringParameters || {};

  if (parsedQueries && parsedQueries.index === indexName) {
    parsedQueries = {
      indexName,
      pKey: parsedQueries.pKey || query.pKey,
      pKeyType: parsedQueries.pKeyType || query.pKeyType,
      pKeyProp: parsedQueries.pKeyProps || query.pKeyProp,
    };
  }

  const parseResult = QueryRequestSchema.safeParse({
    indexName: parsedQueries.index,
    ...parsedQueries,
    limit: parsedQueries.limit || '10',
  });

  if (!parseResult.success) {
    throw new CustomError(`Bad request!,${parseResult.error.errors.map((err) => err.path).join(', ')}`, 400);
  }

  return parseResult.data;
}
