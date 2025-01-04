import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PlantFamilyMainService } from './plant-family-main.service';
import { PlantFamilyMainCreateInput } from './dto/plant-family-main-create.input';
import { PlantFamilyMainUpdateInput } from './dto/plant-family-main-update.input';
import { PlantFamilyMainDeleteInput } from './dto/plant-family-main-delete.input';
import { PlantFamilyMainGetAllInput } from './dto/plant-family-main-get-all.input';
import { PlantFamilyMainGetByIdInput } from './dto/plant-family-main-get-by-id.input';
import { PlantFamilyMainSearchInput } from './dto/plant-family-main-search';

@Controller('plant-family-main')
export class PlantFamilyMainController {
  constructor(
    private readonly plantFamilyMainService: PlantFamilyMainService,
  ) {}

  @Post()
  @HttpCode(200)
  async createPlantFamilyMain(
    @Body() input: PlantFamilyMainCreateInput,
  ): Promise<any[]> {
    return await this.plantFamilyMainService.createPlantFamilyMain(input);
  }

  @Put()
  @HttpCode(200)
  async updatePlantFamilyMain(
    @Body() input: PlantFamilyMainUpdateInput,
  ): Promise<any[]> {
    return await this.plantFamilyMainService.updatePlantFamilyMain(input);
  }

  @Delete()
  @HttpCode(200)
  async deletePlantFamilyMain(
    @Body() input: PlantFamilyMainDeleteInput,
  ): Promise<any[]> {
    return await this.plantFamilyMainService.deletePlantFamilyMain(input);
  }

  @Get('all')
  @HttpCode(200)
  async getPlantFamilyMainAll(
    @Body() input: PlantFamilyMainGetAllInput,
  ): Promise<any[]> {
    return await this.plantFamilyMainService.getPlantFamilyMainAll(input);
  }

  @Get()
  @HttpCode(200)
  async getPlantFamilyMainById(
    @Body() input: PlantFamilyMainGetByIdInput,
  ): Promise<any[]> {
    return await this.plantFamilyMainService.getPlantFamilyMainById(input);
  }

  @Get('search')
  @HttpCode(200)
  async searchPlantFamilyMain(
    @Body() input: PlantFamilyMainSearchInput,
  ): Promise<any[]> {
    return await this.plantFamilyMainService.searchPlantFamilyMain(input);
  }
}
