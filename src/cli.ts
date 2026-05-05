#!/usr/bin/env node

import { Divisas } from './index';
import { Country } from './enums/Country';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
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

  const client = new Divisas();
  const command = args[0];

  try {
    if (command === 'countries') {
      const list = await client.countries().getAvailable();
      console.log('Available countries:', list.join(', '));
    } else if (command === 'today') {
      const countryCode = args[1];
      const currencyCode = args[2];

      if (!countryCode) {
        console.error('Error: Country code is required for "today" command.');
        process.exit(1);
      }

      const builder = client.query().forCountry(countryCode as Country);
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
