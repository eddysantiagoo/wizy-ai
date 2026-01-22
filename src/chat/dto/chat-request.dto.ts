import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * dto for chat endpoint request
 */
export class ChatRequestDto {
    @ApiProperty({
        description: 'The message to send to the chatbot',
        example: 'do you have any jbl speaker color green under 69 usd?',
    })
    @IsString()
    @IsNotEmpty()
    message: string;
}
