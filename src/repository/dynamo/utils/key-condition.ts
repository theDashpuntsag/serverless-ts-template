/**
 * Generates a DynamoDB key condition expression.
 * @param sortKey - The name of the sort key (optional).
 * @param skValue2 - A second value for range conditions (e.g., 'BETWEEN') (optional).
 * @param skComparator - The comparator for the sort key condition (default is '=').
 * @returns A key condition expression string.
 * @throws Error for invalid operations or missing required parameters.
 * @example
 * generateKeyConditionExpression('sortKey', undefined, '='); // Returns '#pk = :pk AND #sk = :sk'
 * generateKeyConditionExpression('sortKey', 'value2', 'BETWEEN'); // Returns '#pk = :pk AND #sk BETWEEN :sk AND :skValue2'
 */
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

/**
 * Maps a given operation key to its corresponding DynamoDB operator symbol.
 * @param operation - The operation key (e.g., 'BETWEEN', 'BEGINS_WITH', 'GREATER_THAN').
 * @returns The corresponding DynamoDB operator symbol.
 * @throws Error if the operation key is invalid.
 * @example
 * getOperatorSymbolByKey('GREATER_THAN'); // Returns '>'
 * getOperatorSymbolByKey('BETWEEN'); // Returns 'BETWEEN'
 * getOperatorSymbolByKey('EQUAL'); // Returns '='
 */
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
