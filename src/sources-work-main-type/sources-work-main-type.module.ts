import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesWorkMainType } from './entity/sources-work-main-type-entity.model';
import { LogPlantImportModule } from 'src/log_plant_import/log-plant-import.module';
import { SourcesWorkMainTypeController } from './sources-work-main-type.controller';
import { SourcesWorkMainTypeService } from './sources-work-main-type.service';
import { LogTokenModule } from 'src/log_token/log-token.module';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [
    TypeOrmModule.forFeature([SourcesWorkMainType]),
    LogPlantImportModule,
    LogTokenModule,
  ],
  controllers: [SourcesWorkMainTypeController],
  providers: [SourcesWorkMainTypeService, MomentService],
  exports: [SourcesWorkMainTypeService],
})
export class SourcesWorkMainTypeModule {}
