import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Divisas, Country, Currency } from '../src';

describe('Divisas SDK', () => {
  let client: Divisas;

  beforeEach(() => {
    // We disable the real cache for tests to avoid state leakage
    client = new Divisas({ cacheTtl: 0 });
    
    // Mock the global fetch
    global.fetch = vi.fn();
  });

  it('should format getToday correctly', async () => {
    const mockData = {
      country: 'GT',
      base_currency: 'GTQ',
      date: '2023-01-01',
      source: 'test',
      cached: false,
      rates: [
        { currency_code: 'USD', buy: 7.7, sell: 7.8 }
      ]
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const response = await client.query().forCountry(Country.GUATEMALA).getToday();
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.divisas.lat/v1/GT/rates',
      expect.anything()
    );
    expect(response.country).toBe('GT');
    expect(response.rates?.[0]?.buy).toBe(7.7);
  });

  it('should format conversion correctly', async () => {
    const mockData = {
      from: { currency: 'USD', amount: 100 },
      to: { currency: 'GTQ', amount: 780 },
      amount: 100,
      result: 780,
      effective_rate: 7.8,
      via: 'GTQ',
      date: '2023-01-01',
      note: ''
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const response = await client.query()
      .forCountry('GT')
      .forCurrency(Currency.USD)
      .convert(Currency.GTQ, 100);

    // Verify correct URL mapping
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.divisas.lat/v1/GT/rates/convert?from=USD&to=GTQ&amount=100',
      expect.anything()
    );
    expect(response.result).toBe(780);
  });
});
