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
import { SourcesWorkMainTypeService } from './sources-work-main-type.service';
import { SourcesWorkMainTypeCreateInput } from './dto/sources-work-main-type-create.input';
import { SourcesWorkMainTypeUpdateInput } from './dto/sources-work-main-type-update.input';
import { SourcesWorkMainTypeDeleteInput } from './dto/sources-work-main-type-delete.input';
import { SourcesWorkMainTypeGetAllInput } from './dto/sources-work-main-type-get-all.input';
import { SourcesWorkMainTypeGetByIdInput } from './dto/sources-work-main-type-get-by-id.input';
import { SourcesWorkMainTypeSearchInput } from './dto/sources-work-main-type-search';

@Controller('sources-work-main-type')
export class SourcesWorkMainTypeController {
  constructor(
    private readonly sourcesWorkMainTypeService: SourcesWorkMainTypeService,
  ) {}

  @Post()
  @HttpCode(200)
  async createSourcesWorkMainType(
    @Body() input: SourcesWorkMainTypeCreateInput,
  ): Promise<any[]> {
    return await this.sourcesWorkMainTypeService.createSourcesWorkMainType(
      input,
    );
  }

  @Put()
  @HttpCode(200)
  async updateSourcesWorkMainType(
    @Body() input: SourcesWorkMainTypeUpdateInput,
  ): Promise<any[]> {
    return await this.sourcesWorkMainTypeService.updateSourcesWorkMainType(
      input,
    );
  }

  @Delete()
  @HttpCode(200)
  async deleteSourcesWorkMainType(
    @Body() input: SourcesWorkMainTypeDeleteInput,
  ): Promise<any[]> {
    return await this.sourcesWorkMainTypeService.deleteSourcesWorkMainType(
      input,
    );
  }

  @Get('all')
  @HttpCode(200)
  async getSourcesWorkMainTypeAll(
    @Query() input: SourcesWorkMainTypeGetAllInput,
  ): Promise<any[]> {
    return await this.sourcesWorkMainTypeService.getSourcesWorkMainTypeAll(
      input,
    );
  }

  @Get()
  @HttpCode(200)
  async getSourcesWorkMainTypeById(
    @Query() input: SourcesWorkMainTypeGetByIdInput,
  ): Promise<any[]> {
    return await this.sourcesWorkMainTypeService.getSourcesWorkMainTypeById(
      input,
    );
  }

  @Get('search')
  @HttpCode(200)
  async searchSourcesWorkMainType(
    @Query() input: SourcesWorkMainTypeSearchInput,
  ): Promise<any[]> {
    return await this.sourcesWorkMainTypeService.searchSourcesWorkMainType(
      input,
    );
  }
}
