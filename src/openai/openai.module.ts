import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ProductsModule } from '../products/products.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
    imports: [ProductsModule, CurrencyModule],
    providers: [OpenAIService],
    exports: [OpenAIService],
})
export class OpenAIModule { }
