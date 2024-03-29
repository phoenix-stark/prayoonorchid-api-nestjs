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
}
