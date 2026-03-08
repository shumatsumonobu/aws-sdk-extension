/**
 * Exception thrown when face indexing into a Rekognition collection fails.
 * Raised by {@link RekognitionClient.indexFace} when no face record is returned after indexing.
 */
export default class FaceIndexException extends Error {
  /**
   * Error name, always `'FaceIndexException'`.
   * @type {string}
   */
  name: string;

  /**
   * The ID of the collection where indexing was attempted.
   * @type {string}
   */
  collectionId: string;

  /**
   * Creates a new FaceIndexException.
   * @param {string} collectionId The ID of the collection where indexing failed.
   */
  constructor(collectionId: string) {
    super(`Face indexing failed (Collection ID: ${collectionId})`);
    this.name = 'FaceIndexException';
    this.collectionId = collectionId;
  }
}
