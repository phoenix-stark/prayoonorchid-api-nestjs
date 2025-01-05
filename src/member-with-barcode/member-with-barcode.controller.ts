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
import { MemberWithBarcodeService } from './member-with-barcode.service';
import { MemberWithBarcodeGetByBarcodeInput } from './dto/member-with-barcode-get-by-barcode.input';
import { MemberWithBarcodeDeleteInput } from './dto/member-with-barcode-delete.input';
import { MemberWithBarcodeCreateInput } from './dto/member-with-barcode-create.input';
import { MemberWithBarcodeUpdateInput } from './dto/member-with-barcode-update.input';
import { MemberWithBarcodeSearchInput } from './dto/member-with-barcode-search.input';
import { MemberWithBarcodeGetAllInput } from './dto/member-with-barcode-get-all.input';

@Controller('member-with-barcode')
export class MemberWithBarcodeController {
  constructor(
    private readonly memberWithBarcodeService: MemberWithBarcodeService,
  ) {}

  @Get()
  @HttpCode(200)
  async getByBarcode(
    @Query() input: MemberWithBarcodeGetByBarcodeInput,
  ): Promise<any> {
    return await this.memberWithBarcodeService.getByBarcode(input);
  }

  @Post()
  @HttpCode(200)
  async insertMemberWithBarcode(
    @Body() input: MemberWithBarcodeCreateInput,
  ): Promise<any> {
    return await this.memberWithBarcodeService.insertMemberWithBarcode(input);
  }

  @Put()
  @HttpCode(200)
  async updateMemberWithBarcode(
    @Body() input: MemberWithBarcodeUpdateInput,
  ): Promise<any> {
    return await this.memberWithBarcodeService.updateMemberWithBarcode(input);
  }

  @Get('search')
  @HttpCode(200)
  async searchBarcode(
    @Body() input: MemberWithBarcodeSearchInput,
  ): Promise<any> {
    return await this.memberWithBarcodeService.searchBarcode(input);
  }

  @Get('all')
  @HttpCode(200)
  async getBarcodeAll(
    @Body() input: MemberWithBarcodeGetAllInput,
  ): Promise<any> {
    return await this.memberWithBarcodeService.getBarcodeAll(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteMember(
    @Body() input: MemberWithBarcodeDeleteInput,
  ): Promise<any> {
    return await this.memberWithBarcodeService.deleteMember(input);
  }
}
