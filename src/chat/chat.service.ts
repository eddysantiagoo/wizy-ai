import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { ChatResponseDto } from './dto';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(private readonly openaiService: OpenAIService) { }

    /**
     * process a user message and return the chatbot's response
     * handles errors gracefully to provide user-friendly error messages
     *
     * @param message - the user's input message
     * @returns chaResponseDto with the assistant's reply
     */
    async processMessage(message: string): Promise<ChatResponseDto> {
        try {
            this.logger.debug(`Processing message: "${message.substring(0, 50)}..."`);

            const reply = await this.openaiService.processMessage(message);

            return { reply };
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.logger.error(`Failed to process message: ${errorMessage}`);

            // user-friendly error message
            return {
                reply:
                    'I apologize, but I encountered an issue processing your request. Please try again later.',
            };
        }
    }
}
