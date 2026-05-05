#!/usr/bin/env node
"use strict";

// src/errors/DivisasError.ts
var DivisasError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "DivisasError";
  }
  status;
};

// src/resources/Rates.ts
var Rates = class {
  constructor(client) {
    this.client = client;
  }
  client;
  getCountryCode(country) {
    return country;
  }
  getCurrencyCode(currency) {
    return currency;
  }
  async getToday(country) {
    const code = this.getCountryCode(country);
    return this.client.request(`v1/${code}/rates`);
  }
  async getByCurrency(country, currency) {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request(`v1/${code}/rates/${currCode}`);
  }
  async getHistory(country, from, to, currency = "USD") {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request(`v1/${code}/rates/history`, {
      from,
      to,
      currency: currCode
    });
  }
  async getStats(country, currency = "USD", period = "30d") {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request(`v1/${code}/rates/stats`, {
      currency: currCode,
      period
    });
  }
  async convert(country, from, to, amount) {
    const code = this.getCountryCode(country);
    const fromCode = this.getCurrencyCode(from);
    const toCode = this.getCurrencyCode(to);
    return this.client.request(`v1/${code}/rates/convert`, {
      from: fromCode,
      to: toCode,
      amount
    });
  }
  async getForecast(country, days = 30, currency = "USD") {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request(`v1/${code}/rates/forecast`, {
      days,
      currency: currCode
    });
  }
  async getPercentile(country, currency = "USD", period = "1y") {
    const code = this.getCountryCode(country);
    const currCode = this.getCurrencyCode(currency);
    return this.client.request(`v1/${code}/rates/percentile`, {
      currency: currCode,
      period
    });
  }
};

// src/resources/Countries.ts
var Countries = class {
  constructor(client) {
    this.client = client;
  }
  client;
  async getAvailable() {
    const response = await this.client.request("v1/countries");
    return response.data || [];
  }
};

// src/builder/RatesBuilder.ts
var RatesBuilder = class {
  constructor(ratesResource) {
    this.ratesResource = ratesResource;
  }
  ratesResource;
  country;
  currency;
  forCountry(country) {
    this.country = country;
    return this;
  }
  forCurrency(currency) {
    this.currency = currency;
    return this;
  }
  getCountry() {
    if (!this.country) {
      throw new DivisasError("Country is required. Call forCountry() first.");
    }
    return this.country;
  }
  async getToday() {
    const country = this.getCountry();
    if (this.currency) {
      return this.ratesResource.getByCurrency(country, this.currency);
    }
    return this.ratesResource.getToday(country);
  }
  async getHistory(from, to) {
    return this.ratesResource.getHistory(this.getCountry(), from, to, this.currency || "USD");
  }
  async getStats(period = "30d") {
    return this.ratesResource.getStats(this.getCountry(), this.currency || "USD", period);
  }
  async convert(to, amount) {
    return this.ratesResource.convert(this.getCountry(), this.currency || "USD", to, amount);
  }
  async getForecast(days = 7) {
    return this.ratesResource.getForecast(this.getCountry(), days, this.currency || "USD");
  }
  async getPercentile(period = "1y") {
    return this.ratesResource.getPercentile(this.getCountry(), this.currency || "USD", period);
  }
};

// src/Client.ts
var Client = class {
  apiKey;
  baseUrl;
  cacheTtl;
  cache = /* @__PURE__ */ new Map();
  constructor(options = {}) {
    let defaultApiKey = void 0;
    try {
      if (typeof process !== "undefined" && process.env && process.env.DIVISAS_API_KEY) {
        defaultApiKey = process.env.DIVISAS_API_KEY;
      } else if (typeof globalThis !== "undefined" && globalThis.Deno) {
        defaultApiKey = globalThis.Deno.env.get("DIVISAS_API_KEY");
      }
    } catch (e) {
    }
    this.apiKey = options.apiKey || defaultApiKey;
    this.baseUrl = options.baseUrl || "https://api.divisas.lat";
    this.cacheTtl = options.cacheTtl !== void 0 ? options.cacheTtl : 3600;
  }
  async request(endpoint, query = {}) {
    const url = new URL(endpoint.startsWith("/") ? endpoint : `/${endpoint}`, this.baseUrl);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    const urlString = url.toString();
    if (this.cacheTtl > 0) {
      const cached = this.cache.get(urlString);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
    }
    const headers = {
      "Accept": "application/json",
      "User-Agent": "DivisasLat-NodeSDK/1.0"
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    try {
      const response = await fetch(urlString, {
        method: "GET",
        headers
      });
      if (!response.ok) {
        throw new DivisasError(`API Error: ${response.statusText}`, response.status);
      }
      const data = await response.json();
      if (this.cacheTtl > 0) {
        this.cache.set(urlString, {
          data,
          expiresAt: Date.now() + this.cacheTtl * 1e3
        });
        if (this.cache.size > 1e3) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) this.cache.delete(firstKey);
        }
      }
      return data;
    } catch (error) {
      if (error instanceof DivisasError) {
        throw error;
      }
      throw new DivisasError(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  countries() {
    return new Countries(this);
  }
  rates() {
    return new Rates(this);
  }
  query() {
    return new RatesBuilder(this.rates());
  }
};

// src/cli.ts
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Divisas.lat CLI
Usage: divisas [command] [options]

Commands:
  today <country> [currency]     Get today's rates for a country
  countries                      List available countries

Examples:
  divisas today GT
  divisas today MX USD
  divisas countries
    `);
    process.exit(0);
  }
  const client = new Client();
  const command = args[0];
  try {
    if (command === "countries") {
      const list = await client.countries().getAvailable();
      console.log("Available countries:", list.join(", "));
    } else if (command === "today") {
      const countryCode = args[1];
      const currencyCode = args[2];
      if (!countryCode) {
        console.error('Error: Country code is required for "today" command.');
        process.exit(1);
      }
      const builder = client.query().forCountry(countryCode);
      if (currencyCode) {
        builder.forCurrency(currencyCode);
      }
      const response = await builder.getToday();
      console.log(JSON.stringify(response, null, 2));
    } else {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
main();
