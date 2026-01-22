import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * cached exchange rates structure.
 */
interface ExchangeRatesCache {
    rates: Record<string, number>;
    timestamp: number;
}

@Injectable()
export class CurrencyService {
    private readonly logger = new Logger(CurrencyService.name);
    private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
    private cache: ExchangeRatesCache | null = null;
    private readonly appId: string;

    constructor(private readonly configService: ConfigService) {
        this.appId = this.configService.get<string>('exchangeRates.appId') || '';
    }

    /**
     * fetch exchange rates from Open Exchange Rates API
     * rates are cached for 1 hour to minimize API calls
     */
    private async fetchRates(): Promise<Record<string, number>> {
        // return cached rates if still valid
        if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL_MS) {
            this.logger.debug('using cached exchange rates');
            return this.cache.rates;
        }

        try {
            const url = `https://openexchangerates.org/api/latest.json?app_id=${this.appId}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = (await response.json()) as { rates: Record<string, number> };

            // Cache the rates
            this.cache = {
                rates: data.rates,
                timestamp: Date.now(),
            };

            this.logger.log('fetched fresh exchange rates from API');
            return data.rates;
        } catch (error) {
            this.logger.error(`failed to fetch exchange rates: ${(error as Error).message}`);

            // return cached rates if available, even if stale
            if (this.cache) {
                this.logger.warn('using stale cached rates due to API error');
                return this.cache.rates;
            }

            throw new Error('Unable to fetch exchange rates and no cached data available');
        }
    }

    /**
     * Convert an amount from one currency to another
     *
     * @param amount - The amount to convert
     * @param from - Source currency code (e.g., "USD")
     * @param to - Target currency code (e.g., "EUR")
     * @returns The converted amount rounded to 2 decimal places
     */
    async convertCurrency(amount: number, from: string, to: string): Promise<number> {
        const rates = await this.fetchRates();

        const fromUpper = from.toUpperCase();
        const toUpper = to.toUpperCase();

        // open exchange rates uses USD as base
        const fromRate = fromUpper === 'USD' ? 1 : rates[fromUpper];
        const toRate = toUpper === 'USD' ? 1 : rates[toUpper];

        if (!fromRate || !toRate) {
            const missing = !fromRate ? fromUpper : toUpper;
            throw new Error(`Unknown currency code: ${missing}`);
        }

        // convert: amount in FROM -> USD -> TO
        const amountInUsd = amount / fromRate;
        const result = amountInUsd * toRate;

        return Math.round(result * 100) / 100;
    }

    /**
     * get list of supported currencies
     */
    async getSupportedCurrencies(): Promise<string[]> {
        const rates = await this.fetchRates();
        return ['USD', ...Object.keys(rates)];
    }
}
