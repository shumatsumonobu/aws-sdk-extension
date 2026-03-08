require('dotenv').config();
const path = require('path');
const {RekognitionClient} = require('aws-sdk-extension');

const fixturesDir = path.join(__dirname, 'fixtures');

async function main() {
  const client = new RekognitionClient({
    accessKeyId: process.env.REKOGNITION_ACCESS_KEY_ID,
    secretAccessKey: process.env.REKOGNITION_SECRET_ACCESS_KEY,
    region: process.env.REKOGNITION_REGION,
  });

  try {
    // Detect faces.
    const faces = await client.detectFaces(`${fixturesDir}/single-face.jpg`);
    console.log('detectFaces:', faces.length, 'face(s) found');

    // Compare faces.
    const similarity = await client.compareFaces(
      `${fixturesDir}/person-a-photo1.jpg`,
      `${fixturesDir}/person-a-photo2.jpg`,
    );
    console.log('compareFaces: similarity =', similarity);

    console.log('OK');
  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('Stack:', err.stack);
  }
}

main();
