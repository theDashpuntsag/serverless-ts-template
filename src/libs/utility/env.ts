/**
 * Gets the value of an environment variable and throws an error if it is not set or empty.
 * @param name - The name of the environment variable to retrieve.
 * @returns The value of the environment variable.
 */
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}
