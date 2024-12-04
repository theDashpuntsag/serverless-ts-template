export type CustomQueryCommandInput = {
  tableName: string;
  lastEvaluatedKey?: string;
  keyConditionExpression: string;
  expressionAttributeValues: Record<string, any>;
  options?: {
    indexName?: string;
    filterExpression?: string;
    projectionExpression?: string;
    limit?: number;
    scanIndexForward?: boolean;
  };
};

export type CustomPutCommandInput<T> = {
  tableName: string;
  item: T;
};

export type CustomUpdateItemInput<T> = {
  tableName: string;
  key: Record<string, any>;
  item: Partial<T>;
};

export type CustomGetCommandInput = {
  tableName: string;
  key: string;
  value: any;
};

export type CustomQueryCommandOutput<T> = {
  lastEvaluatedKey: string | undefined;
  items: T[];
};
