const {SESClient} = require('../dist/build.common');
const loadEnv = require('./support/loadEnv');

let client;

beforeAll(() => {
  loadEnv();
  client = new SESClient({
    apiVersion: process.env.SES_API_VERSION,
    region: process.env.SES_REGION,
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  });
});

// ---------------------------------------------------------------------------
// send()
// ---------------------------------------------------------------------------
describe('send()', () => {
  test('sends a plain text email and returns a message ID', async () => {
    const messageId = await client
      .from(process.env.SES_FROM, 'Test Sender')
      .to(process.env.SES_TO)
      .subject('Plain text test')
      .body('This is a plain text test email.')
      .send();
    expect(typeof messageId).toBe('string');
    expect(messageId.length).toBeGreaterThan(0);
  });

  test('sends an HTML email and returns a message ID', async () => {
    const messageId = await client
      .from(process.env.SES_FROM)
      .to(process.env.SES_TO)
      .subject('HTML test')
      .body('<h1>Test</h1><p>This is an HTML test email.</p>')
      .send('html');
    expect(typeof messageId).toBe('string');
    expect(messageId.length).toBeGreaterThan(0);
  });

  test('sends an email with Handlebars template variables in the body', async () => {
    const messageId = await client
      .from(process.env.SES_FROM)
      .to(process.env.SES_TO)
      .subject('Template test')
      .body('Hello, {{name}}! Your code is {{code}}.', {name: 'Tester', code: 'ABC-123'})
      .send();
    expect(typeof messageId).toBe('string');
    expect(messageId.length).toBeGreaterThan(0);
  });

  test('supports CC recipients', async () => {
    const messageId = await client
      .from(process.env.SES_FROM)
      .to(process.env.SES_TO)
      .cc(process.env.SES_TO)
      .subject('CC test')
      .body('This email includes a CC recipient.')
      .send();
    expect(typeof messageId).toBe('string');
    expect(messageId.length).toBeGreaterThan(0);
  });

  test('accepts an array of recipient addresses', async () => {
    const messageId = await client
      .from(process.env.SES_FROM)
      .to([process.env.SES_TO])
      .subject('Array recipients test')
      .body('This email was sent to an array of addresses.')
      .send();
    expect(typeof messageId).toBe('string');
    expect(messageId.length).toBeGreaterThan(0);
  });

  test('throws TypeError when required fields are missing', async () => {
    // Attempt to send without setting any fields.
    await expect(client.send()).rejects.toThrow(TypeError);
  });

  test('resets all fields after sending, requiring re-configuration for the next email', async () => {
    // Send one email to trigger the internal reset.
    await client
      .from(process.env.SES_FROM)
      .to(process.env.SES_TO)
      .subject('Reset test')
      .body('Testing field reset after send.')
      .send();

    // The next send() without re-setting fields should fail.
    await expect(client.send()).rejects.toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// Fluent API (method chaining)
// ---------------------------------------------------------------------------
describe('Fluent API', () => {
  // Flush any leftover state after each chaining test to prevent pollution.
  afterEach(async () => {
    try {
      await client.send();
    } catch {
      // Expected to fail; this just triggers the internal reset.
    }
  });

  test('from() returns the client instance for chaining', () => {
    const result = client.from(process.env.SES_FROM);
    expect(result).toBe(client);
  });

  test('to() returns the client instance for chaining', () => {
    const result = client.to(process.env.SES_TO);
    expect(result).toBe(client);
  });

  test('cc() returns the client instance for chaining', () => {
    const result = client.cc(process.env.SES_TO);
    expect(result).toBe(client);
  });

  test('subject() returns the client instance for chaining', () => {
    const result = client.subject('test');
    expect(result).toBe(client);
  });

  test('body() returns the client instance for chaining', () => {
    const result = client.body('test');
    expect(result).toBe(client);
  });
});
