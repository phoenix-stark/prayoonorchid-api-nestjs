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
import { LogTokenService } from 'src/log_token/log-token.service';
import { LogTokenGetInput } from 'src/log_token/dto/log-token-get.input';
import { ReceiptService } from 'src/receipt/receipt.service';
import { ReceiptGetTotalByCustomerIdInput } from 'src/receipt/dto/receipt-get-total-by-customer-id';

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

    const customerEntities = await this.customerRepository.find({
      order: {
        name: 'ASC',
      },
    });

    return {
      code: 200,
      data: customerEntities,
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
        { name: Like(`%${input.word}%`) },
        { code: Like(`%${input.word}%`) },
      ],
      order: {
        name: 'ASC',
      },
    });

    return {
      code: 200,
      data: customerEntities,
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
}
