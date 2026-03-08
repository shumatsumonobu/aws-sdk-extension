const fs = require('fs');
const path = require('path');
const {
  RekognitionClient,
  FaceMissingException,
  MultipleFacesException,
} = require('../dist/build.common');
const loadEnv = require('./support/loadEnv');

// Path to the test image fixtures directory.
const fixturesDir = path.join(__dirname, 'fixtures');

// Unique prefix to avoid collection name collisions between test runs.
const prefix = `test-${Date.now()}`;

// Collection IDs used across test groups.
const COLLECTION = {
  CRUD:   `${prefix}-crud`,
  INDEX:  `${prefix}-index`,
  SEARCH: `${prefix}-search`,
  LIST:   `${prefix}-list`,
  DELETE: `${prefix}-delete`,
};

let client;

beforeAll(() => {
  loadEnv();
  client = new RekognitionClient({
    accessKeyId: process.env.REKOGNITION_ACCESS_KEY_ID,
    secretAccessKey: process.env.REKOGNITION_SECRET_ACCESS_KEY,
    region: process.env.REKOGNITION_REGION,
  });
});

// Clean up all collections created during this test run.
afterAll(async () => {
  for (const id of Object.values(COLLECTION)) {
    try {
      await client.deleteCollection(id);
    } catch {
      // Collection may not exist; ignore.
    }
  }
});

// ---------------------------------------------------------------------------
// detectFaces()
// ---------------------------------------------------------------------------
describe('detectFaces()', () => {
  test('returns one bounding box for a single-person image', async () => {
    const results = await client.detectFaces(`${fixturesDir}/single-face.jpg`);
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('width');
    expect(results[0]).toHaveProperty('height');
    expect(results[0]).toHaveProperty('left');
    expect(results[0]).toHaveProperty('top');
  });

  test('returns three bounding boxes for a three-person image', async () => {
    const results = await client.detectFaces(`${fixturesDir}/multiple-faces.jpg`);
    expect(results).toHaveLength(3);
  });

  test('returns an empty array for an image with no faces', async () => {
    const results = await client.detectFaces(`${fixturesDir}/no-face.jpg`);
    expect(results).toHaveLength(0);
  });

  test('returns FaceDetails with age, gender, and emotions when withDetails is true', async () => {
    const results = await client.detectFaces(`${fixturesDir}/single-face.jpg`, 90, true);
    expect(results).toHaveLength(1);

    const detail = results[0];
    // Bounding box.
    expect(detail.boundingBox).toEqual(expect.objectContaining({
      width: expect.any(Number),
      height: expect.any(Number),
      left: expect.any(Number),
      top: expect.any(Number),
    }));
    // Age range.
    expect(detail.ageRange).toEqual(expect.objectContaining({
      high: expect.any(Number),
      low: expect.any(Number),
    }));
    // Gender.
    expect(['male', 'female']).toContain(detail.gender);
    // Emotions.
    expect(detail.emotions).toEqual(expect.objectContaining({
      happy: expect.any(Number),
      surprised: expect.any(Number),
      angry: expect.any(Number),
      calm: expect.any(Number),
      confused: expect.any(Number),
      disgusted: expect.any(Number),
      sad: expect.any(Number),
    }));
  });

  test('accepts a Data URL as input', async () => {
    const imageBuffer = fs.readFileSync(`${fixturesDir}/single-face.jpg`);
    const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    const results = await client.detectFaces(dataUrl);
    expect(results).toHaveLength(1);
  });

  test('throws an error for an invalid image input', async () => {
    await expect(client.detectFaces('not-a-valid-path-or-data-url'))
      .rejects
      .toThrow('The parameter image is invalid');
  });
});

// ---------------------------------------------------------------------------
// compareFaces()
// ---------------------------------------------------------------------------
describe('compareFaces()', () => {
  test('returns high similarity (>= 90) for the same person', async () => {
    const similarity = await client.compareFaces(
      `${fixturesDir}/person-a-photo1.jpg`,
      `${fixturesDir}/person-a-photo2.jpg`,
    );
    expect(similarity).toBeGreaterThanOrEqual(90);
  });

  test('returns low similarity (< 90) for different people', async () => {
    const similarity = await client.compareFaces(
      `${fixturesDir}/person-b.jpg`,
      `${fixturesDir}/person-c.jpg`,
    );
    expect(similarity).toBeLessThan(90);
  });
});

// ---------------------------------------------------------------------------
// createCollection() / listCollections() / deleteCollection()
// ---------------------------------------------------------------------------
describe('Collection management', () => {
  test('createCollection() creates a new collection', async () => {
    await client.createCollection(COLLECTION.CRUD);
    const list = await client.listCollections();
    expect(list).toContain(COLLECTION.CRUD);
  });

  test('listCollections() includes the newly created collection', async () => {
    const list = await client.listCollections();
    expect(Array.isArray(list)).toBe(true);
    expect(list).toContain(COLLECTION.CRUD);
  });

  test('deleteCollection() removes the collection created above', async () => {
    const result = await client.deleteCollection(COLLECTION.CRUD);
    expect(result).toBe(true);

    const list = await client.listCollections();
    expect(list).not.toContain(COLLECTION.CRUD);
  });
});

// ---------------------------------------------------------------------------
// indexFace()
// ---------------------------------------------------------------------------
describe('indexFace()', () => {
  beforeAll(async () => {
    await client.createCollection(COLLECTION.INDEX);
  });

  afterAll(async () => {
    try {
      await client.deleteCollection(COLLECTION.INDEX);
    } catch {
      // Ignore cleanup errors.
    }
  });

  test('returns a face ID string by default', async () => {
    const faceId = await client.indexFace(COLLECTION.INDEX, `${fixturesDir}/person-a-photo1.jpg`);
    expect(typeof faceId).toBe('string');
    expect(faceId.length).toBeGreaterThan(0);
  });

  test('returns IndexFaceDetails when returnDetails is true', async () => {
    const details = await client.indexFace(COLLECTION.INDEX, `${fixturesDir}/single-face.jpg`, {
      returnDetails: true,
    });
    expect(details).toHaveProperty('faceId');
    expect(details.ageRange).toEqual(expect.objectContaining({
      high: expect.any(Number),
      low: expect.any(Number),
    }));
    expect(['male', 'female']).toContain(details.gender);
    expect(details.emotions).toEqual(expect.objectContaining({
      happy: expect.any(Number),
      surprised: expect.any(Number),
      angry: expect.any(Number),
      calm: expect.any(Number),
      confused: expect.any(Number),
      disgusted: expect.any(Number),
      sad: expect.any(Number),
    }));
  });

  test('stores externalImageId with the indexed face', async () => {
    const externalImageId = 'test-user-001';
    await client.indexFace(COLLECTION.INDEX, `${fixturesDir}/person-c.jpg`, {externalImageId});

    const faces = await client.listFaces(COLLECTION.INDEX);
    const found = faces.find(f => f.externalImageId === externalImageId);
    expect(found).toBeDefined();
  });

  test('throws FaceMissingException for an image with no face', async () => {
    await expect(client.indexFace(COLLECTION.INDEX, `${fixturesDir}/no-face.jpg`))
      .rejects
      .toThrow(FaceMissingException);
  });

  test('throws MultipleFacesException for an image with multiple faces', async () => {
    await expect(client.indexFace(COLLECTION.INDEX, `${fixturesDir}/multiple-faces.jpg`))
      .rejects
      .toThrow(MultipleFacesException);
  });
});

// ---------------------------------------------------------------------------
// searchFaces()
// ---------------------------------------------------------------------------
describe('searchFaces()', () => {
  beforeAll(async () => {
    await client.createCollection(COLLECTION.SEARCH);
    await client.indexFace(COLLECTION.SEARCH, `${fixturesDir}/person-a-photo1.jpg`, {
      externalImageId: 'person-a',
    });
  });

  afterAll(async () => {
    try {
      await client.deleteCollection(COLLECTION.SEARCH);
    } catch {
      // Ignore cleanup errors.
    }
  });

  test('returns an array of FaceMatch objects by default', async () => {
    const results = await client.searchFaces(COLLECTION.SEARCH, `${fixturesDir}/person-a-photo2.jpg`);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const match = results[0];
    expect(match).toHaveProperty('faceId');
    expect(match).toHaveProperty('boundingBox');
    expect(match).toHaveProperty('similarity');
  });

  test('returns a single FaceMatch when maxFaces is 1', async () => {
    const result = await client.searchFaces(COLLECTION.SEARCH, `${fixturesDir}/person-a-photo2.jpg`, {
      maxFaces: 1,
    });
    // When maxFaces is 1, a single object is returned instead of an array.
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(false);
    expect(result).toHaveProperty('faceId');
    expect(result).toHaveProperty('similarity');
  });

  test('includes externalImageId in the result when it was set during indexing', async () => {
    const result = await client.searchFaces(COLLECTION.SEARCH, `${fixturesDir}/person-a-photo2.jpg`, {
      maxFaces: 1,
    });
    expect(result.externalImageId).toBe('person-a');
  });

  test('returns null when the input image has no face', async () => {
    const result = await client.searchFaces(COLLECTION.SEARCH, `${fixturesDir}/no-face.jpg`);
    expect(result).toBeNull();
  });

  test('throws FaceMissingException when throwNotFoundFaceException is true and no face is found', async () => {
    await expect(
      client.searchFaces(COLLECTION.SEARCH, `${fixturesDir}/no-face.jpg`, {
        throwNotFoundFaceException: true,
      }),
    ).rejects.toThrow(FaceMissingException);
  });

  test('throws MultipleFacesException when throwTooManyFaceException is true and multiple faces are found', async () => {
    await expect(
      client.searchFaces(COLLECTION.SEARCH, `${fixturesDir}/multiple-faces.jpg`, {
        throwTooManyFaceException: true,
      }),
    ).rejects.toThrow(MultipleFacesException);
  });
});

// ---------------------------------------------------------------------------
// listFaces()
// ---------------------------------------------------------------------------
describe('listFaces()', () => {
  beforeAll(async () => {
    await client.createCollection(COLLECTION.LIST);
    await client.indexFace(COLLECTION.LIST, `${fixturesDir}/person-a-photo1.jpg`);
    await client.indexFace(COLLECTION.LIST, `${fixturesDir}/single-face.jpg`);
  });

  afterAll(async () => {
    try {
      await client.deleteCollection(COLLECTION.LIST);
    } catch {
      // Ignore cleanup errors.
    }
  });

  test('returns an array of face metadata', async () => {
    const faces = await client.listFaces(COLLECTION.LIST);
    expect(faces).toHaveLength(2);

    for (const face of faces) {
      expect(face).toHaveProperty('faceId');
      expect(face.boundingBox).toEqual(expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
        left: expect.any(Number),
        top: expect.any(Number),
      }));
    }
  });

  test('respects the maxResults parameter', async () => {
    const faces = await client.listFaces(COLLECTION.LIST, 1);
    expect(faces).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// deleteFaces()
// ---------------------------------------------------------------------------
describe('deleteFaces()', () => {
  let faceIdToDelete;

  beforeAll(async () => {
    await client.createCollection(COLLECTION.DELETE);
    faceIdToDelete = await client.indexFace(COLLECTION.DELETE, `${fixturesDir}/person-a-photo1.jpg`);
  });

  afterAll(async () => {
    try {
      await client.deleteCollection(COLLECTION.DELETE);
    } catch {
      // Ignore cleanup errors.
    }
  });

  test('removes a face from the collection', async () => {
    const result = await client.deleteFaces(COLLECTION.DELETE, [faceIdToDelete]);
    expect(result).toBe(true);

    // Verify the face no longer exists in the collection.
    const faces = await client.listFaces(COLLECTION.DELETE);
    const found = faces.find(f => f.faceId === faceIdToDelete);
    expect(found).toBeUndefined();
  });
});
