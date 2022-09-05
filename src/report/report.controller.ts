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
  async getReportStock(): Promise<any[]> {
    return await this.reportService.getReportStock();
  }

  @Get('bottle')
  @HttpCode(200)
  async getReportBottle(): Promise<any[]> {
    return await this.reportService.getReportBottle();
  }

  @Get('plant-fail')
  @HttpCode(200)
  async getReportPlantFail(): Promise<any[]> {
    return await this.reportService.getReportPlantFail();
  }

  @Get('remove-all')
  @HttpCode(200)
  async getReportRemoveall(): Promise<any[]> {
    return await this.reportService.getReportRemoveall();
  }
}
