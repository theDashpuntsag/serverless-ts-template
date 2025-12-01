import { DynamoQueryRequest } from '../../types';

/**
 * Create a DynamoDB condition expression based on the provided query request.
 *
 * ### Process flow:
 * 1. Start with a base condition for the partition key.
 * 2. Check if a sort key is provided in the query request.
 * 3. Depending on the comparator specified, append the appropriate condition for the sort key.
 * 4. Handle special cases for 'BEGINS_WITH' and 'BETWEEN' comparators.
 * 5. Return the constructed condition expression string.
 *
 * ### Notes:
 * - If no sort key is provided, only the partition key condition is returned.
 * - The function supports various comparators including '=', '<', '>', '<=', '>=', 'BEGINS_WITH', and 'BETWEEN'.
 *
 * @param queryRequest
 * @returns
 */
export function createKeyConditionExpression(queryRequest: DynamoQueryRequest): string {
  const { sKey, skValue2, skComparator } = queryRequest;
  let keyConditionExpression = '#pk = :pk';

  // If there is no sort key, return the partition key condition only
  if (!sKey) return keyConditionExpression;

  switch (getOperatorSymbolByKey(skComparator ?? '=')) {
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
      if (!sKey) throw new Error('BEGINS_WITH operation requires sortKey.');
      keyConditionExpression += ` AND begins_with(#sk, :skValue2)`;
      break;
    case 'BETWEEN':
      if (!sKey || !skValue2) throw new Error('BETWEEN operation requires both sk and skValue2.');
      keyConditionExpression += ' AND #sk BETWEEN :sk AND :skValue2';
      break;
    default:
      keyConditionExpression += ' AND #sk = :sk';
      break;
  }

  return keyConditionExpression;
}

/**
 * Get the DynamoDB operator symbol based on the provided operation key.
 *
 * ### Supported operations:
 * - 'BETWEEN'
 * - 'BEGINS_WITH'
 * - 'GREATER_THAN' or '>'
 * - 'LESS_THAN' or '<'
 * - 'GREATER_THAN_OR_EQUAL' or '>='
 * - 'LESS_THAN_OR_EQUAL' or '<='
 * - 'EQUAL' or '='
 *
 *
 * @param operation
 * @returns
 */
function getOperatorSymbolByKey(operation: string): string {
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
