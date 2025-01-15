import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { CustomGetCommandInput } from '../dynamo.types';
import { extractExpAttributeNamesFromString, replaceReservedKeywordsFromProjection } from '../utils';

/**
 * Constructs a `GetCommandInput` object for DynamoDB based on the provided custom input.
 * @param input - An object of type `CustomGetCommandInput` containing the required parameters for the command.
 * @returns A `GetCommandInput` object configured with the provided input data.
 * @example
 * // Example: User provides a projectionExpression but no expressionAttributeNames
 * const input: CustomGetCommandInput = {
 *   tableName: "UsersTable", // Name of the DynamoDB table
 *   key: { userId: "123" }, // Key of the item to retrieve
 *   projectionExpression: "#name, #age", // Attributes to retrieve, using aliases
 *   consistentRead: true, // Use strongly consistent reads
 *   returnConsumedCapacity: "TOTAL", // Return the consumed capacity
 * };
 *
 * const commandInput = buildGetCommandInput(input);
 * // Function extracts attribute names dynamically from the projectionExpression:
 * // Returns:
 * // {
 * //   TableName: "UsersTable",
 * //   Key: { userId: "123" },
 * //   ProjectionExpression: "#name, #age",
 * //   ConsistentRead: true,
 * //   ReturnConsumedCapacity: "TOTAL",
 * //   ExpressionAttributeNames: { "#name": "name", "#age": "age" }, // Extracted automatically
 * // }
 *
 * // Example: User provides no expressionAttributeNames and no projectionExpression
 * const inputWithoutProjection: CustomGetCommandInput = {
 *   tableName: "UsersTable",
 *   key: { userId: "123" },
 *   consistentRead: true,
 *   returnConsumedCapacity: "TOTAL",
 * };
 *
 * const commandInputWithoutProjection = buildGetCommandInput(inputWithoutProjection);
 * // Returns:
 * // {
 * //   TableName: "UsersTable",
 * //   Key: { userId: "123" },
 * //   ConsistentRead: true,
 * //   ReturnConsumedCapacity: "TOTAL",
 * //   // No ExpressionAttributeNames or ProjectionExpression included
 * // }
 */
export function buildGetCommandInput(input: CustomGetCommandInput): GetCommandInput {
  const {
    tableName: TableName, // The name of the DynamoDB table
    key: Key, // The key of the item to retrieve
    projectionExpression, // Optional: Specifies attributes to retrieve
    expressionAttributeNames: extraExpressionAttributesNames, // Additional expression attribute names
    consistentRead: ConsistentRead, // Optional: Specifies whether to use strongly consistent reads
    returnConsumedCapacity: ReturnConsumedCapacity, // Optional: Determines whether to return consumed capacity
  } = input;

  // Generate ProjectionExpression and merge reserved keyword replacements
  const ProjectionExpression = projectionExpression
    ? replaceReservedKeywordsFromProjection(projectionExpression)
    : undefined;

  // Build the initial GetCommandInput object
  const commandInput: GetCommandInput = {
    TableName,
    Key,
    ProjectionExpression,
    ConsistentRead,
    ReturnConsumedCapacity,
  };

  // Combine extracted attribute names from the projection expression with additional ones
  const expressionAttributeNames: Record<string, string> = {
    ...(ProjectionExpression && extractExpAttributeNamesFromString(ProjectionExpression)),
    ...extraExpressionAttributesNames,
  };

  // Add ExpressionAttributeNames to the command if any are present
  if (expressionAttributeNames && Object.keys(expressionAttributeNames).length > 0) {
    commandInput.ExpressionAttributeNames = expressionAttributeNames;
  }

  return commandInput;
}
