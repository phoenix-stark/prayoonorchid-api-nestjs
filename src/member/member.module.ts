import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entity/member-entity.model';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  controllers: [],
  providers: [],
  exports: [],
})
export class MemberModule {}
