# @divisas-lat/js-sdk

El SDK oficial de Node.js y TypeScript para interactuar con la API de [Divisas.lat](https://divisas.lat). Este SDK provee una manera segura, tipada e isomorfa (funciona en el navegador, Node.js, Deno, Bun, React, Astro, Next.js, Angular, etc) de consultar los tipos de cambio de divisas en Latinoamérica.

## Características

- **Tipado Fuerte**: Construido con TypeScript para un autocompletado perfecto.
- **Isomorfo**: Utiliza `fetch` nativamente. Cero dependencias adicionales como Axios.
- **Caché en Memoria**: Para evitar consumir tu cuota de API, cuenta con un caché simple configurable.
- **API Fluida**: Syntax limpia `divisas.query().forCountry('GT').getToday()`.

## Instalación

```bash
npm install @divisas-lat/js-sdk
```

## Uso Básico

```typescript
import { Divisas, Country, Currency } from '@divisas-lat/js-sdk';

const client = new Divisas({
  apiKey: 'tu-api-key', // Opcional, o usar process.env.DIVISAS_API_KEY
  cacheTtl: 3600 // Caché en memoria de 1 hora
});

async function run() {
  // 1. Obtener tasas de hoy para Guatemala
  const rates = await client.query()
    .forCountry(Country.GUATEMALA)
    .getToday();
  
  console.log(rates);

  // 2. Convertir USD a Quetzales
  const conversion = await client.query()
    .forCountry('GT') // También puedes usar el string ISO
    .convert(Currency.GTQ, 100);

  console.log(conversion.result);
}

run();
```

## Uso Avanzado (Históricos y Estadísticas)

```typescript
// Histórico de 7 días
const history = await client.query()
  .forCountry(Country.MEXICO)
  .forCurrency(Currency.USD)
  .getHistory('2023-01-01', '2023-01-07');

// Estadísticas de 30 días
const stats = await client.query()
  .forCountry(Country.COSTA_RICA)
  .getStats('30d');

// Proyección de 10 días (Forecast Lineal)
const forecast = await client.query()
  .forCountry(Country.GUATEMALA)
  .getForecast(10);
```

## CLI

El paquete incluye una utilidad para terminal para consultar divisas rápido.
Si instalas el paquete globalmente (`npm i -g @divisas-lat/js-sdk`), puedes usar el comando:

```bash
divisas today GT USD
```
O usando `npx`:
```bash
npx @divisas-lat/js-sdk today GT USD
```
