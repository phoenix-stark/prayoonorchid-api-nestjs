import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodPlant } from './entity/food-plant-entity.model';
import { FoodPlantService } from './food-plant.service';
import { MomentService } from 'src/utils/MomentService';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { LogPlantImportModule } from 'src/log-plant-import/log-plant-import.module';
import { FoodPlantController } from './food-plant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodPlant]),
    LogTokenModule,
    LogPlantImportModule,
  ],
  controllers: [FoodPlantController],
  providers: [FoodPlantService, MomentService],
  exports: [FoodPlantService],
})
export class FoodPlantModule {}
