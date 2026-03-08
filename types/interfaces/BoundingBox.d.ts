/**
 * Bounding box coordinates of a detected face in an image.
 * Values are expressed as ratios relative to the overall image dimensions.
 *
 * @example
 * ```typescript
 * const box: BoundingBox = {
 *   width: 0.35,
 *   height: 0.45,
 *   left: 0.22,
 *   top: 0.10,
 * };
 * ```
 */
export default interface BoundingBox {
    /**
     * Width of the bounding box as a ratio of the overall image width.
     * @type {number}
     */
    width: number;
    /**
     * Height of the bounding box as a ratio of the overall image height.
     * @type {number}
     */
    height: number;
    /**
     * Left coordinate of the bounding box as a ratio of the overall image width.
     * The origin (0, 0) is at the upper-left corner of the image.
     * @type {number}
     */
    left: number;
    /**
     * Top coordinate of the bounding box as a ratio of the overall image height.
     * The origin (0, 0) is at the upper-left corner of the image.
     * @type {number}
     */
    top: number;
}
