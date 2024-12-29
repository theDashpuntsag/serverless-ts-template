import { GetCommandInput, PutCommandInput, QueryCommandInput, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import {
  CustomGetCommandInput,
  CustomPutCommandInput,
  CustomQueryCommandInput,
  CustomUpdateItemInput,
} from '@/repository/dynamo';
import {
  extractExpAttributeNamesFromProjection,
  extractExpAttributeNamesFromUpdate,
  generateKeyConditionExpression,
  parsePartitionKeyValue,
  replaceReservedKeywordsFromProjection,
  replaceReservedKeywordsFromUpdateExp,
} from './dynamo-utils';

export function buildQueryCommandInput(input: CustomQueryCommandInput): QueryCommandInput {
  const {
    tableName: TableName,
    queryRequest: queryRequests,
    extraExpAttributeNames,
    extraExpAttributeValues,
    projectionExp,
    scanIdxForward: ScanIndexForward,
    filterExp: FilterExpression,
  } = input;
  const {
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
    limit,
    lastEvaluatedKey,
  } = queryRequests;

  const KeyConditionExpression = generateKeyConditionExpression(sKey, skValue2, skComparator);
  const ProjectionExpression = projectionExp ? replaceReservedKeywordsFromProjection(projectionExp) : undefined;

  const ExpressionAttributeNames: Record<string, string> = {
    '#pk': pKeyProp,
    ...(sKeyProp && { '#sk': sKeyProp }),
    ...(ProjectionExpression && {
      ...extractExpAttributeNamesFromProjection(ProjectionExpression),
    }),
    ...(extraExpAttributeNames && { ...extraExpAttributeNames }),
  };

  const ExpressionAttributeValues: Record<string, any> = {
    ':pk': parsePartitionKeyValue(pKey, pKeyType),
    ...(sKey && { ':sk': parsePartitionKeyValue(sKey, sKeyType) }),
    ...(skValue2 && { ':skValue2': parsePartitionKeyValue(skValue2, skValue2Type) }),
    ...(extraExpAttributeValues && { ...extraExpAttributeValues }),
  };

  return {
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ProjectionExpression,
    ScanIndexForward,
    FilterExpression,
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    Limit: limit ? Number(limit) : 10,
  };
}

export function buildGetCommandInput(input: CustomGetCommandInput): GetCommandInput {
  const { tableName: TableName, key: Key } = input;
  return { TableName, Key };
}

export function buildPutCommandInput<T>(input: CustomPutCommandInput<T>): PutCommandInput {
  const {
    tableName: TableName,
    item,
    returnValues: ReturnValues = 'NONE',
    conditionalExp: ConditionExpression,
    extraExpressionAttributeValues,
  } = input;

  return {
    TableName,
    Item: item as Record<string, any>,
    ConditionExpression,
    ReturnValues,
    ExpressionAttributeNames: extraExpressionAttributeValues ? { ...extraExpressionAttributeValues } : undefined,
  };
}

export function buildUpdateCommandInput<T>(input: CustomUpdateItemInput<T>): UpdateCommandInput {
  const {
    tableName: TableName,
    item,
    key: Key,
    conditionalExp: ConditionExpression,
    extraExpressionAttributeValues,
    returnValues: ReturnValues = 'NONE',
  } = input;

  const updateExpParts: string[] = [];
  let expressionAttributeValues: Record<string, any> = {};

  Object.entries(item).forEach(([field, value]) => {
    const attributeKey = `:${field}`;
    updateExpParts.push(`${field} = ${attributeKey}`);
    expressionAttributeValues[attributeKey] = value;
  });

  const UpdateExpression = replaceReservedKeywordsFromUpdateExp(`SET ${updateExpParts.join(', ')}`);

  return {
    TableName,
    Key,
    UpdateExpression,
    ConditionExpression,
    ExpressionAttributeNames: extractExpAttributeNamesFromUpdate(UpdateExpression),
    ReturnValues,
    ExpressionAttributeValues: {
      ...expressionAttributeValues,
      ...extraExpressionAttributeValues,
    },
  };
}

// Other functions
