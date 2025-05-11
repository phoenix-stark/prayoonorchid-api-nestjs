import { Body, Controller, Get, HttpCode, Query } from '@nestjs/common';
import { SourcesPlantRemoveTypeService } from './sources-plant-remove-type.service';
import { SourcesPlantRemoveTypeGetAllInput } from './dto/sources-plant-remove-type-get-all.input';
import { SourcesPlantRemoveTypeGetByIdInput } from './dto/sources-plant-remove-type-get-by-id.input';

@Controller('sources-plant-remove-type')
export class SourcesPlantRemoveTypeController {
  constructor(
    private readonly sourcesPlantRemoveTypeService: SourcesPlantRemoveTypeService,
  ) {}

  @Get('all')
  @HttpCode(200)
  async getSourcesWorkTypeAll(
    @Query() input: SourcesPlantRemoveTypeGetAllInput,
  ): Promise<any[]> {
    return await this.sourcesPlantRemoveTypeService.getSourcesWorkTypeAll(
      input,
    );
  }

  @Get()
  @HttpCode(200)
  async getSourcesPlantRemoveTypeById(
    @Query() input: SourcesPlantRemoveTypeGetByIdInput,
  ): Promise<any[]> {
    return await this.sourcesPlantRemoveTypeService.getSourcesPlantRemoveTypeById(
      input,
    );
  }
}
