import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogToken } from './entity/log-token-entity.model';

@Module({
  imports: [TypeOrmModule.forFeature([LogToken])],
  controllers: [],
  providers: [],
  exports: [],
})
export class LogTokenModule {}
