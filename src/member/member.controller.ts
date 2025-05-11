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
import { MemberService } from './member.service';
import { MemberAuthInput } from './dto/member-auth.input';
import { MemberUpdatePasswordInput } from './dto/member-update-password.input';
import { MemberCreateInput } from './dto/member-create.input';
import { MemberUpdateInput } from './dto/member-update.input';
import { MemberUpdateBlockInput } from './dto/member-update-block.input';
import { MemberGetAllInput } from './dto/member-get-all';
import { MemberGetByIdInput } from './dto/member-get-by-id.input';
import { MemberSearchInput } from './dto/member-search.input';
import { MemberResetPasswordInput } from './dto/member-reset-password.input';
import { MemberSearchWordInput } from './dto/member-search-word.input';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @HttpCode(200)
  async createMember(@Body() input: MemberCreateInput): Promise<any[]> {
    return await this.memberService.createMember(input);
  }

  @Put()
  @HttpCode(200)
  async updateMember(@Body() input: MemberUpdateInput): Promise<any[]> {
    return await this.memberService.updateMember(input);
  }

  @Get('all')
  @HttpCode(200)
  async getMemberAll(@Query() input: MemberGetAllInput): Promise<any[]> {
    return await this.memberService.getMemberAll(input);
  }

  @Get()
  @HttpCode(200)
  async getMemberById(@Query() input: MemberGetByIdInput): Promise<any[]> {
    return await this.memberService.getMemberById(input);
  }

  @Get('search')
  @HttpCode(200)
  async searchMember(@Query() input: MemberSearchInput): Promise<any[]> {
    return await this.memberService.searchMember(input);
  }

  @Get('search/id')
  @HttpCode(200)
  async searchMemberId(@Query() input: MemberSearchInput): Promise<any[]> {
    return await this.memberService.searchMemberId(input);
  }

  @Get('search/word')
  @HttpCode(200)
  async searchMemberWord(
    @Query() input: MemberSearchWordInput,
  ): Promise<any[]> {
    return await this.memberService.searchMemberWord(input);
  }

  @Put('block')
  @HttpCode(200)
  async updateMemberBlock(
    @Body() input: MemberUpdateBlockInput,
  ): Promise<any[]> {
    return await this.memberService.updateMemberBlock(input);
  }

  @Post('auth')
  @HttpCode(200)
  async auth(@Body() input: MemberAuthInput): Promise<any[]> {
    return await this.memberService.auth(input);
  }

  @Put('change-password')
  @HttpCode(200)
  async changePassword(
    @Body() input: MemberUpdatePasswordInput,
  ): Promise<any[]> {
    return await this.memberService.changePassword(input);
  }

  @Put('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() input: MemberResetPasswordInput): Promise<any[]> {
    return await this.memberService.resetPassword(input);
  }

  @Post('update-password-all')
  @HttpCode(200)
  async updatePasswordMemberAll(): Promise<any[]> {
    return await this.memberService.updatePasswordMemberAll();
  }
}
