import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantRemove } from './entity/log-plant-remove-entity.model';
import { LogPlantRemoveService } from './log-plant-remove.service';
import { MomentService } from 'src/utils/MomentService';
import { Member } from 'src/member/entity/member-entity.model';
import { LogPlantImportNow } from 'src/log-plant-import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from './entity/log-plant-remove-now-entity.model';
import { LogPlantRemoveController } from './log-plant-remove.controller';
import { MemberWithBarcodeService } from 'src/member-with-barcode/member-with-barcode.service';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { MemberWithBarcodeModule } from 'src/member-with-barcode/member-with-barcode.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogPlantRemove,
      LogPlantRemoveNow,
      LogPlantImportNow,
      Member,
    ]),
    forwardRef(() => LogTokenModule),
    forwardRef(() => MemberWithBarcodeModule),
  ],
  controllers: [LogPlantRemoveController],
  providers: [LogPlantRemoveService, MomentService],
  exports: [LogPlantRemoveService],
})
export class LogPlantRemoveModule {}
