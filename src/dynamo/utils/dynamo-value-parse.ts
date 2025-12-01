/**
 * Parses a partition or sort key value based on its type.
 *
 * ### Process flow:
 * 1. Check the provided key type.
 * 2. Depending on the type, convert the string value to the appropriate JavaScript type:
 *   - 'S' → string
 *   - 'N' → number
 *   - 'BOOL' → boolean
 *   - 'NULL' → null
 *   - 'M' → object (parsed from JSON string)
 *   - 'L' → array (parsed from JSON string)
 *   - 'SS' → array of strings (split by commas)
 *   - 'NS' → array of numbers (split by commas)
 *   - 'BS' → array of binary data (split by commas, base64 encoded)
 * 3. Return the parsed value.
 *
 * ### Notes:
 * - For types 'M' and 'L', the function expects a valid JSON string representation.
 * - For set types ('SS', 'NS', 'BS'), the input string should have items separated by commas.
 * - If the key type is unrecognized, an error is thrown.
 *
 *
 * @param key - The value of the partition key as a string.
 * @param type - The type of the partition key (e.g., 'S', 'N', 'BOOL', etc.).
 * @returns The parsed partition key value in its appropriate type.
 * @throws Error if the partition key type is invalid or the format is incorrect for types 'M' or 'L'.
 * @example
 * parsePartitionKeyValue('123', 'N'); // Returns 123 as a number
 * parsePartitionKeyValue('true', 'BOOL'); // Returns true as a boolean
 * parsePartitionKeyValue('{"key": "value"}', 'M'); // Returns { key: "value" } as an object
 */
export function parseDynamoKeyValue(key: string, keyType: string): unknown {
  switch (keyType) {
    case 'S': // String
      return key;
    case 'N': // Number
      return Number(key);
    case 'BOOL': // Boolean
      return key.toLowerCase() === 'true';
    case 'NULL': // Null
      return null;
    case 'M': // Map (JSON string)
      try {
        return JSON.parse(key);
      } catch {
        throw new Error('Invalid JSON format for partitionKeyType M (Map)');
      }
    case 'L': // List (JSON array)
      try {
        return JSON.parse(key);
      } catch {
        throw new Error('Invalid JSON format for partitionKeyType L (List)');
      }
    case 'SS': // String Set
      return key.split(',').map((item) => item.trim());
    case 'NS': // Number Set
      return key
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((num) => !isNaN(num));
    case 'BS': // Binary Set
      return key.split(',').map((item) => Buffer.from(item.trim(), 'base64'));
    default:
      throw new Error(`Unsupported partitionKeyType: ${keyType}`);
  }
}
