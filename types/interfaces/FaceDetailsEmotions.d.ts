/**
 * Emotion confidence scores detected from a face.
 * Each property represents the confidence level (0-100) that the face expresses a particular emotion.
 *
 * @example
 * ```typescript
 * const emotions: FaceDetailsEmotions = {
 *   happy: 95.2,
 *   calm: 3.1,
 *   surprised: 0.8,
 *   angry: 0.3,
 *   sad: 0.2,
 *   confused: 0.2,
 *   disgusted: 0.1,
 * };
 * ```
 */
export default interface FaceDetailsEmotions {
    /**
     * Confidence level (0-100) that the face expresses disgust.
     * @type {number}
     */
    disgusted: number;
    /**
     * Confidence level (0-100) that the face expresses happiness.
     * @type {number}
     */
    happy: number;
    /**
     * Confidence level (0-100) that the face expresses surprise.
     * @type {number}
     */
    surprised: number;
    /**
     * Confidence level (0-100) that the face expresses anger.
     * @type {number}
     */
    angry: number;
    /**
     * Confidence level (0-100) that the face expresses confusion.
     * @type {number}
     */
    confused: number;
    /**
     * Confidence level (0-100) that the face expresses calmness.
     * @type {number}
     */
    calm: number;
    /**
     * Confidence level (0-100) that the face expresses sadness.
     * @type {number}
     */
    sad: number;
}
