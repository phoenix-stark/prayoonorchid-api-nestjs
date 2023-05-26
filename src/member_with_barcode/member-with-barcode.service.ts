import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { MemberWithBarcode } from './entity/member-with-barcode-entity.model';
import { MemberWithBarcodeGetByBarcodeInput } from './dto/member-with-barcode-get-by-barcode.input';
import { MemberWithBarcodeDeleteInput } from './dto/member-with-barcode-delete.input';
import { LogPlantImportNow } from 'src/log_plant_import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from 'src/log_plant_remove/entity/log-plant-remove-now-entity.model';
import { LogPlantRemove } from 'src/log_plant_remove/entity/log-plant-remove-entity.model';
import { LogPlantImport } from 'src/log_plant_import/entity/log-plant-import-entity.model';
import { LogPlantImportService } from 'src/log_plant_import/log-plant-import.service';

@Injectable()
export class MemberWithBarcodeService {
  constructor(
    @InjectRepository(MemberWithBarcode)
    private readonly memberWithBarcodeRepository: Repository<MemberWithBarcode>,
  ) {}

  async getByBarcode(input: MemberWithBarcodeGetByBarcodeInput): Promise<any> {
    const memberWithBarcodeEntity =
      await this.memberWithBarcodeRepository.findOne({
        where: {
          barcode_start: LessThanOrEqual(input.barcode),
          barcode_end: MoreThanOrEqual(input.barcode),
        },
      });
    if (memberWithBarcodeEntity) {
      return memberWithBarcodeEntity;
    } else {
      return null;
    }
  }

  async deleteMember(input: MemberWithBarcodeDeleteInput): Promise<any> {
    console.log(input);

    const r = await this.memberWithBarcodeRepository
      .createQueryBuilder()
      .where('member_id = :member_id', { member_id: input.member_id })
      .andWhere('barcode_start = :barcode_start', {
        barcode_start: input.barcode_start,
      })
      .andWhere('barcode_end = :barcode_end', {
        barcode_end: input.barcode_end,
      })
      .delete()
      .execute();
    return {
      code: 200,
    };
  }
}
