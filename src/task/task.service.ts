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

  @Cron('0 1 * * *')
  async handleCron() {
    console.log('Called when 01:00');
    const logRemovetNow = await this.logPlantRemoveNowRepository
      .createQueryBuilder()
      .where('create_at <= :currentDate', {
        currentDate: this.momentWrapper
          .moment()
          .add(-30, 'days')
          .format('YYYY-MM-DD'),
      })
      .getMany();
    const total = logRemovetNow.length;
    console.log('DATA: ' + total);
    for (let i = 0; i < logRemovetNow.length; i++) {
      const barcode = logRemovetNow[i].barcode;
      const create_at = logRemovetNow[i].create_at;
      console.log(
        i +
          ' / ' +
          total +
          ' : CREATE : ' +
          create_at +
          ', BARCODE : ' +
          barcode,
      );
      await this.logPlantImportNowRepository
        .createQueryBuilder()
        .where('barcode = :barcode', {
          barcode: barcode,
        })
        .delete()
        .execute();
      await this.logPlantRemoveNowRepository
        .createQueryBuilder()
        .where('barcode = :barcode', {
          barcode: barcode,
        })
        .delete()
        .execute();
    }
    console.log(
      'DATE: ' +
        this.momentWrapper.moment().add(-30, 'days').format('YYYY-MM-DD'),
    );
  }
}
