# AWS SDK Extension

[![NPM](https://img.shields.io/npm/v/aws-sdk-extension.svg)](https://www.npmjs.com/package/aws-sdk-extension)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A clean, developer-friendly wrapper around [Amazon Rekognition](https://docs.aws.amazon.com/rekognition/) and [Amazon SES](https://docs.aws.amazon.com/ses/) built on AWS SDK v3.

Skip the boilerplate. Detect faces, compare photos, manage face collections, and send templated emails — all with a minimal, intuitive API.

## Install

```sh
npm install aws-sdk-extension
```

## Quick Start

### Face Detection

```typescript
import {RekognitionClient} from 'aws-sdk-extension';

const rekognition = new RekognitionClient({
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  region: 'ap-northeast-1',
});

// Detect faces in an uploaded photo.
const faces = await rekognition.detectFaces('uploads/profile.jpg');

// Verify identity by comparing an ID photo with a selfie.
const similarity = await rekognition.compareFaces('uploads/id-photo.jpg', 'uploads/selfie.jpg');
```

### Send Email

```typescript
import {SESClient} from 'aws-sdk-extension';

const ses = new SESClient({
  region: 'ap-northeast-1',
  accessKeyId: 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
});

// Fluent API — chain, send, done.
const messageId = await ses
  .from('noreply@myapp.com', 'MyApp')
  .to('user@example.com')
  .subject('Your order has been shipped')
  .body('Hi {{name}}, your order #{{orderId}} is on its way!', {name: 'Alice', orderId: 'A-20250308'})
  .send();
```

## API Reference

### RekognitionClient

#### `new RekognitionClient(options)`

| Param | Type | Description |
|-------|------|-------------|
| `options.accessKeyId` | `string` | AWS access key ID |
| `options.secretAccessKey` | `string` | AWS secret access key |
| `options.region` | `string` | AWS region (e.g. `'ap-northeast-1'`) |
| `options.timeout` | `number` | Connection timeout in ms (default: `5000`) |

#### `detectFaces(img, minConfidence?, withDetails?)`

Detects faces in an image and returns their positions. When `withDetails` is `true`, also returns age range, gender, and emotion data.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `img` | `string` | — | File path or Data URL (`data:image/...;base64,...`) |
| `minConfidence` | `number` | `90` | Minimum confidence threshold (0-100) |
| `withDetails` | `boolean` | `false` | Return detailed face attributes |

**Returns** `Promise<BoundingBox[] | FaceDetails[]>`

```typescript
// Bounding boxes only.
const boxes = await client.detectFaces('uploads/profile.jpg');
// => [{width: 0.35, height: 0.45, left: 0.22, top: 0.10}]

// With age, gender, and emotions.
const details = await client.detectFaces('uploads/profile.jpg', 80, true);
// => [{boundingBox: {...}, ageRange: {low: 25, high: 35}, gender: 'male', emotions: {happy: 95.2, ...}}]
```

#### `compareFaces(img1, img2)`

Compares two face images and returns a similarity score, rounded to one decimal place.

| Param | Type | Description |
|-------|------|-------------|
| `img1` | `string` | Source image: file path or Data URL |
| `img2` | `string` | Target image: file path or Data URL |

**Returns** `Promise<number>` — Similarity score (0-100). Returns `0` if no match.

```typescript
const similarity = await client.compareFaces('uploads/id-photo.jpg', 'uploads/selfie.jpg');
if (similarity >= 90)
  console.log('Identity verified');
```

#### `createCollection(collectionId)`

Creates a new face collection. Collection names are case-sensitive.

| Param | Type | Description |
|-------|------|-------------|
| `collectionId` | `string` | Unique collection ID (max 255 chars, `[a-zA-Z0-9_.\-]+`) |

**Returns** `Promise<void>`
**Throws** `RekognitionCollectionCreateException` on failure.

```typescript
await client.createCollection('employees');
```

#### `listCollections()`

Lists all face collection IDs in the current account and region.

**Returns** `Promise<string[]>`

```typescript
const collections = await client.listCollections();
// => ['employees', 'visitors']
```

#### `deleteCollection(collectionId)`

Deletes a face collection and all stored faces.

| Param | Type | Description |
|-------|------|-------------|
| `collectionId` | `string` | Collection ID to delete |

**Returns** `Promise<boolean>` — `true` on success.
**Throws** `RekognitionCollectionDeleteException` on failure.

#### `indexFace(collectionId, img, options?)`

Detects exactly one face in the image and indexes it into the collection. Throws if zero or multiple faces are detected.

| Param | Type | Description |
|-------|------|-------------|
| `collectionId` | `string` | Target collection ID |
| `img` | `string` | File path or Data URL |
| `options.externalImageId` | `string` | User-defined ID to associate with the face |
| `options.returnDetails` | `boolean` | Return detailed face info (default: `false`) |

**Returns** `Promise<string | IndexFaceDetails>` — Face ID string, or detailed info when `returnDetails` is `true`.
**Throws** `FaceMissingException` · `MultipleFacesException` · `FaceIndexException`

```typescript
// Register an employee's face with their employee ID.
const faceId = await client.indexFace('employees', 'uploads/employee.jpg', {
  externalImageId: 'EMP-1042',
});

// Register and get age, gender, and emotion details.
const details = await client.indexFace('employees', 'uploads/employee.jpg', {
  returnDetails: true,
});
```

#### `searchFaces(collectionId, img, options?)`

Searches a face collection for faces matching the largest face in the input image.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `collectionId` | `string` | — | Collection to search |
| `img` | `string` | — | File path or Data URL |
| `options.minConfidence` | `number` | `80` | Minimum match threshold |
| `options.maxFaces` | `number` | `5` | Max results (when `1`, returns single object) |
| `options.throwNotFoundFaceException` | `boolean` | `false` | Throw instead of returning `null` |
| `options.throwTooManyFaceException` | `boolean` | `false` | Throw on multiple faces |

**Returns** `Promise<FaceMatch[] | FaceMatch | null>`
**Throws** `FaceMissingException` (when `throwNotFoundFaceException` is `true`) · `MultipleFacesException` (when `throwTooManyFaceException` is `true`)

```typescript
// Find matching employees for a visitor photo.
const matches = await client.searchFaces('employees', 'uploads/visitor.jpg');

// Get the single best match only.
const best = await client.searchFaces('employees', 'uploads/visitor.jpg', {maxFaces: 1});
```

#### `listFaces(collectionId, maxResults?)`

Lists face metadata stored in a collection.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `collectionId` | `string` | — | Collection to list |
| `maxResults` | `number` | `1000` | Maximum faces to return |

**Returns** `Promise<FaceMatch[]>`

#### `deleteFaces(collectionId, faceIds)`

Removes one or more faces from a collection.

| Param | Type | Description |
|-------|------|-------------|
| `collectionId` | `string` | Collection ID |
| `faceIds` | `string[]` | Face IDs to delete |

**Returns** `Promise<boolean>` — `true` on success.

### SESClient

#### `new SESClient(options)`

| Param | Type | Description |
|-------|------|-------------|
| `options.region` | `string` | AWS region |
| `options.accessKeyId` | `string` | AWS access key ID |
| `options.secretAccessKey` | `string` | AWS secret access key |
| `options.apiVersion` | `string` | SES API version in `YYYY-MM-DD` format (default: `'latest'`) |

#### `from(address, name?)`

Sets the sender. Display name is automatically MIME Q-encoded for multibyte character support.

**Returns** `SESClient` (chainable)

#### `to(address)`

Sets recipient(s). Accepts a `string` or `string[]`.

**Returns** `SESClient` (chainable)

#### `cc(address)`

Sets CC recipient(s). Accepts a `string` or `string[]`.

**Returns** `SESClient` (chainable)

#### `subject(text)`

Sets the email subject.

**Returns** `SESClient` (chainable)

#### `body(content, vars?)`

Sets the email body. Supports [Handlebars](https://handlebarsjs.com/) template syntax — pass `vars` to interpolate values.

**Returns** `SESClient` (chainable)

```typescript
client.body('Hi {{name}}, your reservation on {{date}} has been confirmed. See you there!', {
  name: 'Tanaka',
  date: '2025-04-15',
});
```

#### `send(type?)`

Sends the email. All fields (from, to, subject, body) must be set first. Fields are automatically reset after sending.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `'text' \| 'html'` | `'text'` | Email content type |

**Returns** `Promise<string>` — Message ID assigned by Amazon SES.
**Throws** `TypeError` when required fields are missing.

```typescript
// Send a password reset email.
const id = await client
  .from('noreply@myapp.com')
  .to('user@example.com')
  .subject('Password Reset Request')
  .body('Your password reset code is {{code}}. This code expires in 10 minutes.', {code: '482956'})
  .send();

// Send an HTML order confirmation.
const htmlId = await client
  .from('noreply@myapp.com', 'MyApp Store')
  .to('user@example.com')
  .subject('Order Confirmed - #A-20250308')
  .body('<h1>Thank you, {{name}}!</h1><p>Your order #{{orderId}} has been confirmed and will ship within 2 business days.</p>', {name: 'Tanaka', orderId: 'A-20250308'})
  .send('html');
```

### Interfaces

#### `BoundingBox`

Bounding box coordinates as ratios (0-1) relative to image dimensions.

```typescript
{width: number, height: number, left: number, top: number}
```

#### `FaceDetails`

Returned by `detectFaces()` when `withDetails` is `true`.

```typescript
{
  boundingBox: BoundingBox,
  ageRange?: {low: number, high: number},
  gender?: 'male' | 'female',
  emotions?: FaceDetailsEmotions,
}
```

#### `FaceDetailsEmotions`

Emotion confidence scores (0-100) for a detected face.

```typescript
{happy: number, surprised: number, angry: number, calm: number, confused: number, disgusted: number, sad: number}
```

#### `FaceMatch`

Face metadata returned by search and list operations.

```typescript
{
  faceId: string,
  boundingBox: BoundingBox,
  externalImageId?: string,
  similarity?: number,
}
```

#### `IndexFaceDetails`

Returned by `indexFace()` when `returnDetails` is `true`.

```typescript
{
  faceId: string,
  ageRange: {low: number, high: number},
  gender: 'male' | 'female',
  emotions: FaceDetailsEmotions,
}
```

### Exceptions

| Class | Thrown When |
|-------|------------|
| `FaceMissingException` | No face detected in the image |
| `MultipleFacesException` | Multiple faces detected when exactly one is expected |
| `FaceIndexException` | Face indexing operation fails to return a record |
| `RekognitionCollectionCreateException` | Collection creation returns non-200 status |
| `RekognitionCollectionDeleteException` | Collection deletion returns non-200 status |

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Author

**shumatsumonobu**
+ [github/shumatsumonobu](https://github.com/shumatsumonobu)
+ [X/shumatsumonobu](https://x.com/shumatsumonobu)
+ [facebook/takuya.motoshima.7](https://www.facebook.com/takuya.motoshima.7)

## License

[MIT](LICENSE)
