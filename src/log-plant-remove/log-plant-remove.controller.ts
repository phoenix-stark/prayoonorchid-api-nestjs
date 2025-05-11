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
import { LogRemoveUpdateDetailAllInput } from './dto/log-remove-update-detail-all.input';

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
    return await this.logPlantRemoveService.updateBarcodeAllV2(input, false);
  }

  @Post('all/check')
  @HttpCode(200)
  async getUpdateBarcodeAll(
    @Body() input: LogRemoveUpdateAllInput,
  ): Promise<any> {
    return await this.logPlantRemoveService.updateBarcodeAllV2(input, true);
  }

  // ตรวจสอบรายละเอียด
  @Post('all/detail/check')
  @HttpCode(200)
  async checkBarcodeDetailAllV2(
    @Body() input: LogRemoveUpdateDetailAllInput,
  ): Promise<any> {
    return await this.logPlantRemoveService.updateBarcodeDetailAllV2(
      input,
      true,
    );
  }

  @Put('all/detail')
  @HttpCode(200)
  async updateBarcodeDetailAllV2(
    @Body() input: LogRemoveUpdateDetailAllInput,
  ): Promise<any> {
    return await this.logPlantRemoveService.updateBarcodeDetailAllV2(
      input,
      false,
    );
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
