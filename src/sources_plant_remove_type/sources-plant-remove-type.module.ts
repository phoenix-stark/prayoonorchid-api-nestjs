import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesPlantRemoveType } from './entity/sources-plant-remove-type-entity.model';

@Module({
  imports: [TypeOrmModule.forFeature([SourcesPlantRemoveType])],
  controllers: [],
  providers: [],
  exports: [],
})
export class SourcesPlantRemoveTypeModule {}
