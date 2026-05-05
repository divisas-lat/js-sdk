import { DivisasError } from './errors/DivisasError';
import { Rates } from './resources/Rates';
import { Countries } from './resources/Countries';
import { RatesBuilder } from './builder/RatesBuilder';

export interface ClientOptions {
  apiKey?: string;
  baseUrl?: string;
  cacheTtl?: number; // Time to live in seconds (default: 3600, set to 0 to disable)
}

interface CacheEntry {
  data: any;
  expiresAt: number;
}

export class Client {
  public readonly apiKey?: string;
  public readonly baseUrl: string;
  public readonly cacheTtl: number;
  private cache: Map<string, CacheEntry> = new Map();

  constructor(options: ClientOptions = {}) {
    let defaultApiKey: string | undefined = undefined;
    try {
      if (typeof process !== 'undefined' && process.env && process.env.DIVISAS_API_KEY) {
        defaultApiKey = process.env.DIVISAS_API_KEY;
      } else if (typeof (globalThis as any) !== 'undefined' && (globalThis as any).Deno) {
        defaultApiKey = (globalThis as any).Deno.env.get('DIVISAS_API_KEY');
      }
    } catch (e) {
      // Ignore strict bundler errors
    }

    this.apiKey = options.apiKey || defaultApiKey;
    this.baseUrl = options.baseUrl || 'https://api.divisas.lat';
    this.cacheTtl = options.cacheTtl !== undefined ? options.cacheTtl : 3600;
  }

  public async request<T>(endpoint: string, query: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, this.baseUrl);
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const urlString = url.toString();

    if (this.cacheTtl > 0) {
      const cached = this.cache.get(urlString);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data as T;
      }
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'DivisasLat-NodeSDK/1.0',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(urlString, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new DivisasError(`API Error: ${response.statusText}`, response.status);
      }

      const data = await response.json();

      if (this.cacheTtl > 0) {
        this.cache.set(urlString, {
          data,
          expiresAt: Date.now() + this.cacheTtl * 1000,
        });

        // Simple cleanup for memory leaks
        if (this.cache.size > 1000) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) this.cache.delete(firstKey);
        }
      }

      return data as T;
    } catch (error) {
      if (error instanceof DivisasError) {
        throw error;
      }
      throw new DivisasError(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public countries(): Countries {
    return new Countries(this);
  }

  public rates(): Rates {
    return new Rates(this);
  }

  public query(): RatesBuilder {
    return new RatesBuilder(this.rates());
  }
}
