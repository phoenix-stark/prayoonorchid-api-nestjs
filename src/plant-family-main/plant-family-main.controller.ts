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

@Controller('PlantFamilyMain')
export class PlantFamilyMainController {
  constructor(
    private readonly plantFamilyMainService: PlantFamilyMainService,
  ) {}

  @Get()
  @HttpCode(200)
  async getContributors(): Promise<any[]> {
    return await this.plantFamilyMainService.getReceipts();
  }
}
