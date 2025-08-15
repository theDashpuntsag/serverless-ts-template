import { RESERVED_KEYWORDS } from './dynamo-reserved-keywords';

/**
 * Replaces DynamoDB reserved keywords in an update expression with attribute aliases.
 * @param updateExpression - The update expression string (e.g., 'SET size = :size, name = :name').
 * @returns The updated expression with reserved keywords replaced.
 * @example
 * // Returns 'SET #size = :size, color = :color' if 'size' is a reserved keyword
 * replaceReservedKeywordsFromUpdateExp('SET size = :size, color = :color');
 */
export function replaceReservedKeywordsFromUpdateExp(updateExpression: string): string {
  const assignments = updateExpression.split(', ');

  const updatedAssignments = assignments.map((assignment) => {
    RESERVED_KEYWORDS.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b(?=\\s*=)`, 'g');
      assignment = assignment.replace(regex, `#${keyword}`);
    });
    return assignment;
  });

  return updatedAssignments.join(', ');
}

/**
 * Replaces DynamoDB reserved keywords in a projection expression with attribute aliases.
 * @param projection - The projection expression string (e.g., 'size, color').
 * @returns The updated projection expression with reserved keywords replaced.
 * @example
 * // Returns '#size, color' if 'size' is a reserved keyword
 * replaceReservedKeywordsFromProjection('size, color');
 */
export function replaceReservedKeywordsFromProjection(projection: string): string {
  const assignments = projection.split(', ');
  const updatedAssignments = assignments.map((assignment) => {
    if (RESERVED_KEYWORDS.includes(assignment.trim().toLowerCase())) return `#${assignment}`;
    return assignment;
  });
  return updatedAssignments.join(', ');
}
