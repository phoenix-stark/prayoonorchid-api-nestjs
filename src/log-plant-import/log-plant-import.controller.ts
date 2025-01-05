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
import { LogPlantImportService } from './log-plant-import.service';
import { LogImportCreateInput } from './dto/log-import-create.input';
import { LogImportUpdateInput } from './dto/log-import-update.input';
import { LogImportUpdateAllInput } from './dto/log-import-update-all.input';
import { LogImportDeleteInput } from './dto/log-import-delete.input';
import { LogImportDeleteRangeBarcodeInput } from './dto/log-import-delete-range-barcode.input';
import { LogImportDeleteByReceiptIdInput } from './dto/log-import-delete-by-receipt-id.input';

@Controller('log-plant-import')
export class LogPlantImportController {
  constructor(private readonly logPlantImportService: LogPlantImportService) {}

  @Post()
  @HttpCode(200)
  async insertBarcode(@Body() input: LogImportCreateInput): Promise<any> {
    return await this.logPlantImportService.insertBarcode(input);
  }

  @Put()
  @HttpCode(200)
  async updateBarcode(@Body() input: LogImportUpdateInput): Promise<any> {
    return await this.logPlantImportService.updateBarcode(input);
  }

  @Put('all')
  @HttpCode(200)
  async updateBarcodeAll(@Body() input: LogImportUpdateAllInput): Promise<any> {
    return await this.logPlantImportService.updateBarcodeAll(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteBarcode(@Body() input: LogImportDeleteInput): Promise<any> {
    return await this.logPlantImportService.deleteBarcode(input);
  }

  @Delete('receipt')
  @HttpCode(200)
  async deleteBarcodeByReceiptId(
    @Body() input: LogImportDeleteByReceiptIdInput,
  ): Promise<any> {
    return await this.logPlantImportService.deleteBarcodeByReceiptId(input);
  }

  @Delete('range-barcode')
  @HttpCode(200)
  async deleteBarcodeRangeBarcode(
    @Body() input: LogImportDeleteRangeBarcodeInput,
  ): Promise<any> {
    return await this.logPlantImportService.deleteBarcodeRangeBarcode(input);
  }
}
