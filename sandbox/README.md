# Sandbox

A lightweight environment for manually testing `aws-sdk-extension` against real AWS APIs.

## Setup

1. Build the library (from the project root):
  ```sh
  npm run build
  ```

2. Install sandbox dependencies:
  ```sh
  cd sandbox
  npm install
  ```

3. Copy the sample env file and fill in your credentials:
  ```sh
  cp .env.sample .env
  ```

## Usage

CJS (`.js`) and ESM (`.mjs`) versions are provided for each test script.

```sh
# CJS
node test-rekognition.js
node test-ses.js

# ESM
node test-rekognition.mjs
node test-ses.mjs
```

## Adding Test Scripts

The library resolves to the local build output (`../dist/`).

```js
// CJS
const {RekognitionClient} = require('aws-sdk-extension');
```

```js
// ESM
import {RekognitionClient} from 'aws-sdk-extension';
```
