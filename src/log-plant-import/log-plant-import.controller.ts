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
import { LogImportGetByReceiptIdInput } from './dto/log-import-get-by-receipt-id.input';
import { LogImportGetDetailByBarcodeInput } from './dto/log-import-get-detail-by-barcode.input';
import { LogImportUpdateGroupAllInput } from './dto/log-import-update-group-all.input';

@Controller('log-plant-import')
export class LogPlantImportController {
  constructor(private readonly logPlantImportService: LogPlantImportService) {}

  @Post()
  @HttpCode(200)
  async insertBarcode(@Body() input: LogImportCreateInput): Promise<any> {
    return await this.logPlantImportService.insertBarcode(input, false);
  }

  @Post('add-on')
  @HttpCode(200)
  async addOnBarcode(@Body() input: LogImportCreateInput): Promise<any> {
    return await this.logPlantImportService.insertBarcode(input, true);
  }

  @Put()
  @HttpCode(200)
  async updateBarcode(@Body() input: LogImportUpdateInput): Promise<any> {
    return await this.logPlantImportService.updateBarcode(input);
  }

  @Put('all')
  @HttpCode(200)
  async updateBarcodeAll(@Body() input: LogImportUpdateAllInput): Promise<any> {
    return await this.logPlantImportService.updateBarcodeAllV2(input, false);
  }

  @Post('all/check')
  @HttpCode(200)
  async getUpdateBarcodeAll(
    @Body() input: LogImportUpdateAllInput,
  ): Promise<any> {
    return await this.logPlantImportService.updateBarcodeAllV2(input, true);
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

  @Get('receipt')
  @HttpCode(200)
  async getLogPlantImportByReceipt(
    @Query() input: LogImportGetByReceiptIdInput,
  ): Promise<any> {
    return await this.logPlantImportService.getLogPlantImportByReceipt(input);
  }

  @Get('barcode/detail')
  @HttpCode(200)
  async getLogPlantImportDetailByBarcode(
    @Query() input: LogImportGetDetailByBarcodeInput,
  ): Promise<any> {
    return await this.logPlantImportService.getLogPlantImportDetailByBarcode(
      input,
    );
  }

  @Put('group')
  @HttpCode(200)
  async updateLogPlantImportGroupAll(
    @Body() input: LogImportUpdateGroupAllInput,
  ): Promise<any> {
    return await this.logPlantImportService.updateLogPlantImportGroupAll(input);
  }
}
