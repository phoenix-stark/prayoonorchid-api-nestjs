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

  @Delete()
  @HttpCode(200)
  async deleteMember(
    @Body() input: MemberWithBarcodeDeleteInput,
  ): Promise<any> {
    return await this.memberWithBarcodeService.deleteMember(input);
  }
}
