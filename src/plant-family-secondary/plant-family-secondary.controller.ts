import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { PlantFamilySecondaryService } from './plant-family-secondary.service';
import { PlantFamilySecondaryCreateInput } from './dto/plant-family-secondary-create.input';
import { PlantFamilySecondaryGetAllInput } from './dto/plant-family-secondary-get-all.input';
import { PlantFamilySecondaryGetByIdInput } from './dto/plant-family-secondary-get-by-id.input';

@Controller('plant-family-secondary')
export class PlantFamilySecondaryController {
  constructor(
    private readonly plantFamilySecondaryService: PlantFamilySecondaryService,
  ) {}

  @Post()
  @HttpCode(200)
  async createPlantFamilySecondary(
    @Body() input: PlantFamilySecondaryCreateInput,
  ): Promise<any[]> {
    return await this.plantFamilySecondaryService.createPlantFamilySecondary(
      input,
    );
  }

  @Get('all')
  @HttpCode(200)
  async getPlantFamilySecondaryAll(
    @Body() input: PlantFamilySecondaryGetAllInput,
  ): Promise<any[]> {
    return await this.plantFamilySecondaryService.getPlantFamilySecondaryAll(
      input,
    );
  }

  @Get()
  @HttpCode(200)
  async getPlantFamilySecondaryById(
    @Body() input: PlantFamilySecondaryGetByIdInput,
  ): Promise<any[]> {
    return await this.plantFamilySecondaryService.getPlantFamilySecondaryById(
      input,
    );
  }
}
