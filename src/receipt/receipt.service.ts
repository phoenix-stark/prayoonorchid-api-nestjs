import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Repository } from 'typeorm';
import { ReceiptGetInput } from './dto/receipt-get-input';
import { Receipt } from './entity/receipt-entity.model';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(PlantFamilyMain)
    private readonly plantFamilyMainRepository: Repository<PlantFamilyMain>,
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
}
