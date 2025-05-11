import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entity/member-entity.model';
import { LogTokenModule } from 'src/log-token/log-token.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { SourcesGrantModule } from 'src/sources-grant/sources-grant.module';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    LogTokenModule,
    SourcesGrantModule,
  ],
  controllers: [MemberController],
  providers: [MemberService, MomentService],
  exports: [MemberService],
})
export class MemberModule {}
