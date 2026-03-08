import RekognitionOptions from '~/interfaces/RekognitionOptions';
import FaceMatch from '~/interfaces/FaceMatch';
import BoundingBox from '~/interfaces/BoundingBox';
import FaceDetails from '~/interfaces/FaceDetails';
import IndexFaceDetails from '~/interfaces/IndexFaceDetails';
/**
 * A simplified client for Amazon Rekognition that provides face detection, comparison,
 * and collection management operations.
 *
 * @example
 * ```typescript
 * import {RekognitionClient} from 'aws-sdk-extension';
 *
 * const client = new RekognitionClient({
 *   accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
 *   secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
 *   region: 'ap-northeast-1',
 * });
 *
 * // Detect faces in an uploaded profile photo.
 * const faces = await client.detectFaces('uploads/profile.jpg');
 * ```
 */
export default class RekognitionClient {
    #private;
    /**
     * Creates a new RekognitionClient instance.
     *
     * @param {RekognitionOptions} options Configuration options including AWS credentials, region, and timeout.
     *
     * @example
     * ```typescript
     * const client = new RekognitionClient({
     *   accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
     *   secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
     *   region: 'ap-northeast-1',
     *   timeout: 10000,
     * });
     * ```
     */
    constructor(options: RekognitionOptions);
    /**
     * Detects faces within an image and returns their bounding boxes.
     * When `withDetails` is `true`, also returns age range, gender, and emotion data for each face.
     *
     * @param {string} img Image file path or Data URL (`data:image/...;base64,...`).
     * @param {number} [minConfidence=90] Minimum confidence threshold (0-100). Faces below this confidence are excluded.
     * @param {boolean} [withDetails=false] When `true`, returns {@link FaceDetails} with age, gender, and emotions. When `false`, returns only {@link BoundingBox}.
     * @return {Promise<BoundingBox[] | FaceDetails[]>} An array of detected face data. Empty array if no faces are found.
     *
     * @example
     * ```typescript
     * // Detect face positions only.
     * const boxes = await client.detectFaces('uploads/profile.jpg');
     *
     * // Detect faces with age, gender, and emotions.
     * const details = await client.detectFaces('uploads/profile.jpg', 80, true);
     * ```
     */
    detectFaces(img: string, minConfidence?: number, withDetails?: boolean): Promise<BoundingBox[] | FaceDetails[]>;
    /**
     * Compares two face images and returns a similarity score.
     * The similarity is rounded to one decimal place.
     *
     * @param {string} img1 Source image: file path or Data URL.
     * @param {string} img2 Target image: file path or Data URL.
     * @return {Promise<number>} Similarity score (0-100) rounded to one decimal place. Returns `0` if no match is found.
     *
     * @example
     * ```typescript
     * // Verify identity by comparing an ID photo with a selfie.
     * const similarity = await client.compareFaces('uploads/id-photo.jpg', 'uploads/selfie.jpg');
     * if (similarity >= 90)
     *   console.log('Identity verified');
     * ```
     */
    compareFaces(img1: string, img2: string): Promise<number>;
    /**
     * Creates a new face collection with the specified ID.
     * Collections are used to store face metadata for search operations.
     * Collection names are case-sensitive.
     *
     * @param {string} collectionId Unique identifier for the collection. Maximum length is 255 characters. Allowed characters: `[a-zA-Z0-9_.\-]+`.
     * @throws {RekognitionCollectionCreateException} Thrown when the API returns a non-200 HTTP status code.
     *
     * @example
     * ```typescript
     * await client.createCollection('employees');
     * ```
     */
    createCollection(collectionId: string): Promise<void>;
    /**
     * Lists all face collection IDs in the current AWS account and region.
     *
     * @return {Promise<string[]>} An array of collection IDs. Empty array if no collections exist.
     *
     * @example
     * ```typescript
     * const collections = await client.listCollections();
     * // => ['employees', 'visitors']
     * ```
     */
    listCollections(): Promise<string[]>;
    /**
     * Detects exactly one face in the image and indexes it into the specified collection.
     * Throws an exception if the image contains zero or more than one face.
     *
     * @param {string} collectionId The ID of the collection to add the face to.
     * @param {string} img Image file path or Data URL.
     * @param {object} [options] Optional settings.
     * @param {string} [options.externalImageId] User-defined identifier to associate with the indexed face.
     *   Retrievable via {@link listFaces}. Maximum length is 255 characters. Allowed characters: `[a-zA-Z0-9_.\-:]+`.
     * @param {boolean} [options.returnDetails=false] When `true`, returns {@link IndexFaceDetails} with age, gender, and emotions.
     *   When `false`, returns only the face ID string.
     * @throws {FaceMissingException} Thrown when no face is detected in the image.
     * @throws {MultipleFacesException} Thrown when multiple faces are detected in the image.
     * @throws {FaceIndexException} Thrown when the indexing operation fails to return a face record.
     * @return {Promise<string | IndexFaceDetails>} The face ID string, or detailed face information if `returnDetails` is `true`.
     *
     * @example
     * ```typescript
     * // Register an employee's face with their employee ID.
     * const faceId = await client.indexFace('employees', 'uploads/employee.jpg', {
     *   externalImageId: 'EMP-1042',
     * });
     *
     * // Register and get age, gender, and emotion details.
     * const details = await client.indexFace('employees', 'uploads/employee.jpg', {
     *   returnDetails: true,
     * });
     * ```
     */
    indexFace(collectionId: string, img: string, options?: {
        externalImageId?: string;
        returnDetails?: boolean;
    }): Promise<string | IndexFaceDetails>;
    /**
     * Searches a face collection for faces matching the largest face detected in the input image.
     *
     * @param {string} collectionId The ID of the collection to search.
     * @param {string} img Image file path or Data URL.
     * @param {object} [options] Optional search settings.
     * @param {number} [options.minConfidence=80] Minimum confidence threshold (0-100) for a face match to be included in results.
     * @param {number} [options.maxFaces=5] Maximum number of matching faces to return. When set to `1`, returns a single {@link FaceMatch} object instead of an array.
     * @param {boolean} [options.throwNotFoundFaceException=false] When `true`, throws {@link FaceMissingException} if no face is detected. When `false`, returns `null`.
     * @param {boolean} [options.throwTooManyFaceException=false] When `true`, throws {@link MultipleFacesException} if multiple faces are detected.
     * @throws {FaceMissingException} Thrown when `throwNotFoundFaceException` is `true` and no face is detected.
     * @throws {MultipleFacesException} Thrown when `throwTooManyFaceException` is `true` and multiple faces are detected.
     * @return {Promise<FaceMatch[] | FaceMatch | null>} Matching faces, a single match (when `maxFaces` is `1`), or `null` if no match is found.
     *
     * @example
     * ```typescript
     * // Find matching employees for a visitor photo.
     * const matches = await client.searchFaces('employees', 'uploads/visitor.jpg');
     *
     * // Get the single best match only.
     * const bestMatch = await client.searchFaces('employees', 'uploads/visitor.jpg', {
     *   maxFaces: 1,
     *   minConfidence: 95,
     * });
     * ```
     */
    searchFaces(collectionId: string, img: string, options?: {
        minConfidence?: number;
        maxFaces?: number;
        throwNotFoundFaceException?: boolean;
        throwTooManyFaceException?: boolean;
    }): Promise<FaceMatch[] | FaceMatch | null>;
    /**
     * Lists face metadata stored in the specified collection.
     *
     * @param {string} collectionId The ID of the collection to list faces from.
     * @param {number} [maxResults=1000] Maximum number of face records to return.
     * @return {Promise<FaceMatch[]>} An array of face metadata. Empty array if the collection has no faces.
     *
     * @example
     * ```typescript
     * const faces = await client.listFaces('employees');
     * for (const face of faces)
     *   console.log(face.faceId, face.externalImageId);
     * ```
     */
    listFaces(collectionId: string, maxResults?: number): Promise<FaceMatch[]>;
    /**
     * Deletes one or more faces from a collection.
     *
     * @param {string} collectionId The ID of the collection to remove faces from.
     * @param {string[]} faceIds An array of face IDs to delete.
     * @return {Promise<boolean>} `true` on success.
     *
     * @example
     * ```typescript
     * await client.deleteFaces('employees', [faceId]);
     * ```
     */
    deleteFaces(collectionId: string, faceIds: string[]): Promise<boolean>;
    /**
     * Deletes a face collection and all faces stored within it.
     *
     * @param {string} collectionId The ID of the collection to delete.
     * @throws {RekognitionCollectionDeleteException} Thrown when the API returns a non-200 HTTP status code.
     * @return {Promise<boolean>} `true` on success.
     *
     * @example
     * ```typescript
     * await client.deleteCollection('employees');
     * ```
     */
    deleteCollection(collectionId: string): Promise<boolean>;
}
