/**
 * Configuration options for initializing a {@link RekognitionClient}.
 *
 * @example
 * ```typescript
 * const options: RekognitionOptions = {
 *   accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
 *   secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
 *   region: 'ap-northeast-1',
 *   timeout: 10000,
 * };
 * ```
 */
export default interface RekognitionOptions {
    /**
     * AWS access key ID for authentication.
     * @type {string}
     */
    accessKeyId: string;
    /**
     * AWS secret access key for authentication.
     * @type {string}
     */
    secretAccessKey: string;
    /**
     * AWS region to send service requests to (e.g. `'ap-northeast-1'`, `'us-east-1'`).
     * @type {string}
     */
    region: string;
    /**
     * Connection timeout in milliseconds.
     * If the connection is not established within this period, the request will be aborted.
     * @type {number}
     * @default 5000
     */
    timeout?: number;
}
