/**
 * Extracts attribute names from a projection expression and maps them to their original names.
 * @param projectionExpression - The projection expression containing attribute aliases (e.g., '#name, #age').
 * @returns A record mapping attribute aliases to their original names.
 *
 * @example
 * extractExpAttributeNamesFromProjection('#name, #age'); // Returns { '#name': 'name', '#age': 'age' }
 */
export function extractExpAttributeNamesFromString(projectionExpression: string): Record<string, string> {
  const reservedKeywords = projectionExpression
    .split(',')
    .map((attr) => attr.trim()) // Trim spaces around attributes
    .filter((attr) => attr.startsWith('#')); // Select only attributes prefixed with '#'

  const expressionAttributeNames: Record<string, string> = {};

  reservedKeywords.forEach((keyword) => {
    // Remove the '#' prefix for the actual attribute name
    const actualName = keyword.replace('#', '');
    expressionAttributeNames[keyword] = actualName;
  });

  return expressionAttributeNames;
}

/**
 * Replaces DynamoDB reserved keywords in an update expression with attribute aliases.
 * @param updateExpression - The update expression string (e.g., 'SET size = :size').
 * @returns The updated expression with reserved keywords replaced.
 * @example
 * replaceReservedKeywordsFromUpdateExp('SET size = :size'); // Returns 'SET #size = :size' if 'size' is a reserved keyword
 */
export function extractExpAttributeNamesFromUpdate(expression: string): Record<string, string> {
  const expressionAttributeNames: Record<string, string> = {};

  const normalized = expression.trim().toUpperCase();
  if (normalized.startsWith('SET ')) {
    expression = expression.slice(3).trim();
  }

  const assignments = expression.split(/\s*,\s*/);

  for (const assignment of assignments) {
    const [leftSide] = assignment.split('=');

    const attributeName = leftSide.trim();
    if (attributeName.startsWith('#')) {
      const withoutHash = attributeName.slice(1);
      expressionAttributeNames[attributeName] = withoutHash;
    }
  }

  return expressionAttributeNames;
}
