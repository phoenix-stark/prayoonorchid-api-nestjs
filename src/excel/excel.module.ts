import { Module } from '@nestjs/common';
import { CustomerModule } from 'src/customer/customer.module';
import { PlantFamilyMainModule } from 'src/plant-family-main/plant-family-main.module';
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
