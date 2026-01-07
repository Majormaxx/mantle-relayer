/**
 * HTTP Client
 * Robust HTTP client with retry, timeout, and validation.
 */

import { z } from 'zod';
import { NetworkError, ValidationError } from '../errors/index.js';
import { DEFAULTS } from '../utils/constants.js';

/**
 * HTTP client configuration.
 */
export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryBaseDelayMs?: number;
}

/**
 * Request options.
 */
export interface RequestOptions<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown | undefined;
  responseSchema?: z.ZodSchema<T> | undefined;
}

/**
 * HTTP client with retry and validation.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryBaseDelayMs: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout ?? DEFAULTS.httpTimeoutMs;
    this.retryAttempts = config.retryAttempts ?? DEFAULTS.retryAttempts;
    this.retryBaseDelayMs = config.retryBaseDelayMs ?? DEFAULTS.retryBaseDelayMs;
  }

  /**
   * Make an HTTP request with retry and validation.
   */
  async request<T>(options: RequestOptions<T>): Promise<T> {
    const url = `${this.baseUrl}${options.path}`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.makeRequest(url, options);
        return this.handleResponse(response, options.responseSchema);
      } catch (error) {
        lastError = error as Error;

        // Don't retry non-retryable errors
        if (error instanceof NetworkError && !error.retryable) {
          throw error;
        }
        if (error instanceof ValidationError) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.retryAttempts) {
          const delay = this.retryBaseDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError ?? new NetworkError('Request failed after retries');
  }

  /**
   * Convenience method for GET requests.
   */
  async get<T>(path: string, responseSchema?: z.ZodSchema<T>): Promise<T> {
    return this.request<T>({ method: 'GET', path, responseSchema: responseSchema as z.ZodSchema<T> | undefined });
  }

  /**
   * Convenience method for POST requests.
   */
  async post<T>(
    path: string,
    body: unknown,
    responseSchema?: z.ZodSchema<T>
  ): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, responseSchema: responseSchema as z.ZodSchema<T> | undefined });
  }

  /**
   * Make a single HTTP request.
   */
  private async makeRequest(
    url: string,
    options: RequestOptions<unknown>
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchOptions: RequestInit = {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: controller.signal,
      };
      if (options.body !== undefined) {
        fetchOptions.body = JSON.stringify(options.body);
      }
      const response = await fetch(url, fetchOptions);

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(
          `Request timeout after ${this.timeout}ms`,
          undefined,
          true
        );
      }
      throw new NetworkError(
        `Network request failed: ${String(error)}`,
        undefined,
        true
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Handle response and validate with schema.
   */
  private async handleResponse<T>(
    response: Response,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    // Handle HTTP errors
    if (!response.ok) {
      const retryable = response.status >= 500 || response.status === 429;
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorBody = await response.json() as Record<string, unknown>;
        const errorObj = errorBody['error'] as Record<string, unknown> | undefined;
        if (errorObj && typeof errorObj['message'] === 'string') {
          errorMessage = errorObj['message'];
        }
      } catch {
        // Ignore JSON parse errors for error responses
      }

      throw new NetworkError(errorMessage, response.status, retryable);
    }

    // Parse response body
    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON response from server');
    }

    // Validate with schema if provided
    if (schema) {
      const result = schema.safeParse(body);
      if (!result.success) {
        throw new ValidationError('Response validation failed', 
          result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
      }
      return result.data;
    }

    return body as T;
  }

  /**
   * Sleep for a given number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
