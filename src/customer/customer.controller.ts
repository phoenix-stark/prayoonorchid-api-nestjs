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
import { CustomerService } from './customer.service';
import { CustomerCreateInput } from './dto/customer-create.input';
import { CustomerUpdateInput } from './dto/customer-update.input';
import { CustomerDeleteInput } from './dto/customer-delete.input';
import { CustomerGetAllInput } from './dto/customer-get-all.input';
import { CustomerGetByIdInput } from './dto/customer-get-by-id.input';
import { CustomerSearchInput } from './dto/customer-search';
import { CustomerSearchWordInput } from './dto/customer-search-word';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(200)
  async createCustomer(@Body() input: CustomerCreateInput): Promise<any[]> {
    return await this.customerService.createCustomer(input);
  }

  @Put()
  @HttpCode(200)
  async updateCustomer(@Body() input: CustomerUpdateInput): Promise<any[]> {
    return await this.customerService.updateCustomer(input);
  }

  @Delete()
  @HttpCode(200)
  async deleteCustomer(@Body() input: CustomerDeleteInput): Promise<any[]> {
    return await this.customerService.deleteCustomer(input);
  }

  @Get('all')
  @HttpCode(200)
  async getCustomerAll(@Query() input: CustomerGetAllInput): Promise<any[]> {
    return await this.customerService.getCustomerAll(input);
  }

  @Get()
  @HttpCode(200)
  async getCustomerById(@Query() input: CustomerGetByIdInput): Promise<any[]> {
    return await this.customerService.getCustomerById(input);
  }

  @Get('search')
  @HttpCode(200)
  async searchCustomer(@Query() input: CustomerSearchInput): Promise<any[]> {
    return await this.customerService.searchCustomer(input);
  }

  @Get('search/word')
  @HttpCode(200)
  async searchCustomerWord(
    @Query() input: CustomerSearchWordInput,
  ): Promise<any[]> {
    return await this.customerService.searchCustomerWord(input);
  }
}
