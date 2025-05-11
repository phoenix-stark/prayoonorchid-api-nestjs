import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantFamilyMain } from './entity/plant-family-main-entity.model';
import { PlantFamilyMainController } from './plant-family-main.controller';
import { PlantFamilyMainService } from './plant-family-main.service';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { MomentService } from 'src/utils/MomentService';
import { ReceiptModule } from 'src/receipt/receipt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantFamilyMain]),
    forwardRef(() => LogTokenModule),
    forwardRef(() => ReceiptModule),
  ],
  controllers: [PlantFamilyMainController],
  providers: [PlantFamilyMainService, MomentService],
  exports: [PlantFamilyMainService],
})
export class PlantFamilyMainModule {}
