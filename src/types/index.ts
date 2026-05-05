export interface CurrencyRate {
  currency_code: string;
  buy: number;
  sell: number;
  currency_name?: string | null;
  date?: string;
}

export interface TodayRatesResponse {
  country: string;
  base_currency: string;
  date: string;
  source: string;
  cached: boolean;
  rates?: CurrencyRate[];
  rate?: CurrencyRate;
}

export interface HistoricalRateResponse {
  country: string;
  currency_code: string;
  source: string;
  total: number;
  history: CurrencyRate[];
}

export interface ConversionResponse {
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

export interface StatsResponse {
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

export interface ForecastResponse {
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

export interface PercentileResponse {
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
