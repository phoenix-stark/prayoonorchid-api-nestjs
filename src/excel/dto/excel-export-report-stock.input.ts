import { IsNotEmpty, IsString } from 'class-validator';

export class ExcelExportReportStockInput {
  @IsString()
  @IsNotEmpty()
  date: string;
}
