import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesGrant } from './entity/sources-grant-entity.model';
import { SourcesGrantService } from './sources-grant.service';

@Module({
  imports: [TypeOrmModule.forFeature([SourcesGrant])],
  controllers: [],
  providers: [SourcesGrantService],
  exports: [SourcesGrantService],
})
export class SourcesGrantModule {}
