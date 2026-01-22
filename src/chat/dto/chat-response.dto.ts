import { ApiProperty } from '@nestjs/swagger';

/**
 * dto for chat endpoint response
 */
export class ChatResponseDto {
    @ApiProperty({
        description: 'The chatbot response message',
        example:
            'Sure! i found a green JBL speaker for $65.99. would you like more details about them?',
    })
    reply: string;
}
