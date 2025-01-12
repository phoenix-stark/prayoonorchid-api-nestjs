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
import { LogPlantRemoveService } from './log-plant-remove.service';
import { LogRemoveCreateInput } from './dto/log-remove-create.input';
import { LogRemoveDeleteInput } from './dto/log-remove-delete.input';
import { LogRemoveUpdateInput } from './dto/log-remove-update.input';
import { LogRemoveUpdateAllInput } from './dto/log-remove-update-all.input';
import { LogRemoveDeleteRangeBarcodeInput } from './dto/log-remove-delete-range-barcode.input';
import { LogRemoveDeleteByReceiptIdInput } from './dto/log-remove-delete-by-receipt-id.input';
import { LogRemoveGetByReceiptIdInput } from './dto/log-remove-get-by-receipt-id.input';
import { LogRemoveGetDetailByBarcodeInput } from './dto/log-remove-get-detail-by-barcode.input';

@Controller('log-plant-remove')
export class LogPlantRemoveController {
  constructor(private readonly logPlantRemoveService: LogPlantRemoveService) {}

  @Post()
  @HttpCode(200)
  async insertBarcode(@Body() input: LogRemoveCreateInput): Promise<any> {
    return await this.logPlantRemoveService.insertBarcode(input);
  }

  @Put()
  @HttpCode(200)
  async updateBarcode(@Body() input: LogRemoveUpdateInput): Promise<any> {
    return await this.logPlantRemoveService.updateBarcode(input);
  }

  @Put('all')
  @HttpCode(200)
  async updateBarcodeAll(@Body() input: LogRemoveUpdateAllInput): Promise<any> {
    return await this.logPlantRemoveService.updateBarcodeAll(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteBarcode(@Body() input: LogRemoveDeleteInput): Promise<any> {
    return await this.logPlantRemoveService.deleteBarcode(input);
  }

  @Delete('range-barcode')
  @HttpCode(200)
  async deleteBarcodeRangeBarcode(
    @Body() input: LogRemoveDeleteRangeBarcodeInput,
  ): Promise<any> {
    return await this.logPlantRemoveService.deleteBarcodeRangeBarcode(input);
  }

  @Delete('receipt')
  @HttpCode(200)
  async deleteBarcodeByReceiptId(
    @Body() input: LogRemoveDeleteByReceiptIdInput,
  ): Promise<any> {
    return await this.logPlantRemoveService.deleteBarcodeByReceiptId(input);
  }

  @Get('receipt')
  @HttpCode(200)
  async getLogPlantRemoveByReceipt(
    @Query() input: LogRemoveGetByReceiptIdInput,
  ): Promise<any> {
    return await this.logPlantRemoveService.getLogPlantRemoveByReceipt(input);
  }

  @Get('receipt/detail')
  @HttpCode(200)
  async getLogPlantRemoveDetailByBarcode(
    @Query() input: LogRemoveGetDetailByBarcodeInput,
  ): Promise<any> {
    return await this.logPlantRemoveService.getLogPlantRemoveDetailByBarcode(
      input,
    );
  }
}
