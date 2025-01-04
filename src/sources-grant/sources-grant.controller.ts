import { Body, Controller, Get, HttpCode } from '@nestjs/common';
import { SourcesGrantService } from './sources-grant.service';
import { SourcesGrantGetAllInput } from './dto/sources-grant-get-all.input';

@Controller('sources-grant')
export class SourcesGrantController {
  constructor(private readonly sourcesGrantService: SourcesGrantService) {}

  @Get('all')
  @HttpCode(200)
  async getSourcesGrantAll(
    @Body() input: SourcesGrantGetAllInput,
  ): Promise<any[]> {
    return await this.sourcesGrantService.getAll(input);
  }
}
