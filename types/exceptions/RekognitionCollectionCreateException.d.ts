/**
 * Exception thrown when creating a Rekognition face collection fails.
 * Raised by {@link RekognitionClient.createCollection} when the API returns a non-200 status code.
 */
export default class RekognitionCollectionCreateException extends Error {
    /**
     * Error name, always `'RekognitionCollectionCreateException'`.
     * @type {string}
     */
    name: string;
    /**
     * The ID of the collection that failed to be created.
     * @type {string}
     */
    collectionId: string;
    /**
     * HTTP status code returned by the Rekognition API.
     * @type {number}
     */
    httpStatusCode: number;
    /**
     * Creates a new RekognitionCollectionCreateException.
     * @param {string} collectionId The ID of the collection that failed to be created.
     * @param {number} httpStatusCode HTTP status code returned by the API.
     */
    constructor(collectionId: string, httpStatusCode: number);
}
