import { createHmac, webcrypto as nodeWebCrypto, randomUUID } from 'node:crypto';

/**
 * Generates a SHA256 HMAC checksum using the provided secret key.
 *
 * @param sKey - The secret key used for HMAC generation.
 * @param args - An array of strings to be concatenated and hashed.
 * @returns The resulting SHA256 HMAC checksum as a hexadecimal string.
 */
export function generateSha256Checksum(sKey: string, args: string[]): string {
  const mergedStr = args.filter((v) => v && v.length > 0).join('');
  return createHmac('sha256', sKey).update(mergedStr, 'utf8').digest('hex');
}
/**
 * Rounds down to 2 decimals (toward -infinity).
 */
export function roundDownToTwoDecimals(amount: number): number {
  return Math.floor(amount * 100) / 100;
}

/**
 * Get Web Crypto (browser or Node).
 */
export function getCrypto(): typeof globalThis.crypto {
  return globalThis.crypto ?? (nodeWebCrypto as unknown as typeof globalThis.crypto);
}

/**
 * RFC 4122 v4 UUID generator.
 * @returns A randomly generated UUID v4 string.
 */
export function generateUuidV4(): string {
  if (typeof randomUUID === 'function') return randomUUID();
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const c = getCrypto();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);

  const b6 = bytes[6] as number;
  const b8 = bytes[8] as number;

  bytes[6] = (b6 & 0x0f) | 0x40;
  bytes[8] = (b8 & 0x3f) | 0x80;

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
