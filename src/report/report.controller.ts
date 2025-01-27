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

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('production')
  @HttpCode(200)
  async getReportProduction(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportProduction(input);
  }

  @Post('production-multiple')
  @HttpCode(200)
  async getReportProductionMultiple(
    @Body() input: ReportGetInput,
  ): Promise<any> {
    return await this.reportService.getReportProductionMultiple(input);
  }

  @Post('stock')
  @HttpCode(200)
  async getReportStock(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportStock(input);
  }

  @Post('stock-multiple')
  @HttpCode(200)
  async getReportStockMultiple(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportStockMultiple(input);
  }

  @Post('bottle')
  @HttpCode(200)
  async getReportBottle(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportBottle(input);
  }

  @Post('plant-fail')
  @HttpCode(200)
  async getReportPlantFail(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportPlantFail(input);
  }

  @Post('plant-fail-all')
  @HttpCode(200)
  async getReportPlantFailAll(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportPlantFailAll(input);
  }

  @Post('remove-all')
  @HttpCode(200)
  async getReportRemoveAll(@Body() input: ReportGetInput): Promise<any> {
    return await this.reportService.getReportRemoveAll(input);
  }

  @Get('barcode')
  @HttpCode(200)
  async getReportBarcode(
    @Query() input: ReportGetByBarcodeInput,
  ): Promise<any> {
    return await this.reportService.getReportBarcode(input);
  }

  @Get('log-plant-import/history/grouping')
  @HttpCode(200)
  async getReportLogImportHistoryGrouping(
    @Query() input: ReportGetLogPlantImportGroupingInput,
  ): Promise<any> {
    return await this.reportService.getReportLogImportHistoryGrouping(input);
  }

  @Get('log-plant-import/history/grouping/detail')
  @HttpCode(200)
  async getReportLogImportHistoryGroupingDetail(
    @Query() input: ReportGetLogPlantImportGroupingDetailInput,
  ): Promise<any> {
    return await this.reportService.getReportLogImportHistoryGroupingDetail(
      input,
    );
  }

  @Get('log-plant-remove/history/time')
  @HttpCode(200)
  async getReportLogRemoveHistoryTime(
    @Query() input: ReportGetLogPlantRemoveTimeInput,
  ): Promise<any> {
    return await this.reportService.getReportLogRemoveHistoryTime(input);
  }

  @Get('log-plant-remove/history/grouping')
  @HttpCode(200)
  async getReportLogRemoveHistoryGrouping(
    @Query() input: ReportGetLogPlantRemoveGroupingInput,
  ): Promise<any> {
    return await this.reportService.getReportLogRemoveHistoryGrouping(input);
  }

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
