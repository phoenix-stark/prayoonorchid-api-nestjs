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
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('production')
  @HttpCode(200)
  async getReportProduction(): Promise<any[]> {
    return await this.reportService.getReportProduction();
  }

  @Get('stock')
  @HttpCode(200)
  async getReportStock(): Promise<any[]> {
    return await this.reportService.getReportStock();
  }
}
