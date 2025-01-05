import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesWorkType } from './entity/sources-work-type-entity.model';
import { LogPlantImportModule } from 'src/log-plant-import/log-plant-import.module';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { SourcesWorkTypeService } from './sources-work-type.service';
import { MomentService } from 'src/utils/MomentService';
import { SourcesWorkTypeController } from './sources-work-type.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SourcesWorkType]),
    LogPlantImportModule,
    LogTokenModule,
  ],
  controllers: [SourcesWorkTypeController],
  providers: [SourcesWorkTypeService, MomentService],
  exports: [SourcesWorkTypeService],
})
export class SourcesWorkTypeModule {}
