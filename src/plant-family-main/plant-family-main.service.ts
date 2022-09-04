import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Repository } from 'typeorm';

@Injectable()
export class PlantFamilyMainService {
  constructor(
    @InjectRepository(PlantFamilyMain)
    private readonly plantFamilyMainRepository: Repository<PlantFamilyMain>,
  ) {}

  async getReceipts(): Promise<any[]> {
    return await this.plantFamilyMainRepository.find();
  }
}
