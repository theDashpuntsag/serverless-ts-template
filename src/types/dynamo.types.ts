export type DynamoGetQueryResponse<T> = {
  items: T[];
  lastEvaluatedKey: string | undefined;
};
