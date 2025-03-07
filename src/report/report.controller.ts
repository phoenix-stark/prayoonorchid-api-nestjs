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
import { ReportGetInput } from './dto/report-get.input';
import { ReportService } from './report.service';
import { ReportGetByBarcodeInput } from './dto/report-get-barcode.input';
import { ReportGetLogPlantImportGroupingInput } from './dto/report-get-log-plant-import-grouping.input';
import { ReportGetLogPlantImportGroupingDetailInput } from './dto/report-get-log-plant-import-grouping-detail.input';
import { ReportGetLogPlantRemoveGroupingInput } from './dto/report-get-log-plant-remove-grouping.input';
import { ReportGetLogPlantRemoveTimeInput } from './dto/report-get-log-plant-remove-time.input';
import { ReportGetLogPlantRemoveGroupingDetailInput } from './dto/report-get-log-plant-remove-grouping-detail.input';
import { ReportGetProductionMultipleInput } from './dto/report-get-production-multiple.input';
import { ReportGetStockInput } from './dto/report-get-stock.input';
import { ReportGetBottleInput } from './dto/report-get-bottle.input';
import { ReportGetFailInput } from './dto/report-get-fail.input';
import { ReportGetRemoveAllInput } from './dto/report-get-remove-all.input';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('production')
  @HttpCode(200)
  async getReportProduction(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportProduction(input);
  }

  @Get('production-multiple')
  @HttpCode(200)
  async getReportProductionMultiple(
    @Query() input: ReportGetProductionMultipleInput,
  ): Promise<any> {
    return await this.reportService.getReportProductionMultiple(input);
  }

  @Post('stock')
  @HttpCode(200)
  async getReportStock(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportStock(input);
  }

  @Get('stock-multiple')
  @HttpCode(200)
  async getReportStockMultiple(
    @Query() input: ReportGetStockInput,
  ): Promise<any> {
    return await this.reportService.getReportStockMultiple(input);
  }

  @Get('bottle')
  @HttpCode(200)
  async getReportBottle(@Query() input: ReportGetBottleInput): Promise<any> {
    return await this.reportService.getReportBottle(input);
  }

  @Get('plant-fail')
  @HttpCode(200)
  async getReportPlantFail(@Query() input: ReportGetFailInput): Promise<any> {
    return await this.reportService.getReportPlantFail(input);
  }

  @Get('plant-fail-all')
  @HttpCode(200)
  async getReportPlantFailAll(
    @Query() input: ReportGetFailInput,
  ): Promise<any> {
    return await this.reportService.getReportPlantFailAll(input);
  }

  @Get('remove-all')
  @HttpCode(200)
  async getReportRemoveAll(
    @Query() input: ReportGetRemoveAllInput,
  ): Promise<any> {
    return await this.reportService.getReportRemoveAll(input);
  }

  @Get('barcode')
  @HttpCode(200)
  async getReportBarcode(
    @Query() input: ReportGetByBarcodeInput,
  ): Promise<any> {
    return await this.reportService.getReportBarcode(input);
  }

  // แยกตามครั้งที่ ระดับ 1
  @Get('log-plant-import/history/grouping')
  @HttpCode(200)
  async getReportLogImportHistoryGrouping(
    @Query() input: ReportGetLogPlantImportGroupingInput,
  ): Promise<any> {
    return await this.reportService.getReportLogImportHistoryGrouping(input);
  }

  // รายละเอียดของครั้งนั้น
  @Get('log-plant-import/history/grouping/detail')
  @HttpCode(200)
  async getReportLogImportHistoryGroupingDetail(
    @Query() input: ReportGetLogPlantImportGroupingDetailInput,
  ): Promise<any> {
    return await this.reportService.getReportLogImportHistoryGroupingDetail(
      input,
    );
  }

  // แยกตามครั้งที่ ระดับ 1
  @Get('log-plant-remove/history/time')
  @HttpCode(200)
  async getReportLogRemoveHistoryTime(
    @Query() input: ReportGetLogPlantRemoveTimeInput,
  ): Promise<any> {
    return await this.reportService.getReportLogRemoveHistoryTime(input);
  }

  // แยกตามครั้งที่ - กลุ่ม สาเหตุ
  @Get('log-plant-remove/history/grouping')
  @HttpCode(200)
  async getReportLogRemoveHistoryGrouping(
    @Query() input: ReportGetLogPlantRemoveGroupingInput,
  ): Promise<any> {
    return await this.reportService.getReportLogRemoveHistoryGrouping(input);
  }

  // แยกตามครั้งที่ - กลุ่ม สาเหตุ - รายละเอียด
  @Get('log-plant-remove/history/grouping/detail')
  @HttpCode(200)
  async getReportLogRemoveHistoryGroupingDetail(
    @Query() input: ReportGetLogPlantRemoveGroupingDetailInput,
  ): Promise<any> {
    return await this.reportService.getReportLogRemoveHistoryGroupingDetail(
      input,
    );
  }
}
