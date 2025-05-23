import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantRemove } from './entity/log-plant-remove-entity.model';
import { LogPlantRemoveService } from './log-plant-remove.service';
import { MomentService } from 'src/utils/MomentService';
import { Member } from 'src/member/entity/member-entity.model';
import { LogPlantImportNow } from 'src/log-plant-import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from './entity/log-plant-remove-now-entity.model';
import { LogPlantRemoveController } from './log-plant-remove.controller';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { MemberWithBarcodeModule } from 'src/member-with-barcode/member-with-barcode.module';
import { LogPlantRemoveEditModule } from 'src/log-plant-remove-edit/log-plant-remove-edit.module';
import { LogPlantImport } from 'src/log-plant-import/entity/log-plant-import-entity.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogPlantRemove,
      LogPlantRemoveNow,
      LogPlantImportNow,
      LogPlantImport,
      Member,
    ]),
    forwardRef(() => LogPlantRemoveEditModule),
    forwardRef(() => LogTokenModule),
    forwardRef(() => MemberWithBarcodeModule),
  ],
  controllers: [LogPlantRemoveController],
  providers: [LogPlantRemoveService, MomentService],
  exports: [LogPlantRemoveService],
})
export class LogPlantRemoveModule {}
