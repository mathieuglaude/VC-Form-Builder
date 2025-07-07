/**
 * Typed Fetch Helper for React Query
 * Provides runtime validation with Zod schemas
 */

import { z } from 'zod';

export class TypedFetchError extends Error {
  constructor(
    message: string,
    public response: Response,
    public validationError?: z.ZodError
  ) {
    super(message);
    this.name = 'TypedFetchError';
  }
}

/**
 * Type-safe fetch wrapper with runtime validation
 * Throws TypedFetchError on HTTP errors or validation failures
 */
export async function typedFetch<T>(
  url: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  let response: Response;
  
  try {
    response = await fetch(url);
  } catch (error) {
    throw new TypedFetchError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      new Response(null, { status: 0, statusText: 'Network Error' })
    );
  }

  if (!response.ok) {
    throw new TypedFetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    throw new TypedFetchError(
      `Invalid JSON response: ${error instanceof Error ? error.message : 'Parse error'}`,
      response
    );
  }

  try {
    return schema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[typedFetch] Schema validation failed:', {
        url,
        errors: error.errors,
        receivedData: json
      });
      
      throw new TypedFetchError(
        `Response validation failed for ${url}: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        response,
        error
      );
    }
    throw error;
  }
}

/**
 * Typed fetch for POST/PUT requests with body
 */
export async function typedFetchWithBody<TResponse, TBody = unknown>(
  url: string,
  responseSchema: z.ZodSchema<TResponse>,
  options: {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: TBody;
    headers?: Record<string, string>;
  }
): Promise<TResponse> {
  const { method, body, headers = {} } = options;
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  let response: Response;
  
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    throw new TypedFetchError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      new Response(null, { status: 0, statusText: 'Network Error' })
    );
  }

  if (!response.ok) {
    throw new TypedFetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    throw new TypedFetchError(
      `Invalid JSON response: ${error instanceof Error ? error.message : 'Parse error'}`,
      response
    );
  }

  try {
    return responseSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[typedFetchWithBody] Schema validation failed:', {
        url,
        method,
        errors: error.errors,
        receivedData: json
      });
      
      throw new TypedFetchError(
        `Response validation failed for ${method} ${url}: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        response,
        error
      );
    }
    throw error;
  }
}