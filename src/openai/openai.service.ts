import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
    ChatCompletionMessageParam,
    ChatCompletionToolMessageParam,
} from 'openai/resources/chat/completions';
import { ProductsService } from '../products/products.service';
import { CurrencyService } from '../currency/currency.service';
import { searchProductsTool, convertCurrenciesTool } from './tools';

/**
 * maximum iterations for the tool-calling loop
 * this is for prevent infinite loops if the LLM keeps requesting tools
 */
const MAX_TOOL_ITERATIONS = 5;

/**
 * system prompt that defines the chatbot's behavior
 */
const SYSTEM_PROMPT = `You are a helpful shopping assistant for an e-commerce store.
You can help customers:
- Search for products in our catalog
- Answer questions about product prices
- Convert prices between different currencies

Always be friendly and helpful. When showing products, include the product name, price, and a brief description.
When converting currencies, clearly show both the original and converted amounts.

If you don't find relevant products or can't help with something, politely let the customer know.`;

@Injectable()
export class OpenAIService {
    private readonly logger = new Logger(OpenAIService.name);
    private readonly client: OpenAI;
    private readonly tools = [searchProductsTool, convertCurrenciesTool];

    /**
     * in-memory chat history to provide context between messages
     * stores the last N messages to maintain conversation flow
     */
    private chatHistory: ChatCompletionMessageParam[] = [];
    private readonly MAX_HISTORY_SIZE = 10; // keep last 10 messages (approx 5 turns)

    constructor(
        private readonly configService: ConfigService,
        private readonly productsService: ProductsService,
        private readonly currencyService: CurrencyService,
    ) {
        const apiKey = this.configService.get<string>('openai.apiKey');
        this.client = new OpenAI({ apiKey });
    }

    /**
     * process a user message and generate a response
     * implements the tool-calling loop and maintains conversation history
     *
     * @param userMessage - the message from the user
     * @returns the assistant's final text response
     */
    async processMessage(userMessage: string): Promise<string> {
        // start with system prompt, add history, and finally the current user message
        const messages: ChatCompletionMessageParam[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...this.chatHistory,
            { role: 'user', content: userMessage },
        ];

        let iterations = 0;

        // tool-calling loop
        while (iterations < MAX_TOOL_ITERATIONS) {
            iterations++;
            this.logger.debug(`Tool-calling iteration ${iterations}`);

            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                tools: this.tools,
                tool_choice: 'auto',
            });

            const assistantMessage = response.choices[0].message;
            messages.push(assistantMessage);

            // if no tool calls, we have the final response
            if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
                const content = assistantMessage.content || 'I apologize, but I could not generate a response.';
                this.updateHistory(userMessage, content);
                return content;
            }

            // execute each tool call and add results to messages
            const toolResults: ChatCompletionToolMessageParam[] = [];

            for (const toolCall of assistantMessage.tool_calls) {
                // only handle function-type tool calls
                if (toolCall.type !== 'function') continue;

                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                this.logger.debug(`Executing tool: ${functionName}`, args);

                let result: string;
                try {
                    result = await this.executeTool(functionName, args);
                } catch (error) {
                    result = `Error: ${(error as Error).message}`;
                    this.logger.error(`Tool execution failed: ${functionName}`, error);
                }

                toolResults.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: result,
                });
            }

            // add all tool results to the conversation
            messages.push(...toolResults);
        }

        // safety exit if max iterations reached
        this.logger.warn('Max tool iterations reached');
        const fallbackResponse = 'I apologize, but I encountered an issue processing your request. Please try again.';

        // even on fallback, we should track the attempt
        this.updateHistory(userMessage, fallbackResponse);
        return fallbackResponse;
    }

    /**
     * persist the interaction to the in-memory history and maintain limit
     */
    private updateHistory(user: string, assistant: string): void {
        this.chatHistory.push({ role: 'user', content: user });
        this.chatHistory.push({ role: 'assistant', content: assistant });

        // maintain the sliding window
        if (this.chatHistory.length > this.MAX_HISTORY_SIZE) {
            this.chatHistory = this.chatHistory.slice(-this.MAX_HISTORY_SIZE);
        }
    }

    /**
     * execute a tool by name with the provided arguments
     */
    private async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
        switch (name) {
            case 'searchProducts': {
                const query = args.query as string;
                const products = this.productsService.searchProducts(query);

                if (products.length === 0) {
                    return JSON.stringify({
                        success: true,
                        message: 'No products found matching the search query.',
                        products: [],
                    });
                }

                return JSON.stringify({
                    success: true,
                    products: products.map((p) => ({
                        name: p.displayTitle,
                        price: p.price,
                        category: p.productType,
                        url: p.url,
                        hasDiscount: p.discount > 0,
                    })),
                });
            }

            case 'convertCurrencies': {
                const amount = args.amount as number;
                const from = args.from as string;
                const to = args.to as string;

                const converted = await this.currencyService.convertCurrency(amount, from, to);

                return JSON.stringify({
                    success: true,
                    originalAmount: amount,
                    originalCurrency: from.toUpperCase(),
                    convertedAmount: converted,
                    targetCurrency: to.toUpperCase(),
                });
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
