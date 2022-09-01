import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Repository } from 'typeorm';
import { Customer } from './entity/customer-entity.model';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getReceipts(): Promise<any[]> {
    return [];
  }
}
