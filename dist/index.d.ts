declare enum Country {
    GUATEMALA = "GT",
    MEXICO = "MX",
    COSTA_RICA = "CR",
    EUROZONE = "EU",
    CANADA = "CA",
    AUSTRALIA = "AU",
    NORWAY = "NO"
}

declare enum Currency {
    USD = "USD",
    EUR = "EUR",
    GTQ = "GTQ",
    MXN = "MXN",
    CRC = "CRC",
    CAD = "CAD",
    AUD = "AUD",
    NOK = "NOK",
    GBP = "GBP",
    JPY = "JPY",
    CHF = "CHF"
}

interface CurrencyRate {
    currency_code: string;
    buy: number;
    sell: number;
    currency_name?: string | null;
    date?: string;
}
interface TodayRatesResponse {
    country: string;
    base_currency: string;
    date: string;
    source: string;
    cached: boolean;
    rates?: CurrencyRate[];
    rate?: CurrencyRate;
}
interface HistoricalRateResponse {
    country: string;
    currency_code: string;
    source: string;
    total: number;
    history: CurrencyRate[];
}
interface ConversionResponse {
    from: {
        currency: string;
        amount: number;
    };
    to: {
        currency: string;
        amount: number;
    };
    amount: number;
    result: number;
    effective_rate: number;
    via: string;
    date: string;
    note: string;
}
interface StatsResponse {
    country: string;
    currency_code: string;
    currency_name: string;
    period: string;
    current: {
        buy: number;
        sell: number;
        date: string;
    };
    stats: {
        min_buy: number;
        max_buy: number;
        avg_buy: number;
        min_sell: number;
        max_sell: number;
        avg_sell: number;
        volatility: number;
    };
    data_points: number;
}
interface ForecastResponse {
    country: string;
    currency_code: string;
    model: string;
    based_on_days: number;
    forecast: Array<{
        date: string;
        buy: number;
        sell: number;
    }>;
}
interface PercentileResponse {
    country: string;
    currency_code: string;
    currency_name: string;
    today: {
        date: string;
        buy: number;
        sell: number;
    };
    percentile: number;
    period: string;
    signal: string;
    range: {
        min_buy: number;
        max_buy: number;
        min_sell: number;
        max_sell: number;
    };
}

declare class Rates {
    private client;
    constructor(client: Client);
    private getCountryCode;
    private getCurrencyCode;
    getToday(country: Country | string): Promise<TodayRatesResponse>;
    getByCurrency(country: Country | string, currency: Currency | string): Promise<TodayRatesResponse>;
    getHistory(country: Country | string, from: string, to: string, currency?: Currency | string): Promise<HistoricalRateResponse>;
    getStats(country: Country | string, currency?: Currency | string, period?: string): Promise<StatsResponse>;
    convert(country: Country | string, from: Currency | string, to: Currency | string, amount: number): Promise<ConversionResponse>;
    getForecast(country: Country | string, days?: number, currency?: Currency | string): Promise<ForecastResponse>;
    getPercentile(country: Country | string, currency?: Currency | string, period?: string): Promise<PercentileResponse>;
}

declare class Countries {
    private client;
    constructor(client: Client);
    getAvailable(): Promise<string[]>;
}

declare class RatesBuilder {
    private ratesResource;
    private country?;
    private currency?;
    constructor(ratesResource: Rates);
    forCountry(country: Country | string): this;
    forCurrency(currency: Currency | string): this;
    private getCountry;
    getToday(): Promise<TodayRatesResponse>;
    getHistory(from: string, to: string): Promise<HistoricalRateResponse>;
    getStats(period?: string): Promise<StatsResponse>;
    convert(to: Currency | string, amount: number): Promise<ConversionResponse>;
    getForecast(days?: number): Promise<ForecastResponse>;
    getPercentile(period?: string): Promise<PercentileResponse>;
}

interface ClientOptions {
    apiKey?: string;
    baseUrl?: string;
    cacheTtl?: number;
}
declare class Client {
    readonly apiKey?: string;
    readonly baseUrl: string;
    readonly cacheTtl: number;
    private cache;
    constructor(options?: ClientOptions);
    request<T>(endpoint: string, query?: Record<string, string | number | undefined>): Promise<T>;
    countries(): Countries;
    rates(): Rates;
    query(): RatesBuilder;
}

declare class DivisasError extends Error {
    readonly status?: number | undefined;
    constructor(message: string, status?: number | undefined);
}

export { type ClientOptions, type ConversionResponse, Country, Currency, type CurrencyRate, Client as Divisas, DivisasError, type ForecastResponse, type HistoricalRateResponse, type PercentileResponse, type StatsResponse, type TodayRatesResponse };
