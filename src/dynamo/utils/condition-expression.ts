/**
 * Generates the conditional expression and attribute values for a DynamoDB update.
 *
 * @param statuses - Array of valid statuses
 * @returns - An object containing the condition expression and attribute values
 */
export function generateConditionExpression(statuses: string[]): { condition: string; extra: Record<string, string> } {
  if (!statuses.length) throw new Error('statusArr cannot be empty');

  if (statuses.length === 1) {
    return {
      condition: `#status = :status0`,
      extra: { ':status0': statuses[0] }
    };
  }

  const conditions = statuses.map((_, index) => `:status${index}`).join(', ');
  const conditionExpression = `#status IN (${conditions})`;

  const expressionAttributeValues = statuses.reduce(
    (acc, status, index) => {
      acc[`:status${index}`] = status;
      return acc;
    },
    {} as Record<string, string>
  );

  return { condition: conditionExpression, extra: expressionAttributeValues };
}
