import ky from 'ky';

export abstract class RestClient {
  protected sdk: typeof ky;

  constructor(baseURL: string, apiKey?: string) {
    this.sdk = ky.create({
      prefixUrl: baseURL,
      headers: apiKey ? { 'x-api-key': apiKey } : {},
      retry: { limit: 2 },
      timeout: 15_000,
      hooks: {
        afterResponse: [
          (_req, _opt, res) =>
            console.log(`[${res.status}] ${res.url}`)
        ]
      }
    });
  }
}