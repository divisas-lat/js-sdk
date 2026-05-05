import { DivisasError } from '../errors/DivisasError';
import type { Rates } from '../resources/Rates';
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

export class RatesBuilder {
  private country?: Country | string;
  private currency?: Currency | string;

  constructor(private ratesResource: Rates) {}

  public forCountry(country: Country | string): this {
    this.country = country;
    return this;
  }

  public forCurrency(currency: Currency | string): this {
    this.currency = currency;
    return this;
  }

  private getCountry(): Country | string {
    if (!this.country) {
      throw new DivisasError('Country is required. Call forCountry() first.');
    }
    return this.country;
  }

  public async getToday(): Promise<TodayRatesResponse> {
    const country = this.getCountry();
    if (this.currency) {
      return this.ratesResource.getByCurrency(country, this.currency);
    }
    return this.ratesResource.getToday(country);
  }

  public async getHistory(from: string, to: string): Promise<HistoricalRateResponse> {
    return this.ratesResource.getHistory(this.getCountry(), from, to, this.currency || 'USD');
  }

  public async getStats(period: string = '30d'): Promise<StatsResponse> {
    return this.ratesResource.getStats(this.getCountry(), this.currency || 'USD', period);
  }

  public async convert(to: Currency | string, amount: number): Promise<ConversionResponse> {
    return this.ratesResource.convert(this.getCountry(), this.currency || 'USD', to, amount);
  }

  public async getForecast(days: number = 7): Promise<ForecastResponse> {
    return this.ratesResource.getForecast(this.getCountry(), days, this.currency || 'USD');
  }

  public async getPercentile(period: string = '1y'): Promise<PercentileResponse> {
    return this.ratesResource.getPercentile(this.getCountry(), this.currency || 'USD', period);
  }
}
