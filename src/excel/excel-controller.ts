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
import { ReportGetProductionMultipleInput } from 'src/report/dto/report-get-production-multiple.input';
import { ReportGetStockInput } from 'src/report/dto/report-get-stock.input';
import { ReportGetFailInput } from 'src/report/dto/report-get-fail.input';
import { ReportGetRemoveAllInput } from 'src/report/dto/report-get-remove-all.input';
import { ReportGetLogPlantImportGroupingInput } from 'src/report/dto/report-get-log-plant-import-grouping.input';
import { ReportGetLogPlantImportGroupingDetailInput } from 'src/report/dto/report-get-log-plant-import-grouping-detail.input';
import { ReportGetLogPlantRemoveTimeInput } from 'src/report/dto/report-get-log-plant-remove-time.input';
import { ReportGetLogPlantRemoveGroupingInput } from 'src/report/dto/report-get-log-plant-remove-grouping.input';
import { ReportGetLogPlantRemoveGroupingDetailInput } from 'src/report/dto/report-get-log-plant-remove-grouping-detail.input';

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
    @Query() input: ReportGetStockInput,
    @Res() res: Response,
  ) {
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
    @Query() input: ReportGetRemoveAllInput,
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
    @Query() input: ReportGetInput,
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

  @Get('report-stock-multiple')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportStockMultiple(
    @Query() input: ReportGetStockInput,
    @Res() res: Response,
  ) {
    const result = await this.excelService.exportReportStockMultiple(input);
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
    @Query() input: ReportGetInput,
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

  @Get('report-production-multiple')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportProductionMultiple(
    @Query() input: ReportGetProductionMultipleInput,
    @Res() res: Response,
  ) {
    const result = await this.excelService.exportReportProductionMultiple(
      input,
    );
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
    @Query() input: ReportGetFailInput,
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

  // รายงาน ประวัตินำเข้า
  @Get('report-log-plant-import-history-grouping')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportLogPlantImportHistoryGrouping(
    @Query() input: ReportGetLogPlantImportGroupingInput,
    @Res() res: Response,
  ) {
    const result =
      await this.excelService.exportReportLogPlantImportHistoryGrouping(input);
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

  // รายงาน รายละเอียด ประวัตินำเข้า
  @Get('report-log-plant-import-history-grouping-detail')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportLogPlantImportHistoryGroupingDetail(
    @Query() input: ReportGetLogPlantImportGroupingDetailInput,
    @Res() res: Response,
  ) {
    const result =
      await this.excelService.exportReportLogPlantImportHistoryGroupingDetail(
        input,
      );
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

  // รายงาน ประวัตินำออก แยกตามครั้ง
  @Get('report-log-plant-remove-history-time')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportLogPlantRemoveHistoryTime(
    @Query() input: ReportGetLogPlantRemoveTimeInput,
    @Res() res: Response,
  ) {
    const result =
      await this.excelService.exportReportLogPlantRemoveHistoryTime(input);
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

  // รายงาน รายละเอียด การนำออก
  @Get('report-log-plant-remove-history-grouping')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportLogPlantRemoveHistoryGrouping(
    @Query() input: ReportGetLogPlantRemoveGroupingInput,
    @Res() res: Response,
  ) {
    const result =
      await this.excelService.exportReportLogPlantRemoveHistoryGrouping(input);
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

  // รายงาน รายละเอียด การนำออก
  @Get('report-log-plant-remove-history-grouping-detail')
  @HttpCode(200)
  @Header('Content-Type', 'text/xlsx')
  async exportReportLogPlantRemoveHistoryGroupingDetail(
    @Query() input: ReportGetLogPlantRemoveGroupingDetailInput,
    @Res() res: Response,
  ) {
    const result =
      await this.excelService.exportReportLogPlantRemoveHistoryGroupingDetail(
        input,
      );
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
