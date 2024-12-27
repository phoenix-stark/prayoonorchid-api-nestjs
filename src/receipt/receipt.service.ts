import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Repository } from 'typeorm';
import { ReceiptGetInput } from './dto/receipt-get-input';
import { Receipt } from './entity/receipt-entity.model';
import { ReceiptDeleteInput } from './dto/receipt-delete-input';
import { LogToken } from 'src/log_token/entity/log-token-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { ReceiptGetTotalByCustomerIdInput } from './dto/receipt-get-total-by-customer-id';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(LogToken)
    private readonly logTokenRepository: Repository<LogToken>,
  ) {}

  async getReceipts(input: ReceiptGetInput): Promise<any[]> {
    console.log('getReceipts:');
    const sql = await this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoin(
        PlantFamilyMain,
        'plant_family_main',
        'receipt.family_main_id = plant_family_main.id',
      )
      .leftJoin(
        Customer,
        'customer',
        'receipt.customer_id = customer.customer_id',
      )
      .select('receipt')
      .addSelect(['plant_family_main.description'])
      .addSelect(['customer.name'])
      .orderBy('receipt.code', 'ASC');

    const receipts = sql.getRawMany();
    const sqlStr = await sql.getSql();
    console.log('sqlStr:');
    console.log(sqlStr);

    return receipts;
  }

  async deleteReceipt(input: ReceiptDeleteInput): Promise<any> {
    // Check Member
    let memberEntity = null;
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity) {
      return {
        code: 400,
        message: 'Username นี้ ถูก Block',
      };
    } else {
      memberEntity = await this.memberRepository.findOne({
        where: {
          member_id: logTokenEntity.member_id,
        },
      });
      if (!memberEntity || memberEntity.is_block === '1') {
        return {
          code: 400,
          message: 'Username นี้ ถูก Block',
        };
      }
    }

    // ss
    await this.receiptRepository
      .createQueryBuilder()
      .where('receipt_id = :receipt_id', { receipt_id: input.receipt_id })
      .delete()
      .execute();
    return {
      data: {
        code: 200,
      },
    };
  }

  async getReceiptTotalByCustomer(
    input: ReceiptGetTotalByCustomerIdInput,
  ): Promise<any> {
    const results = await this.receiptRepository.find({
      where: {
        customer_id: input.customer_id,
      },
    });

    return results.length;
  }
}
