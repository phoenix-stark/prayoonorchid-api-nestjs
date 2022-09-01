import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantFamilyMain } from './entity/plant-family-main-entity.model';

@Module({
  imports: [TypeOrmModule.forFeature([PlantFamilyMain])],
  controllers: [],
  providers: [],
  exports: [],
})
export class PlantFamilyMainModule {}
