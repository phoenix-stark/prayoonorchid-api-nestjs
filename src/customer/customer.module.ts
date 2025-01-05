import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { Customer } from './entity/customer-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    LogTokenModule,
    ReceiptModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService, MomentService],
  exports: [CustomerService],
})
export class CustomerModule {}
