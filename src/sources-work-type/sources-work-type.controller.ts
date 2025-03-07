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
import { SourcesWorkTypeService } from './sources-work-type.service';
import { SourcesWorkTypeCreateInput } from './dto/sources-work-type-create.input';
import { SourcesWorkTypeDeleteInput } from './dto/sources-work-type-delete.input';
import { SourcesWorkTypeGetAllInput } from './dto/sources-work-type-get-all.input';
import { SourcesWorkTypeGetByIdInput } from './dto/sources-work-type-get-by-id.input';
import { SourcesWorkTypeSearchInput } from './dto/sources-work-type-search';
import { SourcesWorkTypeUpdateInput } from './dto/sources-work-type-update.input';

@Controller('sources-work-type')
export class SourcesWorkTypeController {
  constructor(
    private readonly sourcesWorkTypeService: SourcesWorkTypeService,
  ) {}

  @Post()
  @HttpCode(200)
  async createSourcesWorkType(
    @Body() input: SourcesWorkTypeCreateInput,
  ): Promise<any[]> {
    return await this.sourcesWorkTypeService.createSourcesWorkType(input);
  }

  @Put()
  @HttpCode(200)
  async updateSourcesWorkType(
    @Body() input: SourcesWorkTypeUpdateInput,
  ): Promise<any[]> {
    return await this.sourcesWorkTypeService.updateSourcesWorkType(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteSourcesWorkType(
    @Body() input: SourcesWorkTypeDeleteInput,
  ): Promise<any[]> {
    return await this.sourcesWorkTypeService.deleteSourcesWorkType(input);
  }

  @Get('all')
  @HttpCode(200)
  async getSourcesWorkTypeAll(
    @Query() input: SourcesWorkTypeGetAllInput,
  ): Promise<any[]> {
    return await this.sourcesWorkTypeService.getSourcesWorkTypeAll(input);
  }

  @Get()
  @HttpCode(200)
  async getSourcesWorkTypeById(
    @Query() input: SourcesWorkTypeGetByIdInput,
  ): Promise<any[]> {
    return await this.sourcesWorkTypeService.getSourcesWorkTypeById(input);
  }

  @Get('search')
  @HttpCode(200)
  async searchSourcesWorkType(
    @Query() input: SourcesWorkTypeSearchInput,
  ): Promise<any[]> {
    return await this.sourcesWorkTypeService.searchSourcesWorkType(input);
  }

  @Get('search/word')
  @HttpCode(200)
  async searchSourcesWorkTypeWord(
    @Query() input: SourcesWorkTypeSearchInput,
  ): Promise<any[]> {
    return await this.sourcesWorkTypeService.searchSourcesWorkTypeWord(input);
  }
}
