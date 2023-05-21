import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberWithBarcode } from './entity/member-with-barcode-entity.model';
import { MemberWithBarcodeController } from './member-with-barcode.controller';
import { MemberWithBarcodeService } from './member-with-barcode.service';
import { LogPlantImportNow } from 'src/log_plant_import/entity/log-plant-import-now-entity.model';
import { LogPlantImport } from 'src/log_plant_import/entity/log-plant-import-entity.model';
import { LogPlantRemoveNow } from 'src/log_plant_remove/entity/log-plant-remove-now-entity.model';
import { LogPlantRemove } from 'src/log_plant_remove/entity/log-plant-remove-entity.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberWithBarcode,
      LogPlantImportNow,
      LogPlantImport,
      LogPlantRemoveNow,
      LogPlantRemove,
    ]),
  ],
  controllers: [MemberWithBarcodeController],
  providers: [MemberWithBarcodeService],
  exports: [MemberWithBarcodeService],
})
export class MemberWithBarcodeModule {}
