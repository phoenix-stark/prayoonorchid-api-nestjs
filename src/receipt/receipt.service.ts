import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Repository } from 'typeorm';
import { ReceiptGetInput } from './dto/receipt-get-input';
import { Receipt } from './entity/receipt-entity.model';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
  ) {}

  async getReceipts(input: ReceiptGetInput): Promise<any[]> {
    const receipts = await this.receiptRepository
      .createQueryBuilder('receipt')
      .innerJoinAndMapOne(
        'receipt.family_main_id',
        PlantFamilyMain,
        'plant_family_main',
        'receipt.family_main_id = plant_family_main.id',
      )
      .select('receipt')
      .addSelect('plant_family_main')
      .getRawMany();
    return receipts;
  }
}
