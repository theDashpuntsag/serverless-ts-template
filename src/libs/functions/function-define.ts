export function generatePathname(context: string): string {
  return `${context.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}`;
}

/**
 * Returns a default Lambda function configuration.
 *
 * @param dirName
 * @param fnName
 * @param other
 * @returns
 */
export function createDefaultFunction({ dir, fnName, other = {} }: { dir: string; fnName: string; other?: object }) {
  return {
    handler: `${generatePathname(dir)}/handler.${fnName}`,
    ...other,
  };
}

/**
 * Returns a default API Lambda function configuration.
 *
 * @param dir
 * @param fn
 * @param http
 * @param other
 * @param moreEvent -
 * @returns
 */
export function createDefaultApiFunction({
  dir,
  fn,
  http,
  other = {},
}: {
  dir: string;
  fn: string;
  http: {
    method: string;
    url: string;
    more?: object;
  };
  other?: object;
}) {
  return {
    handler: `${generatePathname(dir)}/handler.${fn}`,
    events: [
      {
        http: {
          method: http.method,
          path: http.url,
          ...http.more,
        },
      },
    ],
    ...other,
  };
}
