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
import { FoodPlantService } from './food-plant.service';
import { FoodPlantCreateInput } from './dto/food-plant-create.input';
import { FoodPlantUpdateInput } from './dto/food-plant-update.input';
import { FoodPlantDeleteInput } from './dto/food-plant-delete.input';
import { FoodPlantGetAllInput } from './dto/food-plant-get-all.input';
import { FoodPlantGetByIdInput } from './dto/food-plant-get-by-id.input';
import { FoodPlantSearchInput } from './dto/food-plant-search';

@Controller('food-plant')
export class FoodPlantController {
  constructor(private readonly foodPlantService: FoodPlantService) {}

  @Post()
  @HttpCode(200)
  async createFoodPlant(@Body() input: FoodPlantCreateInput): Promise<any[]> {
    return await this.foodPlantService.createFoodPlant(input);
  }

  @Put()
  @HttpCode(200)
  async updateFoodPlant(@Body() input: FoodPlantUpdateInput): Promise<any[]> {
    return await this.foodPlantService.updateFoodPlant(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteFoodPlant(@Body() input: FoodPlantDeleteInput): Promise<any[]> {
    return await this.foodPlantService.deleteFoodPlant(input);
  }

  @Get('all')
  @HttpCode(200)
  async getFoodPlantAll(@Body() input: FoodPlantGetAllInput): Promise<any[]> {
    return await this.foodPlantService.getFoodPlantAll(input);
  }

  @Get()
  @HttpCode(200)
  async getFoodPlantById(@Body() input: FoodPlantGetByIdInput): Promise<any[]> {
    return await this.foodPlantService.getFoodPlantById(input);
  }

  @Get('search')
  @HttpCode(200)
  async searchFoodPlant(@Body() input: FoodPlantSearchInput): Promise<any[]> {
    return await this.foodPlantService.searchFoodPlant(input);
  }
}
