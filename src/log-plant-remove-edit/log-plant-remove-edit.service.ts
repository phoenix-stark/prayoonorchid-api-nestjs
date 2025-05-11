import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogPlantRemoveEdit } from './entity/log-plant-remove-edit-entity.model';
import { LogRemoveCreateEditInput } from './dto/log-remove-edit-create.input';
import { MomentService } from 'src/utils/MomentService';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { LogPlantRemove } from 'src/log-plant-remove/entity/log-plant-remove-entity.model';
import { SourcesPlantRemoveTypeService } from 'src/sources-plant-remove-type/sources-plant-remove-type.service';
import { LogRemoveEditGetInput } from './dto/log-remove-edit-get.input';
import { SourcesPlantRemoveType } from 'src/sources-plant-remove-type/entity/sources-plant-remove-type-entity.model';
import { Member } from 'src/member/entity/member-entity.model';

@Injectable()
export class LogPlantRemoveEditService {
  constructor(
    @Inject(forwardRef(() => LogTokenService))
    private readonly logTokenService: LogTokenService,
    @Inject(forwardRef(() => SourcesPlantRemoveTypeService))
    private readonly sourcesPlantRemoveTypeService: SourcesPlantRemoveTypeService,
    @InjectRepository(LogPlantRemoveEdit)
    private readonly logPlantRemoveEditRepository: Repository<LogPlantRemoveEdit>,
    @InjectRepository(LogPlantRemove)
    private readonly logPlantRemoveRepository: Repository<LogPlantRemove>,
    private momentWrapper: MomentService,
  ) {}

  async insertLogPlantRemoveEdit(
    input: LogRemoveCreateEditInput,
  ): Promise<any> {
    // Check Member
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
    } as LogTokenGetInput);

    if (!logTokenEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const createBy = logTokenEntity.member_id;

    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const newLogPlant = await this.logPlantRemoveRepository.findOne({
      where: {
        barcode: input.barcode,
      },
    });
    console.log(input);
    if (newLogPlant) {
      let message = '';
      const dt = this.formatDateToExcel(
        this.momentWrapper
          .momentDate(newLogPlant.remove_date)
          .format('YYYY-MM-DD'),
        'YYYY-MM-DD',
      );
      console.log('dt: ' + dt);
      if (dt != input.remove_date) {
        message += `แก้ไข วันที่นำออก จาก ${dt} เป็น ${input.remove_date}, `;
      }

      if (newLogPlant.plant_remove_type_id != input.plant_remove_type_id) {
        let descOld = '';
        let descNew = '';

        // GET OLD
        const plantTypeOld =
          await this.sourcesPlantRemoveTypeService.getSourcesPlantRemoveTypeById(
            {
              token: input.token,
              id: newLogPlant.plant_remove_type_id,
            },
          );

        // GET NEW
        const plantTypeNew =
          await this.sourcesPlantRemoveTypeService.getSourcesPlantRemoveTypeById(
            {
              token: input.token,
              id: input.plant_remove_type_id,
            },
          );
        if (plantTypeOld.data) {
          descOld = plantTypeOld.data.description;
        }

        if (plantTypeNew.data) {
          descNew = plantTypeNew.data.description;
        }

        message += `แก้ไข สาเหตุ จาก ${descOld} เป็น ${descNew}, `;
      }

      if (newLogPlant.remark != input.remark) {
        message += `แก้ไข remark จาก ${newLogPlant.remark} เป็น ${input.remark}, `;
      }

      const logPlantRemoveNowRepository = new LogPlantRemoveEdit();
      logPlantRemoveNowRepository.barcode = input.barcode;
      logPlantRemoveNowRepository.edit_at = updateAt;
      logPlantRemoveNowRepository.edit_by = input.edit_by;
      logPlantRemoveNowRepository.message = message;
      const result = await this.logPlantRemoveEditRepository.save(
        logPlantRemoveNowRepository,
      );
      console.log(result);
    }

    return {
      data: {
        barcode: input.barcode,
      },
    };
  }

  async getLogPlantRemoveEdit(input: LogRemoveEditGetInput): Promise<any> {
    const query = await this.logPlantRemoveEditRepository
      .createQueryBuilder('log_plant_remove_edit')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = log_plant_remove_edit.edit_by',
      )
      .where('log_plant_remove_edit.barcode = :barcode', {
        barcode: input.barcode,
      })
      .orderBy('log_plant_remove_edit.edit_at', 'DESC')
      .getRawMany();
    console.log(query);
    const results: any[] = [];
    for (let i = 0; i < query.length; i++) {
      const r = query[i];
      results.push({
        barcode: r.log_plant_remove_edit_barcode,
        edit_at: r.log_plant_remove_edit_edit_at,
        edit_by: {
          name: r.member_name,
          surname: r.member_surname,
        },
        note: r.log_plant_remove_edit_message,
      });
    }
    return results;
  }

  formatDateToExcel(date: string, format: string): string {
    return this.momentWrapper.momentDateFromFormat(date, format).format(format);
  }
}
