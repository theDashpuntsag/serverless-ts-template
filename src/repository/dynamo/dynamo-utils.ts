import { RESERVED_KEYWORDS } from './dynamo-reserved-keywords';

export function parsePartitionKeyValue(partitionKey: string, partitionKeyType: string): any {
  switch (partitionKeyType) {
    case 'S': // String
      return partitionKey;
    case 'N': // Number
      return Number(partitionKey);
    case 'BOOL': // Boolean
      return partitionKey.toLowerCase() === 'true';
    case 'NULL': // Null
      return null;
    case 'M': // Map (JSON string)
      try {
        return JSON.parse(partitionKey);
      } catch {
        throw new Error('Invalid JSON format for partitionKeyType M (Map)');
      }
    case 'L': // List (JSON array)
      try {
        return JSON.parse(partitionKey);
      } catch {
        throw new Error('Invalid JSON format for partitionKeyType L (List)');
      }
    case 'SS': // String Set
      return partitionKey.split(',').map((item) => item.trim());
    case 'NS': // Number Set
      return partitionKey
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((num) => !isNaN(num));
    case 'BS': // Binary Set
      return partitionKey.split(',').map((item) => Buffer.from(item.trim(), 'base64'));
    default:
      throw new Error(`Unsupported partitionKeyType: ${partitionKeyType}`);
  }
}

export function generateKeyConditionExpression(sortKey?: string, skValue2?: string, skComparator = '='): string {
  let keyConditionExpression = '#pk = :pk'; // Always include the primary key condition

  if (sortKey) {
    switch (getOperatorSymbolByKey(skComparator)) {
      case '=':
        keyConditionExpression += ' AND #sk = :sk';
        break;
      case '<':
        keyConditionExpression += ' AND #sk < :sk';
        break;
      case '>':
        keyConditionExpression += ' AND #sk > :sk';
        break;
      case '<=':
        keyConditionExpression += ' AND #sk <= :sk';
        break;
      case '>=':
        keyConditionExpression += ' AND #sk >= :sk';
        break;
      case 'BEGINS_WITH':
        if (!sortKey) throw new Error('BEGINS_WITH operation requires sortKey.');
        keyConditionExpression += ` AND begins_with(#sk, :skValue2)`;
        break;
      case 'BETWEEN':
        if (!sortKey || !skValue2) throw new Error('BETWEEN operation requires both sk and skValue2.');
        keyConditionExpression += ' AND #sk BETWEEN :sk AND :skValue2';
        break;
      default:
        throw new Error(`Invalid operation: ${skComparator}`);
    }
  }
  return keyConditionExpression;
}

export function extractExpAttributeNamesFromProjection(projectionExpression: string): Record<string, string> {
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

export function getOperatorSymbolByKey(operation: string): string {
  switch (operation.toUpperCase()) {
    case 'BETWEEN':
      return 'BETWEEN';
    case 'BEGINS_WITH':
      return 'BEGINS_WITH';
    case 'GREATER_THAN':
    case '>':
      return '>';
    case 'LESS_THAN':
    case '<':
      return '<';
    case 'GREATER_THAN_OR_EQUAL':
    case '>=':
      return '>=';
    case 'LESS_THAN_OR_EQUAL':
    case '<=':
      return '<=';
    case 'EQUAL':
    case '=':
      return '=';
    default:
      throw new Error(`Invalid operation key: ${operation}`);
  }
}

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

export function replaceReservedKeywordsFromProjection(projection: string): string {
  const assignments = projection.split(', ');
  const updatedAssignments = assignments.map((assignments) => {
    if (RESERVED_KEYWORDS.includes(assignments.trim().toLowerCase())) return `#${assignments}`;
    return assignments;
  });
  return updatedAssignments.join(', ');
}
