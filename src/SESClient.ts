import * as AWS from '@aws-sdk/client-ses';
import Handlebars from 'handlebars';
import libmime from 'libmime';
import SESOptions from '~/interfaces/SESOptions';

/**
 * A simplified client for Amazon SES (Simple Email Service) with a fluent builder API.
 * Supports text and HTML emails, CC recipients, Handlebars template rendering, and multibyte sender names.
 *
 * @example
 * ```typescript
 * import {SESClient} from 'aws-sdk-extension';
 *
 * const client = new SESClient({
 *   region: 'ap-northeast-1',
 *   accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
 *   secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
 *   apiVersion: '2010-12-01',
 * });
 *
 * const messageId = await client
 *   .from('noreply@myapp.com', 'MyApp')
 *   .to(['user@example.com'])
 *   .subject('Your order has been shipped')
 *   .body('<p>Hi {{name}}, your order #{{orderId}} is on its way!</p>', {name: 'Tanaka', orderId: 'A-20250308'})
 *   .send('html');
 * ```
 */
export default class SESClient {
  /**
   * Internal AWS SES SDK client instance.
   * @type {AWS.SESClient}
   */
  #client: AWS.SESClient;

  /**
   * Sender email address (may include MIME-encoded display name).
   * @type {string}
   */
  #from?: string;

  /**
   * List of recipient (TO) email addresses.
   * @type {string[]}
   */
  #to?: string[];

  /**
   * List of CC email addresses.
   * @type {string[]}
   */
  #cc?: string[];

  /**
   * Email subject line.
   * @type {string}
   */
  #subject?: string;

  /**
   * Compiled email body content.
   * @type {string}
   */
  #body?: string;

  /**
   * Creates a new SESClient instance.
   *
   * @param {SESOptions} options Configuration options including AWS credentials, region, and API version.
   *
   * @example
   * ```typescript
   * const client = new SESClient({
   *   region: 'us-east-1',
   *   accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
   *   secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
   *   apiVersion: 'latest',
   * });
   * ```
   */
  constructor(options: SESOptions) {
    // Apply default values for optional properties.
    options = Object.assign({
      apiVersion: 'latest',
    }, options);

    // Initialize the AWS SES SDK client.
    this.#client = new AWS.SESClient({
      apiVersion: options.apiVersion,
      region: options.region,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  /**
   * Sets the sender email address.
   * When a display name is provided, it is MIME Q-encoded to support multibyte characters (e.g. Japanese).
   *
   * @param {string} from Sender email address.
   * @param {string} [name] Optional display name for the sender.
   * @return {SESClient} This instance for method chaining.
   *
   * @example
   * ```typescript
   * client.from('info@example.com');
   * client.from('info@example.com', 'Support Team');
   * ```
   */
  from(from: string, name?: string): SESClient {
    if (name) {
      // MIME Q-encode the display name to prevent garbled multibyte characters.
      name = libmime.encodeWord(name, 'Q');
      this.#from = `${name} <${from}>`;
    } else
      this.#from = from;
    return this;
  }

  /**
   * Sets the recipient (TO) email addresses.
   * Accepts a single address string or an array of addresses.
   *
   * @param {string | string[]} to One or more recipient email addresses.
   * @return {SESClient} This instance for method chaining.
   *
   * @example
   * ```typescript
   * client.to('user@example.com');
   * client.to(['user1@example.com', 'user2@example.com']);
   * ```
   */
  to(to: string|string[]): SESClient {
    if (typeof to === 'string')
      to = [to];
    this.#to = to;
    return this;
  }

  /**
   * Sets the CC (carbon copy) email addresses.
   * Accepts a single address string or an array of addresses.
   *
   * @param {string | string[]} cc One or more CC email addresses.
   * @return {SESClient} This instance for method chaining.
   *
   * @example
   * ```typescript
   * client.cc('manager@example.com');
   * client.cc(['manager@example.com', 'admin@example.com']);
   * ```
   */
  cc(cc: string|string[]): SESClient {
    if (typeof cc === 'string')
      cc = [cc];
    this.#cc = cc;
    return this;
  }

  /**
   * Sets the email subject line.
   *
   * @param {string} subject Email subject text.
   * @return {SESClient} This instance for method chaining.
   *
   * @example
   * ```typescript
   * client.subject('Order Confirmation');
   * ```
   */
  subject(subject: string): SESClient {
    this.#subject = subject;
    return this;
  }

  /**
   * Sets the email body content.
   * The body supports [Handlebars](https://handlebarsjs.com/) template syntax.
   * When `vars` is provided, the template is compiled and rendered with the given variables.
   *
   * @param {string} body Email body text or Handlebars template string.
   * @param {{ [key: string]: any }} [vars] Template variables to interpolate into the body.
   * @return {SESClient} This instance for method chaining.
   *
   * @example
   * ```typescript
   * // Plain text body.
   * client.body('Thank you for your purchase.');
   *
   * // Handlebars template with variables.
   * client.body('Hello, {{name}}! Your order #{{orderId}} has been confirmed.', {
   *   name: 'Alice',
   *   orderId: '12345',
   * });
   * ```
   */
  body(body: string, vars?: {[key: string]: any}): SESClient {
    if (vars != null && typeof vars === 'object')
      // Compile and render the Handlebars template with the provided variables.
      this.#body = Handlebars.compile(body)(vars);
    else
      this.#body = body;
    return this;
  }

  /**
   * Sends the email using Amazon SES.
   * All email fields (from, to, subject, body) must be set before calling this method.
   * After sending (regardless of success or failure), all fields are automatically reset.
   *
   * @param {'text' | 'html'} [type='text'] Email content type. `'text'` for plain text, `'html'` for HTML.
   * @return {Promise<string>} The unique message ID assigned by Amazon SES.
   * @throws {TypeError} Thrown when required fields (from, to, subject, body) are not set.
   *
   * @example
   * ```typescript
   * // Send a password reset email.
   * const messageId = await client
   *   .from('noreply@myapp.com')
   *   .to('user@example.com')
   *   .subject('Password Reset Request')
   *   .body('Your password reset code is {{code}}. This code expires in 10 minutes.', {code: '482956'})
   *   .send();
   *
   * // Send an HTML order confirmation.
   * const htmlMessageId = await client
   *   .from('noreply@myapp.com', 'MyApp Store')
   *   .to('user@example.com')
   *   .subject('Order Confirmed - #A-20250308')
   *   .body('<h1>Thank you, {{name}}!</h1><p>Your order has been confirmed.</p>', {name: 'Tanaka'})
   *   .send('html');
   * ```
   */
  async send(type: 'text'|'html' = 'text'): Promise<string> {
    try {
      // Validate that all required email fields are set.
      if (!this.#from || !this.#to || !this.#subject || !this.#body)
        throw new TypeError('The parameters from, to, subject, and body are required');

      // Build the SES SendEmail command parameters.
      const params: AWS.SendEmailCommandInput = {
        Destination: {
          ToAddresses: this.#to,
          CcAddresses: this.#cc,
        },
        Message: {
          Body: {
            [type === 'text' ? 'Text' : 'Html']: {Charset: 'UTF-8', Data: this.#body}
          },
          Subject: {
            Charset: 'UTF-8',
            Data: this.#subject
          }
        },
        Source: this.#from
      };

      // Send the email via the SES API.
      const res = await this.#client.send(new AWS.SendEmailCommand(params));
      return res.MessageId as string;
    } finally {
      // Reset all email fields to allow reuse of the client instance.
      this.#reset();
    }
  }

  /**
   * Resets all email fields (from, to, cc, subject, body) to `undefined`.
   * Called automatically after {@link send} completes.
   */
  #reset() {
    this.#from = undefined;
    this.#to = undefined;
    this.#cc = undefined;
    this.#subject = undefined;
    this.#body = undefined;
  }
}
