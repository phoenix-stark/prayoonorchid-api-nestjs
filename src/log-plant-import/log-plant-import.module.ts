import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantImport } from './entity/log-plant-import-entity.model';
import { LogPlantImportService } from './log-plant-import.service';
import { LogPlantImportNow } from './entity/log-plant-import-now-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { SourcesWorkType } from 'src/sources-work-type/entity/sources-work-type-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { LogPlantImportController } from './log-plant-import.controller';
import { MemberWithBarcode } from 'src/member-with-barcode/entity/member-with-barcode-entity.model';
import { MemberWithBarcodeModule } from 'src/member-with-barcode/member-with-barcode.module';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { LogPlantRemove } from 'src/log-plant-remove/entity/log-plant-remove-entity.model';
import { LogPlantRemoveNow } from 'src/log-plant-remove/entity/log-plant-remove-now-entity.model';
import { LogPlantRemoveEditService } from 'src/log-plant-remove-edit/log-plant-remove-edit.service';
import { LogPlantRemoveEditModule } from 'src/log-plant-remove-edit/log-plant-remove-edit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogPlantImport,
      LogPlantImportNow,
      LogPlantRemove,
      LogPlantRemoveNow,
      Member,
      FoodPlant,
      SourcesWorkType,
      MemberWithBarcode,
    ]),
    MemberWithBarcodeModule,
    forwardRef(() => ReceiptModule),
    forwardRef(() => LogTokenModule),
    forwardRef(() => LogPlantRemoveEditModule),
  ],
  controllers: [LogPlantImportController],
  providers: [LogPlantImportService, MomentService],
  exports: [LogPlantImportService],
})
export class LogPlantImportModule {}
