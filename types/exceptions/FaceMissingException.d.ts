/**
 * Exception thrown when no face is detected in the provided image.
 * Raised by {@link RekognitionClient.indexFace} and optionally by {@link RekognitionClient.searchFaces}.
 */
export default class FaceMissingException extends Error {
    /**
     * Error name, always `'FaceMissingException'`.
     * @type {string}
     */
    name: string;
    /**
     * Creates a new FaceMissingException.
     */
    constructor();
}
