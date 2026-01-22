import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const csvParser = require('csv-parser');

/**
 * dto in base of the products of the csv data
 */
export interface Product {
    displayTitle: string;
    embeddingText: string;
    url: string;
    imageUrl: string;
    productType: string;
    discount: number;
    price: string;
    variants: string;
    createDate: string;
}

@Injectable()
export class ProductsService implements OnModuleInit {
    private readonly logger = new Logger(ProductsService.name);
    private products: Product[] = [];

    /**
     * load csv data into memory at startup
     */
    async onModuleInit(): Promise<void> {
        await this.loadProducts();
        this.logger.log(`Loaded ${this.products.length} products from CSV`);
    }

    /**
     * reads and parses the CSV file, storing products in memory
     */
    private async loadProducts(): Promise<void> {
        // CSV is in src/data, use project root to locate it
        const csvPath = path.join(process.cwd(), 'src', 'data', 'data.csv');

        return new Promise((resolve, reject) => {
            const results: Product[] = [];

            fs.createReadStream(csvPath)
                .pipe(csvParser())
                .on('data', (row: Record<string, string>) => {
                    results.push({
                        displayTitle: row.displayTitle || '',
                        embeddingText: row.embeddingText || '',
                        url: row.url || '',
                        imageUrl: row.imageUrl || '',
                        productType: row.productType || '',
                        discount: parseInt(row.discount, 10) || 0,
                        price: row.price || '',
                        variants: row.variants || '',
                        createDate: row.createDate || '',
                    });
                })
                .on('end', () => {
                    this.products = results;
                    resolve();
                })
                .on('error', (error) => {
                    this.logger.error(`Failed to load CSV: ${error.message}`);
                    reject(error);
                });
        });
    }

    /**
     * search products using simple keyword matching
     * returns exactly 2 most relevant products
     *
     * @param query - search terms from the request
     * @returns array of 2 matching products (or fewer if not enough matches)
     */
    searchProducts(query: string): Product[] {
        const normalizedQuery = query.toLowerCase().trim();
        const searchTerms = normalizedQuery.split(/\s+/);

        // score each product based on keyword matches
        const scoredProducts = this.products.map((product) => {
            const searchableText = `${product.displayTitle} ${product.embeddingText} ${product.productType}`.toLowerCase();

            let score = 0;
            for (const term of searchTerms) {
                if (searchableText.includes(term)) {
                    score += 1;
                    // bonus points for title matches
                    if (product.displayTitle.toLowerCase().includes(term)) {
                        score += 2;
                    }
                }
            }

            return { product, score };
        });

        // sort by score descending and return top 2
        return scoredProducts
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map((item) => item.product);
    }

    /**
     * getall products (for debugging/testing)
     */
    getAllProducts(): Product[] {
        return this.products;
    }
}
