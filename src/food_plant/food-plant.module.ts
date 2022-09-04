import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodPlant } from './entity/food-plant-entity.model';

@Module({
  imports: [TypeOrmModule.forFeature([FoodPlant])],
  controllers: [],
  providers: [],
  exports: [],
})
export class FoodPlantModule {}
