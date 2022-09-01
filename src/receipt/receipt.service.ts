import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { createQueryBuilder, Repository } from 'typeorm';
import { ReceiptGetInput } from './dto/receipt-get-input';
import { Receipt } from './entity/receipt-entity.model';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(PlantFamilyMain)
    private readonly plantFamilyMainRepository: Repository<PlantFamilyMain>,
  ) {}

  async getReceipts(input: ReceiptGetInput): Promise<any[]> {
    // receipts = await this.receiptRepository.find();
    const receipts = await createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.family_main_id', 'plant_family_main')
      .getMany();
    return receipts;
  }
}
