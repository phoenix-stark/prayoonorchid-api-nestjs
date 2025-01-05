import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberWithBarcode } from './entity/member-with-barcode-entity.model';
import { MemberWithBarcodeController } from './member-with-barcode.controller';
import { MemberWithBarcodeService } from './member-with-barcode.service';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [TypeOrmModule.forFeature([MemberWithBarcode]), LogTokenModule],
  controllers: [MemberWithBarcodeController],
  providers: [MemberWithBarcodeService, MomentService],
  exports: [MemberWithBarcodeService],
})
export class MemberWithBarcodeModule {}
