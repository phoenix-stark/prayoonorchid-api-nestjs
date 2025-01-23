import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receipt } from './entity/receipt-entity.model';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { PlantFamilyMainModule } from 'src/plant-family-main/plant-family-main.module';
import { PlantFamilySecondaryModule } from 'src/plant-family-secondary/plant-family-secondary.module';
import { MomentService } from 'src/utils/MomentService';
import { LogPlantImportModule } from 'src/log-plant-import/log-plant-import.module';
import { LogPlantRemoveModule } from 'src/log-plant-remove/log-plant-remove.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt]),
    LogTokenModule,
    forwardRef(() => PlantFamilyMainModule),
    forwardRef(() => PlantFamilySecondaryModule),
    forwardRef(() => LogPlantImportModule),
    forwardRef(() => LogPlantRemoveModule),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService, MomentService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
