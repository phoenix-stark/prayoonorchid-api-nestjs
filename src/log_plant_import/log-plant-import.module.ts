import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantImport } from './entity/log-plant-import-entity.model';
import { LogPlantImportService } from './log-plant-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogPlantImport])],
  controllers: [],
  providers: [LogPlantImportService],
  exports: [LogPlantImportService],
})
export class LogPlantImportModule {}
