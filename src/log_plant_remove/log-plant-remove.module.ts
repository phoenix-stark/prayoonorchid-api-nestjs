import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogPlantRemove } from './entity/log-plant-remove-entity.model';
import { LogPlantRemoveService } from './log-plant-remove.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogPlantRemove])],
  controllers: [],
  providers: [LogPlantRemoveService],
  exports: [LogPlantRemoveService],
})
export class LogPlantRemoveModule {}
