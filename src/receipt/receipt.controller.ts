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
import { ReceiptCreateInput } from './dto/receipt-create-input';
import { ReceiptUpdateInput } from './dto/receipt-update-input';
import { ReceiptCheckDeleteInput } from './dto/receipt-check-delete.input';
import { ReceiptGetByIdInput } from './dto/receipt-get-by-id.input';
import { ReceiptSearchByNameInput } from './dto/receipt-search-by-name';
import { ReceiptSearchByCodeInput } from './dto/receipt-search-by-code';
import { ReceiptSearchDetailByCodeInput } from './dto/receipt-search-detail-by-code';

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

  @Post()
  @HttpCode(200)
  async createReceipt(@Body() input: ReceiptCreateInput): Promise<any[]> {
    return await this.receiptService.createReceipt(input);
  }

  @Put()
  @HttpCode(200)
  async updateReceipt(@Body() input: ReceiptUpdateInput): Promise<any[]> {
    return await this.receiptService.updateReceipt(input);
  }

  @Get('check')
  @HttpCode(200)
  async checkDeleteReceipt(
    @Query() input: ReceiptCheckDeleteInput,
  ): Promise<any[]> {
    return await this.receiptService.checkDeleteReceipt(input);
  }

  @Get('detail')
  @HttpCode(200)
  async getReceiptDetail(@Query() input: ReceiptGetByIdInput): Promise<any[]> {
    return await this.receiptService.getReceiptDetail(input);
  }

  @Get('search/name')
  @HttpCode(200)
  async searchReceiptByName(
    @Query() input: ReceiptSearchByNameInput,
  ): Promise<any[]> {
    return await this.receiptService.searchReceiptByName(input);
  }

  @Get('search/code')
  @HttpCode(200)
  async searchReceiptByCode(
    @Query() input: ReceiptSearchByCodeInput,
  ): Promise<any[]> {
    return await this.receiptService.searchReceiptByCode(input);
  }

  // searchReceiptDetail.php and searchReceiptsByCode.php and searchReceipts.php DUPLICATE
  @Get('search/detail')
  @HttpCode(200)
  async searchReceiptDetailByCode(
    @Query() input: ReceiptSearchDetailByCodeInput,
  ): Promise<any[]> {
    return await this.receiptService.searchReceiptDetailByCode(input);
  }
}
