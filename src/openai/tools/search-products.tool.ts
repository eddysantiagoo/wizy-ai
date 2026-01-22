import { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * Tool definition for searching products
 */
export const searchProductsTool: ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'searchProducts',
        description:
            'search for products in the catalog. Returns up to 2 relevant products based on the search query. Use this to find products by name, category, price color or description',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description:
                        'the search query to find products. Can include product names, categories (e.g., "Technology", "Clothing", "Home"), or descriptive terms',
                },
            },
            required: ['query'],
        },
    },
};
