import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LogPlantImportNow } from 'src/log_plant_import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from 'src/log_plant_remove/entity/log-plant-remove-now-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(LogPlantImportNow)
    private readonly logPlantImportNowRepository: Repository<LogPlantImportNow>,
    @InjectRepository(LogPlantRemoveNow)
    private readonly logPlantRemoveNowRepository: Repository<LogPlantRemoveNow>,
    private momentWrapper: MomentService,
  ) {}

  @Cron('0 0 * * * *')
  async handleCron() {
    console.log('Called when 00:00');
    const logImportNow = await this.logPlantImportNowRepository
      .createQueryBuilder()
      .where('create_at <= :currentDate', {
        currentDate: this.momentWrapper
          .moment()
          .add(-90, 'days')
          .format('YYYY-MM-DD'),
      })
      .getMany();
    const logRemovetNow = await this.logPlantRemoveNowRepository
      .createQueryBuilder()
      .where('create_at <= :currentDate', {
        currentDate: this.momentWrapper
          .moment()
          .add(-90, 'days')
          .format('YYYY-MM-DD'),
      })
      .getMany();
    console.log(
      'DATE: ' +
        this.momentWrapper.moment().add(-90, 'days').format('YYYY-MM-DD'),
    );
    console.log('logImportNow: ' + logImportNow.length);
    console.log('logRemovetNow: ' + logRemovetNow.length);
  }
}
