require('dotenv').config();
const {SESClient} = require('aws-sdk-extension');

async function main() {
  const client = new SESClient({
    apiVersion: process.env.SES_API_VERSION,
    region: process.env.SES_REGION,
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  });

  try {
    const messageId = await client
      .from(process.env.SES_FROM, 'Sandbox Test')
      .to(process.env.SES_TO)
      .subject('Sandbox test email')
      .body('Hello from sandbox! name={{name}}', {name: 'Tester'})
      .send();
    console.log('OK - Message ID:', messageId);
  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('Stack:', err.stack);
  }
}

main();
