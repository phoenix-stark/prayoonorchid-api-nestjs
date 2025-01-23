import { forwardRef, Module } from '@nestjs/common';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { ReportModule } from 'src/report/report.module';
import { MomentService } from 'src/utils/MomentService';
import { ExcelController } from './excel-controller';
import { ExcelService } from './excel-service';
@Module({
  imports: [forwardRef(() => ReportModule), forwardRef(() => ReceiptModule)],
  controllers: [ExcelController],
  providers: [ExcelService, MomentService],
  exports: [ExcelService],
})
export class ExcelModule {}
