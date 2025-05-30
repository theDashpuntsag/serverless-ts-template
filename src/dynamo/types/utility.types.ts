import { AttributeDefinition, GlobalSecondaryIndexDescription, KeySchemaElement } from '@aws-sdk/client-dynamodb';

export type TableDescResponse = {
  AttributeDefinitions?: AttributeDefinition[];
  GlobalSecondaryIndexes?: GlobalSecondaryIndexDescription[];
  KeySchema?: KeySchemaElement[];
};
