import BoundingBox from '~/interfaces/BoundingBox';
import FaceDetailsEmotions from '~/interfaces/FaceDetailsEmotions';
/**
 * Detailed information about a face detected in an image.
 * Returned by {@link RekognitionClient.detectFaces} when `withDetails` is `true`.
 *
 * @example
 * ```typescript
 * const details: FaceDetails = {
 *   boundingBox: { width: 0.35, height: 0.45, left: 0.22, top: 0.10 },
 *   ageRange: { low: 25, high: 35 },
 *   gender: 'male',
 *   emotions: { happy: 95.2, calm: 3.1, surprised: 0.8, angry: 0.3, sad: 0.2, confused: 0.2, disgusted: 0.1 },
 * };
 * ```
 */
export default interface FaceDetails {
    /**
     * Bounding box coordinates of the detected face.
     * @type {BoundingBox}
     */
    boundingBox: BoundingBox;
    /**
     * Estimated age range (in years) for the detected face.
     * `low` is the lowest estimated age, `high` is the highest.
     * @type {{ high: number, low: number }}
     */
    ageRange?: {
        high: number;
        low: number;
    };
    /**
     * Predicted gender of the detected face.
     * @type {'male' | 'female'}
     */
    gender?: 'male' | 'female';
    /**
     * Emotion confidence scores for the detected face.
     * @type {FaceDetailsEmotions}
     */
    emotions?: FaceDetailsEmotions;
}
