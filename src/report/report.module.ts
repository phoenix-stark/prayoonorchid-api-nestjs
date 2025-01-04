import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { LogPlantImport } from 'src/log_plant_import/entity/log-plant-import-entity.model';
import { LogPlantRemove } from 'src/log_plant_remove/entity/log-plant-remove-entity.model';
import { MemberModule } from 'src/member/member.module';
import { SourcesWorkMainType } from 'src/sources-work-main-type/entity/sources-work-main-type-entity.model';
import { SourcesWorkType } from 'src/sources_work_type/entity/sources-work-type-entity.model';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogPlantImport,
      LogPlantRemove,
      FoodPlant,
      SourcesWorkMainType,
      SourcesWorkType,
      MemberModule,
      Customer,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
