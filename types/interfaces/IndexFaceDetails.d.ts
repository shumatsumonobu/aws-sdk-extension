import FaceDetailsEmotions from '~/interfaces/FaceDetailsEmotions';
/**
 * Detailed information about a face that has been indexed into a Rekognition collection.
 * Returned by {@link RekognitionClient.indexFace} when `returnDetails` is `true`.
 *
 * @example
 * ```typescript
 * const indexedFace: IndexFaceDetails = {
 *   faceId: '12345678-1234-1234-1234-123456789012',
 *   ageRange: { low: 25, high: 35 },
 *   gender: 'female',
 *   emotions: { happy: 90.5, calm: 5.2, surprised: 1.0, angry: 0.5, sad: 1.0, confused: 0.8, disgusted: 1.0 },
 * };
 * ```
 */
export default interface IndexFaceDetails {
    /**
     * Unique identifier assigned to the indexed face by Amazon Rekognition.
     * @type {string}
     */
    faceId: string;
    /**
     * Estimated age range (in years) for the indexed face.
     * `low` is the lowest estimated age, `high` is the highest.
     * @type {{ high: number, low: number }}
     */
    ageRange: {
        high: number;
        low: number;
    };
    /**
     * Predicted gender of the indexed face.
     * @type {'male' | 'female'}
     */
    gender: 'male' | 'female';
    /**
     * Emotion confidence scores for the indexed face.
     * @type {FaceDetailsEmotions}
     */
    emotions: FaceDetailsEmotions;
}
