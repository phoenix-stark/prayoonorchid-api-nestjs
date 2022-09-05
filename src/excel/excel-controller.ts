import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { MomentService } from 'src/utils/MomentService';
import { Readable } from 'stream';
import { ExcelExportReportStockInput } from './dto/excel-export-report-stock.input';
import { ReportGetInput } from './dto/report-get.input';
import { ExcelService } from './excel-service';

@Controller('excel')
export class ExcelController {
  constructor(
    private readonly excelService: ExcelService,
    private momentWrapper: MomentService,
  ) {}

  @Get('report-bottle')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportBottle(
    @Query() input: ReportGetInput,
    @Res() res: Response,
  ) {
    console.log(input);
    const result = await this.excelService.exportReportBottle(input);
    const buffer = readFileSync(result);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });
    stream.pipe(res);
  }

  @Get('report-remove-all')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportRemoveAll(
    @Query() input: ExcelExportReportStockInput,
    @Res() res: Response,
  ) {
    const result = await this.excelService.exportReportRemoveAll(input);
    const buffer = readFileSync(result);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });
    stream.pipe(res);
  }

  @Get('report-stock')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportStock(
    @Query() input: ExcelExportReportStockInput,
    @Res() res: Response,
  ) {
    const result = await this.excelService.exportReportStock(input);
    const buffer = readFileSync(result);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });
    stream.pipe(res);
  }

  @Get('report-production')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportProduction(
    @Query() input: ExcelExportReportStockInput,
    @Res() res: Response,
  ) {
    const result = await this.excelService.exportReportProduction(input);
    const buffer = readFileSync(result);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });
    stream.pipe(res);
  }

  @Get('report-fail')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportFail(
    @Query() input: ExcelExportReportStockInput,
    @Res() res: Response,
  ) {
    const result = await this.excelService.exportReportFail(input);
    const buffer = readFileSync(result);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });
    stream.pipe(res);
  }

  @Get('receipt')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReceipt(@Res() res: Response) {
    const result = await this.excelService.exportReceipt();
    const buffer = readFileSync(result);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });
    stream.pipe(res);
  }
}
