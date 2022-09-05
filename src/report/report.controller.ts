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

  @Get('production')
  @HttpCode(200)
  async getReportProduction(@Body() input: ReportGetInput): Promise<any[]> {
    return await this.reportService.getReportProduction(input);
  }

  @Get('stock')
  @HttpCode(200)
  async getReportStock(@Body() input: ReportGetInput): Promise<any[]> {
    return await this.reportService.getReportStock(input);
  }

  @Get('bottle')
  @HttpCode(200)
  async getReportBottle(@Body() input: ReportGetInput): Promise<any[]> {
    return await this.reportService.getReportBottle(input);
  }

  @Get('plant-fail')
  @HttpCode(200)
  async getReportPlantFail(@Body() input: ReportGetInput): Promise<any[]> {
    return await this.reportService.getReportPlantFail(input);
  }

  @Get('remove-all')
  @HttpCode(200)
  async getReportRemoveall(): Promise<any[]> {
    return await this.reportService.getReportRemoveall();
  }
}
