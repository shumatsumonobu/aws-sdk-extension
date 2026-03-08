/**
 * Configuration options for initializing a {@link SESClient}.
 *
 * @example
 * ```typescript
 * const options: SESOptions = {
 *   apiVersion: '2010-12-01',
 *   region: 'ap-northeast-1',
 *   accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
 *   secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
 * };
 * ```
 */
export default interface SESOptions {
  /**
   * SES API version in `YYYY-MM-DD` format.
   * Specify `'latest'` to use the most recent API version.
   * @type {string}
   * @default 'latest'
   */
  apiVersion: string,

  /**
   * AWS region to send service requests to (e.g. `'ap-northeast-1'`, `'us-east-1'`).
   * @type {string}
   */
  region: string,

  /**
   * AWS access key ID for authentication.
   * @type {string}
   */
  accessKeyId: string,

  /**
   * AWS secret access key for authentication.
   * @type {string}
   */
  secretAccessKey: string,
}
