import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesWorkMainType } from './entity/sources-work-main-type-entity.model';

@Module({
  imports: [TypeOrmModule.forFeature([SourcesWorkMainType])],
  controllers: [],
  providers: [],
  exports: [],
})
export class SourcesWorkMainTypeModule {}
