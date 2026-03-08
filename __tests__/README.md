# Tests

Integration tests for `aws-sdk-extension`. These tests call the actual AWS Rekognition and SES APIs, so valid credentials are required.

## Setup

1. Copy the sample environment file and fill in your credentials:
    ```sh
    cp __tests__/.env.sample __tests__/.env
    ```

2. Edit `__tests__/.env` with your AWS credentials:

    | Variable | Description |
    |----------|-------------|
    | `REKOGNITION_REGION` | AWS region for Rekognition (e.g. `ap-northeast-1`) |
    | `REKOGNITION_ACCESS_KEY_ID` | IAM access key ID with Rekognition permissions |
    | `REKOGNITION_SECRET_ACCESS_KEY` | IAM secret access key |
    | `SES_API_VERSION` | SES API version (e.g. `2010-12-01`) |
    | `SES_REGION` | AWS region for SES (e.g. `ap-northeast-1`) |
    | `SES_ACCESS_KEY_ID` | IAM access key ID with SES permissions |
    | `SES_SECRET_ACCESS_KEY` | IAM secret access key |
    | `SES_FROM` | Verified sender email address |
    | `SES_TO` | Recipient email address |

3. Build the project before running tests:
    ```sh
    npm run build
    ```

4. Run the tests:
    ```sh
    npm test
    ```

## Directory Structure

```
__tests__/
├── fixtures/                       Test images (single-face, multiple-faces, person-*, no-face)
├── support/
│   └── loadEnv.js                  Loads .env into process.env
├── .env.sample                     Sample environment variables
├── RekognitionClient.test.js       Rekognition client integration tests
├── SESClient.test.js               SES client integration tests
└── README.md                       This file
```

## Test Coverage

### RekognitionClient (25 tests)

| Method | Cases |
|--------|-------|
| `detectFaces()` | Single face, multiple faces, no face, with details, Data URL input, invalid input |
| `compareFaces()` | Same person (high similarity), different people (low similarity) |
| `createCollection()` / `deleteCollection()` | Create, verify in list, delete, verify removed |
| `indexFace()` | Face ID return, detailed return, externalImageId, no-face error, multi-face error |
| `searchFaces()` | Array result, single result, externalImageId, null on no-face, exception options |
| `listFaces()` | List metadata, maxResults |
| `deleteFaces()` | Remove face, verify removal |

### SESClient (12 tests)

| Method | Cases |
|--------|-------|
| `send()` | Plain text, HTML, Handlebars template, CC, array recipients, missing fields error, field reset |
| Fluent API | `from()`, `to()`, `cc()`, `subject()`, `body()` return `this` |
