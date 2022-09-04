import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogPlantImport } from './entity/log-plant-import-entity.model';

@Injectable()
export class LogPlantImportService {
  constructor(
    @InjectRepository(LogPlantImport)
    private readonly logPlantImportRepository: Repository<LogPlantImport>,
  ) {}

  async getReceipts(): Promise<any[]> {
    return await this.logPlantImportRepository.find();
  }
}
