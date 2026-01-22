import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('WizyAI Chatbot API')
    .setDescription(
      `
AI-powered chatbot API with product search with filters like color and price and also currency conversion.

### Capabilities
- Conversational memory of up to **10 previous messages**
- Context-aware responses
- Product search with filters
- Currency conversion (real-time)

### Notes
- Memory is session-based
- Oldest messages are discarded once limit is reached
  `,
    )
    .setVersion('1.0')
    .addTag('Chat', 'Endpoint for chatbot interactions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
