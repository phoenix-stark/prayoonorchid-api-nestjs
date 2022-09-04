import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesWorkType } from './entity/sources-work-type-entity.model';

@Module({
  imports: [TypeOrmModule.forFeature([SourcesWorkType])],
  controllers: [],
  providers: [],
  exports: [],
})
export class SourcesWorkTypeModule {}
