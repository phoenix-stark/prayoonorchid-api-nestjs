import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantImport } from './entity/log-plant-import-entity.model';
import { LogPlantImportService } from './log-plant-import.service';
import { LogPlantImportNow } from './entity/log-plant-import-now-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { SourcesWorkType } from 'src/sources-work-type/entity/sources-work-type-entity.model';
import { LogToken } from 'src/log-token/entity/log-token-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { LogPlantImportController } from './log-plant-import.controller';
import { Receipt } from 'src/receipt/entity/receipt-entity.model';
import { LogPlantRemoveNow } from 'src/log_plant_remove/entity/log-plant-remove-now-entity.model';
import { MemberWithBarcode } from 'src/member-with-barcode/entity/member-with-barcode-entity.model';
import { MemberWithBarcodeModule } from 'src/member-with-barcode/member-with-barcode.module';
import { LogTokenModule } from 'src/log-token/log-token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogPlantImport,
      LogPlantImportNow,
      LogPlantRemoveNow,
      Member,
      FoodPlant,
      SourcesWorkType,
      MemberWithBarcode,
      Receipt,
    ]),
    MemberWithBarcodeModule,
    forwardRef(() => LogTokenModule),
  ],
  controllers: [LogPlantImportController],
  providers: [LogPlantImportService, MomentService],
  exports: [LogPlantImportService],
})
export class LogPlantImportModule {}
