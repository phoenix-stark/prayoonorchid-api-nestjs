import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ReceiptGetInput } from './dto/receipt-get-input';
import { ReceiptService } from './receipt.service';
import { ReceiptDeleteInput } from './dto/receipt-delete-input';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get()
  @HttpCode(200)
  async getContributors(@Query() input: ReceiptGetInput): Promise<any[]> {
    return await this.receiptService.getReceipts(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteReceipt(@Body() input: ReceiptDeleteInput): Promise<any[]> {
    return await this.receiptService.deleteReceipt(input);
  }
}
