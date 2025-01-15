import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { extractExpAttributeNamesFromUpdate, replaceReservedKeywordsFromUpdateExp } from '../utils';
import { CustomUpdateItemInput } from '../dynamo.types';

export function buildUpdateCommandInput<T>(input: CustomUpdateItemInput<T>): UpdateCommandInput {
  const {
    tableName: TableName,
    item,
    key: Key,
    updateExpression,
    conditionExpression: ConditionExpression,
    expressionAttributeNames,
    expressionAttributeValues,
    extraExpAttributeNames,
    extraExpressionAttributeValues = {},
    returnValues: ReturnValues = 'NONE',
    returnConsumedCapacity: ReturnConsumedCapacity,
    returnItemCollectionMetrics: ReturnItemCollectionMetrics,
  } = input;

  const mergedNames: Record<string, string> = { ...expressionAttributeNames, ...extraExpAttributeNames };
  const mergedValues = { ...expressionAttributeValues, ...extraExpressionAttributeValues };

  if (updateExpression) {
    return {
      TableName,
      Key,
      UpdateExpression: updateExpression,
      ConditionExpression,
      ExpressionAttributeNames: Object.keys(mergedNames).length ? mergedNames : undefined,
      ExpressionAttributeValues: Object.keys(mergedValues).length ? mergedValues : undefined,
      ReturnValues,
      ReturnConsumedCapacity,
      ReturnItemCollectionMetrics,
    };
  }

  // Dynamically generate UpdateExpression
  const updateExpParts: string[] = [];
  const dynamicValues: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(item)) {
    const attributeKey = `:${field}`;
    updateExpParts.push(`${field} = ${attributeKey}`);
    dynamicValues[attributeKey] = value;
  }

  const UpdateExpression = replaceReservedKeywordsFromUpdateExp(`SET ${updateExpParts.join(', ')}`);

  return {
    TableName,
    Key,
    UpdateExpression,
    ConditionExpression,
    ...(Object.keys({
      ...extractExpAttributeNamesFromUpdate(UpdateExpression),
      ...mergedNames,
    }).length > 0 && {
      ExpressionAttributeNames: {
        ...extractExpAttributeNamesFromUpdate(UpdateExpression),
        ...mergedNames,
      },
    }),
    ...(Object.keys({
      ...mergedValues,
      ...dynamicValues,
    }).length > 0 && {
      ExpressionAttributeValues: {
        ...mergedValues,
        ...dynamicValues,
      },
    }),
    ReturnValues,
    ReturnConsumedCapacity,
    ReturnItemCollectionMetrics,
  };
}
