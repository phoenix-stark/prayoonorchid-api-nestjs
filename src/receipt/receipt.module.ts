import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Receipt } from './entity/receipt-entity.model';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { Member } from 'src/member/entity/member-entity.model';
import { LogToken } from 'src/log_token/entity/log-token-entity.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Receipt,
      Customer,
      PlantFamilyMain,
      Member,
      LogToken,
    ]),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
