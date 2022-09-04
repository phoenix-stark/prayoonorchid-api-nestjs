import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogPlantRemove } from './entity/log-plant-remove-entity.model';

@Injectable()
export class LogPlantRemoveService {
  constructor(
    @InjectRepository(LogPlantRemove)
    private readonly logPlantRemoveRepository: Repository<LogPlantRemove>,
  ) {}

  async getReceipts(): Promise<any[]> {
    return await this.logPlantRemoveRepository.find();
  }
}
