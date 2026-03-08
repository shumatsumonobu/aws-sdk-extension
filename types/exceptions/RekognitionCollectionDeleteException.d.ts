/**
 * Exception thrown when deleting a Rekognition face collection fails.
 * Raised by {@link RekognitionClient.deleteCollection} when the API returns a non-200 status code.
 */
export default class RekognitionCollectionDeleteException extends Error {
    /**
     * Error name, always `'RekognitionCollectionDeleteException'`.
     * @type {string}
     */
    name: string;
    /**
     * The ID of the collection that failed to be deleted.
     * @type {string}
     */
    collectionId: string;
    /**
     * HTTP status code returned by the Rekognition API.
     * @type {number}
     */
    httpStatusCode: number;
    /**
     * Creates a new RekognitionCollectionDeleteException.
     * @param {string} collectionId The ID of the collection that failed to be deleted.
     * @param {number} httpStatusCode HTTP status code returned by the API.
     */
    constructor(collectionId: string, httpStatusCode: number);
}
