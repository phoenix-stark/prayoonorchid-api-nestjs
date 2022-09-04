import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    const receipts = await this.receiptRepository.find();
    return receipts;
  }
}
