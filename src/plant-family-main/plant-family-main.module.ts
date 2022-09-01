import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantFamilyMain } from './entity/plant-family-main-entity.model';
import { PlantFamilyMainService } from './plant-family-main.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlantFamilyMain])],
  controllers: [],
  providers: [PlantFamilyMainService],
  exports: [PlantFamilyMainService],
})
export class PlantFamilyMainModule {}
