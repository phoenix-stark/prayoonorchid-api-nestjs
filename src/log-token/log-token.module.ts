import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogToken } from './entity/log-token-entity.model';
import { LogTokenService } from './log-token.service';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [TypeOrmModule.forFeature([LogToken])],
  controllers: [],
  providers: [LogTokenService, MomentService],
  exports: [LogTokenService],
})
export class LogTokenModule {}
