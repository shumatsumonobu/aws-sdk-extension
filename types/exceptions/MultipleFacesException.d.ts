/**
 * Exception thrown when multiple faces are detected in an image that expects exactly one face.
 * Raised by {@link RekognitionClient.indexFace} and optionally by {@link RekognitionClient.searchFaces}.
 */
export default class MultipleFacesException extends Error {
    /**
     * Error name, always `'MultipleFacesException'`.
     * @type {string}
     */
    name: string;
    /**
     * Creates a new MultipleFacesException.
     */
    constructor();
}
