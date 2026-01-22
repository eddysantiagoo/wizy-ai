import { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * Tool definition for currency conversion
 */
export const convertCurrenciesTool: ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'convertCurrencies',
        description:
            'convert an amount from one currency to another using real-time exchange rates. Use this when users ask about prices in different currencies',
        parameters: {
            type: 'object',
            properties: {
                amount: {
                    type: 'number',
                    description: 'the monetary amount to convert',
                },
                from: {
                    type: 'string',
                    description:
                        'the source currency code (ISO 4217), e.g., "USD", "EUR", "GBP"',
                },
                to: {
                    type: 'string',
                    description:
                        'the target currency code (ISO 4217), e.g., "EUR", "GBP", "JPY"',
                },
            },
            required: ['amount', 'from', 'to'],
        },
    },
};
