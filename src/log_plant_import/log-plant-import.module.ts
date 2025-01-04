import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantImport } from './entity/log-plant-import-entity.model';
import { LogPlantImportService } from './log-plant-import.service';
import { LogPlantImportNow } from './entity/log-plant-import-now-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { SourcesWorkType } from 'src/sources-work-type/entity/sources-work-type-entity.model';
import { LogToken } from 'src/log_token/entity/log-token-entity.model';
import { MemberWithBarcodeService } from 'src/member_with_barcode/member-with-barcode.service';
import { MomentService } from 'src/utils/MomentService';
import { MemberWithBarcode } from 'src/member_with_barcode/entity/member-with-barcode-entity.model';
import { LogPlantImportController } from './log-plant-import.controller';
import { Receipt } from 'src/receipt/entity/receipt-entity.model';
import { LogPlantRemoveNow } from 'src/log_plant_remove/entity/log-plant-remove-now-entity.model';
import { MemberWithBarcodeModule } from 'src/member_with_barcode/member-with-barcode.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogPlantImport,
      LogPlantImportNow,
      LogPlantRemoveNow,
      Member,
      FoodPlant,
      SourcesWorkType,
      LogToken,
      MemberWithBarcode,
      Receipt,
    ]),
    MemberWithBarcodeModule,
  ],
  controllers: [LogPlantImportController],
  providers: [LogPlantImportService, MomentService],
  exports: [LogPlantImportService],
})
export class LogPlantImportModule {}
