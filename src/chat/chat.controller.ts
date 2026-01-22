import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatRequestDto, ChatResponseDto } from './dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    @ApiOperation({
        summary: 'Send a message to the chatbot',
        description:
            'Sends a user message to the WizyAI chatbot, which can search products by name, color and price and also convert currencies',
    })
    @ApiResponse({
        status: 200,
        description: 'Successful response from the chatbot',
        type: ChatResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid request - message is required',
    })
    async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
        return this.chatService.processMessage(chatRequest.message);
    }
}
