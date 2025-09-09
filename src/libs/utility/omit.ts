/**
 * Creates a new object by omitting the specified keys from the source object.
 * This function performs a shallow copy and excludes only the specified keys,
 * keeping all other properties intact.
 *
 * @template T - The type of the source object, must extend Record<string, unknown>
 * @template K - The type of keys to omit, must be keys of T
 * @param obj - The source object from which to omit keys
 * @param keys - An array of keys to exclude from the resulting object
 * @returns A new object of type Omit<T, K> without the specified keys
 *
 * @example
 * ```typescript
 * const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' };
 * const publicUser = omit(user, ['password']);
 * // Result: { id: 1, name: 'John', email: 'john@example.com' }
 *
 * const data = { a: 1, b: 2, c: 3, d: 4 };
 * const filtered = omit(data, ['b', 'd']);
 * // Result: { a: 1, c: 3 }
 * ```
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !keys.includes(key as unknown as K)) {
      (result as Record<string, unknown>)[key] = obj[key];
    }
  }

  return result;
}
