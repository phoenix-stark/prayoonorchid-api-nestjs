import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { LogRemoveCreateEditInput } from './dto/log-remove-edit-create.input';
import { LogPlantRemoveEditService } from './log-plant-remove-edit.service';
import { LogRemoveEditGetInput } from './dto/log-remove-edit-get.input';

@Controller('log-plant-remove-edit')
export class LogPlantRemoveEditController {
  constructor(
    private readonly logPlantRemoveEditService: LogPlantRemoveEditService,
  ) {}

  @Post()
  @HttpCode(200)
  async insertLogPlantRemoveEdit(
    @Body() input: LogRemoveCreateEditInput,
  ): Promise<any> {
    return await this.logPlantRemoveEditService.insertLogPlantRemoveEdit(input);
  }

  @Get()
  @HttpCode(200)
  async getLogPlantRemoveEdit(
    @Query() input: LogRemoveEditGetInput,
  ): Promise<any> {
    return await this.logPlantRemoveEditService.getLogPlantRemoveEdit(input);
  }
}
