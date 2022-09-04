import { Module } from '@nestjs/common';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { ExcelController } from './excel-controller';
import { ExcelService } from './excel-service';
@Module({
  imports: [ReceiptModule],
  controllers: [ExcelController],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
