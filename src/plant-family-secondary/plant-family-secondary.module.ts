import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogTokenModule } from 'src/log_token/log-token.module';
import { MomentService } from 'src/utils/MomentService';
import { PlantFamilySecondary } from './entity/plant-family-secondary-entity.model';
import { PlantFamilySecondaryService } from './plant-family-secondary.service';
import { PlantFamilySecondaryController } from './plant-family-secondary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlantFamilySecondary]), LogTokenModule],
  controllers: [PlantFamilySecondaryController],
  providers: [PlantFamilySecondaryService, MomentService],
  exports: [PlantFamilySecondaryService],
})
export class PlantFamilySecondaryModule {}
