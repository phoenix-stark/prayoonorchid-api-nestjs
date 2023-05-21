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
import { LogPlantRemoveService } from './log-plant-remove.service';
import { LogRemoveCreateInput } from './dto/log-remove-create.input';
import { LogRemoveDeleteInput } from './dto/log-remove-delete.input';
import { LogRemoveUpdateInput } from './dto/log-remove-update.input';
import { LogRemoveUpdateAllInput } from './dto/log-remove-update-all.input';

@Controller('log-plant-remove')
export class LogPlantRemoveController {
  constructor(private readonly logPlantRemoveService: LogPlantRemoveService) {}

  @Post()
  @HttpCode(200)
  async insertBarcode(@Body() input: LogRemoveCreateInput): Promise<any> {
    return await this.logPlantRemoveService.insertBarcode(input);
  }

  @Put()
  @HttpCode(200)
  async updateBarcode(@Body() input: LogRemoveUpdateInput): Promise<any> {
    return await this.logPlantRemoveService.updateBarcode(input);
  }

  @Put('all')
  @HttpCode(200)
  async updateBarcodeAll(@Body() input: LogRemoveUpdateAllInput): Promise<any> {
    return await this.logPlantRemoveService.updateBarcodeAll(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteBarcode(@Body() input: LogRemoveDeleteInput): Promise<any> {
    return await this.logPlantRemoveService.deleteBarcode(input);
  }
}
