import { AttributeDefinition, GlobalSecondaryIndexDescription, KeySchemaElement } from '@aws-sdk/client-dynamodb';

/**
 * Minimal table description subset used by local helpers/utilities.
 * Mirrors the shape of selected fields on `DescribeTableCommandOutput.Table`.
 */
export type TableDescResponse = {
  /** Attribute definitions present on the table. */
  AttributeDefinitions?: AttributeDefinition[];
  /** Descriptions of global secondary indexes, if present. */
  GlobalSecondaryIndexes?: GlobalSecondaryIndexDescription[];
  /** The key schema for the table. */
  KeySchema?: KeySchemaElement[];
};
