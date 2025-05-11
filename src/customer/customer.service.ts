import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Customer } from './entity/customer-entity.model';
import { CustomerCreateInput } from './dto/customer-create.input';
import { CustomerUpdateInput } from './dto/customer-update.input';
import { CustomerDeleteInput } from './dto/customer-delete.input';
import { CustomerGetAllInput } from './dto/customer-get-all.input';
import { CustomerGetByIdInput } from './dto/customer-get-by-id.input';
import { CustomerSearchInput } from './dto/customer-search';
import { MomentService } from 'src/utils/MomentService';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { ReceiptService } from 'src/receipt/receipt.service';
import { ReceiptGetTotalByCustomerIdInput } from 'src/receipt/dto/receipt-get-total-by-customer-id-input';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
import { CustomerSearchWordInput } from './dto/customer-search-word';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private logTokenService: LogTokenService,
    private receiptService: ReceiptService,
    private momentWrapper: MomentService,
  ) {}

  async createCustomer(input: CustomerCreateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const customerId = this.generateRandomString(50);
    const customerEntity = new Customer();
    customerEntity.customer_id = customerId;
    customerEntity.code = '';
    customerEntity.name = input.name;
    customerEntity.address = input.address;
    customerEntity.email = input.email;
    customerEntity.phone = input.phone;
    customerEntity.is_del = 0;
    customerEntity.create_at = updateAt;
    customerEntity.update_at = updateAt;
    await this.customerRepository.save(customerEntity);

    return {
      code: 200,
      data: {
        data: {
          customer_id: customerId,
        },
      },
    };
  }

  async updateCustomer(input: CustomerUpdateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const customerEntity = await this.customerRepository.findOne({
      where: {
        customer_id: input.id,
      },
    });
    if (!customerEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'ไม่พบลูกค้าในระบบ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    customerEntity.name = input.name;
    customerEntity.address = input.address;
    customerEntity.email = input.email;
    customerEntity.phone = input.phone;
    customerEntity.update_at = updateAt;
    await this.customerRepository.save(customerEntity);

    return {
      code: 200,
      data: {
        data: {
          customer_id: input.id,
        },
      },
    };
  }

  async deleteCustomer(input: CustomerDeleteInput): Promise<any> {
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    //
    const totalReceipt = await this.receiptService.getReceiptTotalByCustomer({
      customer_id: input.id,
    } as ReceiptGetTotalByCustomerIdInput);
    if (totalReceipt > 0) {
      return {
        code: 200,
        data: {
          data: {
            total: totalReceipt,
          },
        },
      };
    } else {
      await this.customerRepository
        .createQueryBuilder()
        .delete()
        .where({ customer_id: input.id })
        .execute();
      return {
        code: 200,
        data: {},
      };
    }
  }

  async getCustomerAll(input: CustomerGetAllInput): Promise<any> {
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = this.customerRepository.createQueryBuilder('customer');

    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const queryTotal = query;

    const resultTotal = await queryTotal
      .select('COUNT(*)', 'total')
      .getRawOne();

    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    query.select(['customer']).orderBy('name', 'ASC').getRawMany();

    const result = await query.getRawMany();
    const customerEntities = result.map((row: any) => ({
      customer_id: row.customer_customer_id,
      code: row.customer_code,
      name: row.customer_name,
      is_del: row.customer_is_del,
      update_at: row.customer_update_at,
      create_at: row.customer_create_at,
      address: row.customer_address,
      phone: row.customer_phone,
      email: row.customer_email,
    }));

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: customerEntities,
      },
    };
  }

  async getCustomerById(input: CustomerGetByIdInput): Promise<any> {
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const customerEntities = await this.customerRepository.findOne({
      where: {
        customer_id: input.id,
      },
    });

    return {
      code: 200,
      data: customerEntities,
    };
  }

  async searchCustomer(input: CustomerSearchInput): Promise<any> {
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const customerEntities = await this.customerRepository.find({
      where: [
        { name: Like('%' + input.word + '%') },
        { code: Like('%' + input.word + '%') },
      ],
    });

    return {
      code: 200,
      data: customerEntities,
    };
  }

  async searchCustomerWord(input: CustomerSearchWordInput): Promise<any> {
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = this.customerRepository
      .createQueryBuilder('customer')
      .where('name LIKE :name', { name: `%${input.word}%` })
      .orWhere('name LIKE :code', { code: `%${input.word}%` });

    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const queryTotal = query;

    const resultTotal = await queryTotal
      .select('COUNT(*)', 'total')
      .getRawOne();

    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    query.select(['customer']).orderBy('name', 'ASC').getRawMany();

    const result = await query.getRawMany();
    const customerEntities = result.map((row: any) => ({
      customer_id: row.customer_customer_id,
      code: row.customer_code,
      name: row.customer_name,
      is_del: row.customer_is_del,
      update_at: row.customer_update_at,
      create_at: row.customer_create_at,
      address: row.customer_address,
      phone: row.customer_phone,
      email: row.customer_email,
    }));

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: customerEntities,
      },
    };
  }

  generateRandomString(length = 10): string {
    const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let randomString = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      randomString += characters[randomIndex];
    }

    return randomString;
  }

  getStartIndexPage = (page: number, limit_per_page: number) => {
    return (page - 1) * limit_per_page;
  };
}
