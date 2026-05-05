import type { Client } from '../Client';
import type { Country } from '../enums/Country';
import type { Currency } from '../enums/Currency';
import type {
  TodayRatesResponse,
  HistoricalRateResponse,
  StatsResponse,
  ConversionResponse,
  ForecastResponse,
  PercentileResponse
} from '../types';

export class Rates {
  constructor(private client: Client) {}

  private getCountryCode(country: Country | string): string {
    return country;
  }

  private getCurrencyCode(currency: Currency | string): string {
    return currency;
  }

  public async getToday(country: Country | string): Promise<TodayRatesResponse> {
    const code = this.getCountryCode(country);
    return this.client.request<TodayRatesResponse>(`v1/${code}/rates`);
  }

  public async getByCurrency(country: Country | string, currency: Currency | string): Promise<TodayRatesResponse> {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request<TodayRatesResponse>(`v1/${code}/rates/${currCode}`);
  }

  public async getHistory(
    country: Country | string,
    from: string,
    to: string,
    currency: Currency | string = 'USD'
  ): Promise<HistoricalRateResponse> {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request<HistoricalRateResponse>(`v1/${code}/rates/history`, {
      from,
      to,
      currency: currCode,
    });
  }

  public async getStats(
    country: Country | string,
    currency: Currency | string = 'USD',
    period: string = '30d'
  ): Promise<StatsResponse> {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request<StatsResponse>(`v1/${code}/rates/stats`, {
      currency: currCode,
      period,
    });
  }

  public async convert(
    country: Country | string,
    from: Currency | string,
    to: Currency | string,
    amount: number
  ): Promise<ConversionResponse> {
    const code = this.getCountryCode(country);
    const fromCode = this.getCurrencyCode(from);
    const toCode = this.getCurrencyCode(to);
    return this.client.request<ConversionResponse>(`v1/${code}/rates/convert`, {
      from: fromCode,
      to: toCode,
      amount,
    });
  }

  public async getForecast(
    country: Country | string,
    days: number = 30,
    currency: Currency | string = 'USD'
  ): Promise<ForecastResponse> {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request<ForecastResponse>(`v1/${code}/rates/forecast`, {
      days,
      currency: currCode,
    });
  }

  public async getPercentile(
    country: Country | string,
    currency: Currency | string = 'USD',
    period: string = '1y'
  ): Promise<PercentileResponse> {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request<PercentileResponse>(`v1/${code}/rates/percentile`, {
      currency: currCode,
      period,
    });
  }
}
