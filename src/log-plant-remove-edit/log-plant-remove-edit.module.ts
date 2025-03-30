import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantRemoveEdit } from './entity/log-plant-remove-edit-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { Member } from 'src/member/entity/member-entity.model';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { MemberWithBarcodeModule } from 'src/member-with-barcode/member-with-barcode.module';
import { LogPlantRemoveEditController } from './log-plant-remove-edit.controller';
import { LogPlantRemoveEditService } from './log-plant-remove-edit.service';
import { LogPlantRemove } from 'src/log-plant-remove/entity/log-plant-remove-entity.model';
import { SourcesPlantRemoveTypeModule } from 'src/sources-plant-remove-type/sources-plant-remove-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogPlantRemoveEdit, LogPlantRemove, Member]),
    forwardRef(() => SourcesPlantRemoveTypeModule),
    forwardRef(() => LogTokenModule),
    forwardRef(() => MemberWithBarcodeModule),
  ],
  controllers: [LogPlantRemoveEditController],
  providers: [LogPlantRemoveEditService, MomentService],
  exports: [LogPlantRemoveEditService],
})
export class LogPlantRemoveEditModule {}
