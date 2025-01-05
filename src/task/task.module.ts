import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { LogPlantImportNow } from 'src/log-plant-import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from 'src/log_plant_remove/entity/log-plant-remove-now-entity.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [TypeOrmModule.forFeature([LogPlantImportNow, LogPlantRemoveNow])],
  controllers: [],
  providers: [TasksService, MomentService],
  exports: [TasksService],
})
export class TasksModule {}
