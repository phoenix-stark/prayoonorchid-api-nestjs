import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesPlantRemoveType } from './entity/sources-plant-remove-type-entity.model';
import { SourcesPlantRemoveTypeController } from './sources-plant-remove-type.controller';
import { SourcesPlantRemoveTypeService } from './sources-plant-remove-type.service';
import { MomentService } from 'src/utils/MomentService';
import { LogTokenModule } from 'src/log_token/log-token.module';

@Module({
  imports: [TypeOrmModule.forFeature([SourcesPlantRemoveType]), LogTokenModule],
  controllers: [SourcesPlantRemoveTypeController],
  providers: [SourcesPlantRemoveTypeService, MomentService],
  exports: [SourcesPlantRemoveTypeService],
})
export class SourcesPlantRemoveTypeModule {}
