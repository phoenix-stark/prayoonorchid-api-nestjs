import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesGrant } from './entity/sources-grant-entity.model';
import { SourcesGrantService } from './sources-grant.service';
import { LogTokenModule } from 'src/log_token/log-token.module';
import { SourcesGrantController } from './sources-grant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SourcesGrant]), LogTokenModule],
  controllers: [SourcesGrantController],
  providers: [SourcesGrantService],
  exports: [SourcesGrantService],
})
export class SourcesGrantModule {}
