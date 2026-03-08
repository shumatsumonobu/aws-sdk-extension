import fs from 'fs';
import {Agent} from 'https';
import * as AWS from '@aws-sdk/client-rekognition';
import {NodeHttpHandler} from "@smithy/node-http-handler";
import RekognitionOptions from '~/interfaces/RekognitionOptions';
import FaceMatch from '~/interfaces/FaceMatch';
import BoundingBox from '~/interfaces/BoundingBox';
import FaceDetails from '~/interfaces/FaceDetails';
import IndexFaceDetails from '~/interfaces/IndexFaceDetails';
import FaceDetailsEmotions from '~/interfaces/FaceDetailsEmotions';
import RekognitionCollectionCreateException from '~/exceptions/RekognitionCollectionCreateException';
import FaceMissingException from '~/exceptions/FaceMissingException';
import MultipleFacesException from '~/exceptions/MultipleFacesException';
import FaceIndexException from '~/exceptions/FaceIndexException';
import RekognitionCollectionDeleteException from '~/exceptions/RekognitionCollectionDeleteException';
import isFile from '~/utils/isFile';

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
  /**
   * Internal AWS Rekognition SDK client instance.
   * @type {AWS.RekognitionClient}
   */
  #client: AWS.RekognitionClient;

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
  constructor(options: RekognitionOptions) {
    // Apply default values for optional properties.
    options = Object.assign({
      timeout: 5000
    }, options);

    // Initialize the AWS Rekognition SDK client.
    this.#client = new AWS.RekognitionClient({
      region: options.region,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
      requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({}),
        connectionTimeout: options.timeout,
      }),
    });
  }

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
  async detectFaces(img: string, minConfidence: number = 90, withDetails: boolean = false): Promise<BoundingBox[]|FaceDetails[]> {
    // Call the Rekognition DetectFaces API.
    const res: AWS.DetectFacesResponse = await this.#client.send(new AWS.DetectFacesCommand({
      Image: {Bytes: this.#imageToBuffer(img)},
      Attributes: [withDetails ? 'ALL' : 'DEFAULT']
    }));

    // Return empty array if no faces were detected.
    if (!res.FaceDetails)
      return [];

    // Process each detected face.
    const results: FaceDetails[]|BoundingBox[] = [];
    for (const detail of res.FaceDetails) {
      if (!detail.BoundingBox
        || !detail.Confidence
        || detail.Confidence < minConfidence
      )
        continue;

      // Extract bounding box coordinates.
      const boundingBox = {
        width: detail.BoundingBox.Width as number,
        height: detail.BoundingBox.Height as number,
        left: detail.BoundingBox.Left as number,
        top: detail.BoundingBox.Top as number
      };

      // Return bounding box only when details are not requested.
      if (!withDetails) {
        (results as BoundingBox[]).push(boundingBox);
        continue;
      }

      // Include age range, gender, and emotion data when details are requested.
      (results as FaceDetails[]).push({
        boundingBox,
        ageRange: detail.AgeRange ? {high: detail.AgeRange.High as number, low: detail.AgeRange.Low as number} : undefined,
        gender: detail.Gender ? (detail.Gender.Value === 'Male' ? 'male' : 'female') : undefined,
        emotions: detail.Emotions ?
          detail.Emotions.reduce((acc: any, current: AWS.Emotion) => {
            acc[current.Type!.toLowerCase()] = current.Confidence as number;
            return acc;
          }, {}) as FaceDetailsEmotions :
          undefined,
        });
    }

    return results;
  }

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
  async compareFaces(img1: string, img2: string): Promise<number> {
    // Call the Rekognition CompareFaces API.
    const res: AWS.CompareFacesResponse = await this.#client.send(new AWS.CompareFacesCommand({
      SourceImage: {
        Bytes: this.#imageToBuffer(img1)
      },
      TargetImage: {
        Bytes: this.#imageToBuffer(img2)
      },
      SimilarityThreshold: 0
    }));

    // Extract and round the similarity score.
    let similarity = 0;
    if (res.FaceMatches
      && res.FaceMatches.length > 0
      && res.FaceMatches[0].Similarity
    )
      similarity = Math.round(res.FaceMatches[0].Similarity * 10) / 10;
    return similarity;
  }

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
  async createCollection(collectionId: string): Promise<void> {
    const res: AWS.CreateCollectionResponse = await this.#client.send(new AWS.CreateCollectionCommand({
      CollectionId: collectionId
    }));

    // Throw if the collection was not created successfully.
    if (res.StatusCode !== 200)
      throw new RekognitionCollectionCreateException(collectionId, res.StatusCode as number);
  }

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
  async listCollections(): Promise<string[]> {
    const res: AWS.ListCollectionsResponse = await this.#client.send(new AWS.ListCollectionsCommand({}));

    // Return empty array if no collections exist.
    if (!res.CollectionIds || !res.CollectionIds.length)
      return [];

    return res.CollectionIds;
  }

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
  async indexFace(collectionId: string, img: string, options?: {externalImageId? : string, returnDetails?: boolean}): Promise<string|IndexFaceDetails> {
    // Apply default values for optional properties.
    options = Object.assign({
      externalImageId: undefined,
      returnDetails: false
    }, options);

    // Validate that the image contains exactly one face.
    const numberOfFaces = (await this.detectFaces(img)).length;
    if (numberOfFaces === 0)
      throw new FaceMissingException();
    else if (numberOfFaces > 1)
      throw new MultipleFacesException();

    // Call the Rekognition IndexFaces API.
    const res: AWS.IndexFacesResponse = await this.#client.send(new AWS.IndexFacesCommand({
      CollectionId: collectionId,
      Image: {
        Bytes: this.#imageToBuffer(img)
      },
      DetectionAttributes: ['ALL'],
      ExternalImageId: options.externalImageId,
      MaxFaces: 1,
      QualityFilter: 'HIGH'
    }));

    // Throw if the API did not return any face records.
    if (res == null || !res.FaceRecords || !res.FaceRecords.length)
      throw new FaceIndexException(collectionId);

    const faceRecord = res.FaceRecords[0] as AWS.FaceRecord;
    const detail = faceRecord.FaceDetail as AWS.FaceDetail;

    // Return face ID only, or detailed face information based on options.
    if (!options.returnDetails)
      return faceRecord.Face!.FaceId as string;
    else {
      return {
        faceId: faceRecord.Face!.FaceId as string,
        ageRange: detail.AgeRange ? {high: detail.AgeRange.High as number, low: detail.AgeRange.Low as number} : undefined,
        gender: detail.Gender ? (detail.Gender.Value === 'Male' ? 'male' : 'female') : undefined,
        emotions: detail.Emotions ?
          detail.Emotions.reduce((acc: any, current: AWS.Emotion) => {
            acc[current.Type!.toLowerCase()] = current.Confidence as number;
            return acc;
          }, {}) as FaceDetailsEmotions :
          undefined
      } as IndexFaceDetails;
    }
  }

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
  async searchFaces(
    collectionId: string,
    img: string,
    options?: {
      minConfidence? : number,
      maxFaces?: number,
      throwNotFoundFaceException?: boolean,
      throwTooManyFaceException?: boolean,
    }
  ): Promise<FaceMatch[]|FaceMatch|null> {
    // Apply default values for optional properties.
    options = Object.assign({
      minConfidence: 80,
      maxFaces: 5,
      throwNotFoundFaceException: false,
      throwTooManyFaceException: false,
    }, options);

    // Validate that the image contains at least one face.
    const numberOfFaces = (await this.detectFaces(img)).length;
    if (numberOfFaces === 0) {
      if (options.throwNotFoundFaceException)
        throw new FaceMissingException();
      else
        return null;
    } else if (numberOfFaces > 1 && options.throwTooManyFaceException)
      throw new MultipleFacesException();

    // Call the Rekognition SearchFacesByImage API.
    const res: AWS.SearchFacesByImageResponse = await this.#client.send(new AWS.SearchFacesByImageCommand({
      CollectionId: collectionId,
      Image: {Bytes: this.#imageToBuffer(img)},
      FaceMatchThreshold: options.minConfidence,
      MaxFaces: options.maxFaces!,
      QualityFilter: 'AUTO'
    }));

    // Return null if no matching faces were found in the collection.
    if (!res.FaceMatches || !res.FaceMatches.length)
      return null;

    // Build the result array from the API response.
    const results: FaceMatch[] = [];
    for (const match of res.FaceMatches) {
      const face = match.Face as AWS.Face;
      const result = {
        faceId: face.FaceId,
        boundingBox: {
          width: face.BoundingBox!.Width,
          height: face.BoundingBox!.Height,
          left: face.BoundingBox!.Left,
          top: face.BoundingBox!.Top,
        },
        similarity: match.Similarity,
      } as FaceMatch;
      if (face.ExternalImageId != null)
        result.externalImageId = face.ExternalImageId;
      results.push(result);
    }

    // Return a single result when maxFaces is 1, otherwise return the full array.
    return options.maxFaces === 1 ? results[0] : results;
  }

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
  async listFaces(collectionId: string, maxResults: number = 1000): Promise<FaceMatch[]> {
    const res: AWS.ListFacesResponse = await this.#client.send(new AWS.ListFacesCommand({
      CollectionId: collectionId,
      MaxResults: maxResults
    }));

    // Return empty array if the collection contains no faces.
    if (!res.Faces)
      return [];

    // Build the result array from the API response.
    const results: FaceMatch[] = [];
    for (const face of res.Faces) {
      const result = {
        faceId: face.FaceId,
        boundingBox: {
          width: face.BoundingBox!.Width,
          height: face.BoundingBox!.Height,
          left: face.BoundingBox!.Left,
          top: face.BoundingBox!.Top,
        }
      } as FaceMatch;
      if (face.ExternalImageId != null)
        result.externalImageId = face.ExternalImageId;
      results.push(result);
    }

    return results;
  }

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
  async deleteFaces(collectionId: string, faceIds: string[]): Promise<boolean> {
    await this.#client.send(new AWS.DeleteFacesCommand({
      CollectionId: collectionId,
      FaceIds: faceIds
    }));
    return true;
  }

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
  async deleteCollection(collectionId: string): Promise<boolean> {
    const res: AWS.DeleteCollectionResponse = await this.#client.send(new AWS.DeleteCollectionCommand({CollectionId: collectionId}));

    // Throw if the collection was not deleted successfully.
    if (res.StatusCode !== 200)
      throw new RekognitionCollectionDeleteException(collectionId, res.StatusCode as number);
    return true;
  }

  /**
   * Converts an image input (file path or Data URL) to a Buffer suitable for the Rekognition API.
   *
   * @param {string} img Image file path or Data URL (`data:image/...;base64,...`).
   * @return {Buffer} Image data as a Buffer.
   * @throws {Error} Thrown when the input is not a valid image path or Data URL.
   */
  #imageToBuffer(img: string): Buffer {
    if (/^data:image\//.test(img))
      // Decode base64-encoded Data URL to Buffer.
      return Buffer.from(img.replace(/^data:image\/[A-Za-z]+;base64,/, ''), 'base64');
    else if (isFile(img))
      // Read the file from disk and return as Buffer.
      return fs.readFileSync(img);
    else
      throw new Error('The parameter image is invalid');
  }
}
