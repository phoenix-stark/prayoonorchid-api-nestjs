import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantRemove } from './entity/log-plant-remove-entity.model';
import { LogPlantRemoveService } from './log-plant-remove.service';
import { MomentService } from 'src/utils/MomentService';
import { Member } from 'src/member/entity/member-entity.model';
import { LogToken } from 'src/log_token/entity/log-token-entity.model';
import { LogPlantImportNow } from 'src/log_plant_import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from './entity/log-plant-remove-now-entity.model';
import { LogPlantRemoveController } from './log-plant-remove.controller';
import { MemberWithBarcodeService } from 'src/member_with_barcode/member-with-barcode.service';
import { MemberWithBarcode } from 'src/member_with_barcode/entity/member-with-barcode-entity.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogPlantRemove,
      LogPlantRemoveNow,
      LogPlantImportNow,
      Member,
      LogToken,
      MemberWithBarcode,
    ]),
  ],
  controllers: [LogPlantRemoveController],
  providers: [LogPlantRemoveService, MemberWithBarcodeService, MomentService],
  exports: [LogPlantRemoveService],
})
export class LogPlantRemoveModule {}
