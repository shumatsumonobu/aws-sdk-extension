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
    #private;
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
    constructor(options: SESOptions);
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
    from(from: string, name?: string): SESClient;
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
    to(to: string | string[]): SESClient;
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
    cc(cc: string | string[]): SESClient;
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
    subject(subject: string): SESClient;
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
    body(body: string, vars?: {
        [key: string]: any;
    }): SESClient;
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
    send(type?: 'text' | 'html'): Promise<string>;
}
