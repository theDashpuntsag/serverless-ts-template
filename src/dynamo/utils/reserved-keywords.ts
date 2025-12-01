/**
 * Replaces DynamoDB reserved keywords in an update expression with attribute aliases.
 * Example:
 *  SET size = :size, name = :name
 *  → SET #size = :size, #name = :name   (if reserved)
 */

import { RESERVED_KEYWORDS_SET } from './reserved-keywords-data';

// Build a single regex dynamically from RESERVED_KEYWORDS_SET
const UPDATE_RESERVED_REGEX = new RegExp(`\\b(?:${[...RESERVED_KEYWORDS_SET].join('|')})\\b(?=\\s*=)`, 'gi');

export function replaceReservedKeywordsFromUpdateExp(updateExpression: string): string {
  // Single pass, no loops
  return updateExpression.replace(UPDATE_RESERVED_REGEX, (match) => `#${match}`);
}

/**
 * Replaces DynamoDB reserved keywords in a projection expression with attribute aliases.
 * Example:
 *  size, color, status
 *  → #size, color, #status
 */

export function replaceReservedKeywordsFromProjection(projection: string): string {
  return projection
    .split(',')
    .map((item) => {
      const trimmed = item.trim();
      if (!trimmed) return trimmed;

      return RESERVED_KEYWORDS_SET.has(trimmed.toLowerCase()) ? `#${trimmed}` : trimmed;
    })
    .join(', ');
}
