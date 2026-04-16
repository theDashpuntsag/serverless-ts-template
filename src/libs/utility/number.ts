export type RoundingMode = 'round' | 'floor' | 'ceil' | 'trunc';

/**
 * Converts a number to have exactly 2 decimal places (insignificant digits).
 *
 * @param num - The number to format
 * @param roundingMode - Optional rounding mode ('round', 'floor', 'ceil', 'trunc'). Defaults to 'trunc'.
 * @returns A number with exactly 2 decimal places
 */
export function formatNumToTwoDecimalPlaces(num: number | string, roundingMode: RoundingMode = 'trunc'): number {
  const value = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(value) || !isFinite(value)) {
    return NaN;
  }

  switch (roundingMode) {
    case 'floor':
      return Math.floor(value * 100) / 100;
    case 'ceil':
      return Math.ceil(value * 100) / 100;
    case 'trunc':
      return Math.trunc(value * 100) / 100;
    case 'round':
    default:
      return Math.round(value * 100) / 100;
  }
}
