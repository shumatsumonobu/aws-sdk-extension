import BoundingBox from '~/interfaces/BoundingBox';

/**
 * Face metadata returned by face search and listing operations.
 * Contains the face identifier, bounding box, optional external image ID, and similarity score.
 *
 * @example
 * ```typescript
 * const match: FaceMatch = {
 *   faceId: '12345678-1234-1234-1234-123456789012',
 *   boundingBox: { width: 0.35, height: 0.45, left: 0.22, top: 0.10 },
 *   externalImageId: 'user-001',
 *   similarity: 99.5,
 * };
 * ```
 */
export default interface FaceMatch {
  /**
   * Unique identifier assigned to the face by Amazon Rekognition.
   * @type {string}
   */
  faceId: string,

  /**
   * Bounding box coordinates of the face in the image.
   * @type {BoundingBox}
   */
  boundingBox: BoundingBox,

  /**
   * User-defined identifier associated with the face via the `externalImageId` parameter during indexing.
   * @type {string}
   */
  externalImageId?: string,

  /**
   * Confidence score (0-100) indicating how closely this face matches the input face.
   * @type {number}
   */
  similarity?: number
}
