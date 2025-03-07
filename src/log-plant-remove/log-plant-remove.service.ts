import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { LogPlantRemove } from './entity/log-plant-remove-entity.model';
import { LogRemoveCreateInput } from './dto/log-remove-create.input';
import { MomentService } from 'src/utils/MomentService';
import { LogPlantImportNow } from 'src/log-plant-import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from './entity/log-plant-remove-now-entity.model';
import { LogRemoveDeleteInput } from './dto/log-remove-delete.input';
import { LogRemoveUpdateInput } from './dto/log-remove-update.input';
import { LogRemoveUpdateAllInput } from './dto/log-remove-update-all.input';
import { LogRemoveDeleteRangeBarcodeInput } from './dto/log-remove-delete-range-barcode.input';
import { LogRemoveDeleteByReceiptIdInput } from './dto/log-remove-delete-by-receipt-id.input';
import { MemberWithBarcodeGetByBarcodeInput } from 'src/member-with-barcode/dto/member-with-barcode-get-by-barcode.input';
import { MemberWithBarcodeService } from 'src/member-with-barcode/member-with-barcode.service';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { Member } from 'src/member/entity/member-entity.model';
import { LogRemoveGetByReceiptIdInput } from './dto/log-remove-get-by-receipt-id.input';
import { SourcesPlantRemoveType } from 'src/sources-plant-remove-type/entity/sources-plant-remove-type-entity.model';
import { LogRemoveGetDetailByBarcodeInput } from './dto/log-remove-get-detail-by-barcode.input';
import { LogRemoveGetTotalByReceiptIdInput } from './dto/log-remove-get-total-by-receiptid.input';
import { LogRemoveGetTotalByReceiptIdAndTypeInput } from './dto/log-remove-get-total-by-receiptid-type.input';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { LogPlantImport } from 'src/log-plant-import/entity/log-plant-import-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Receipt } from 'src/receipt/entity/receipt-entity.model';
import { SourcesWorkMainType } from 'src/sources-work-main-type/entity/sources-work-main-type-entity.model';
import { SourcesWorkType } from 'src/sources-work-type/entity/sources-work-type-entity.model';
import { LogRemoveUpdateDetailAllInput } from './dto/log-remove-update-detail-all.input';

@Injectable()
export class LogPlantRemoveService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    @Inject(forwardRef(() => LogTokenService))
    private readonly logTokenService: LogTokenService,
    @Inject(forwardRef(() => MemberWithBarcodeService))
    private readonly memberWithBarcodeService: MemberWithBarcodeService,
    @InjectRepository(LogPlantRemove)
    private readonly logPlantRemoveRepository: Repository<LogPlantRemove>,
    @InjectRepository(LogPlantRemoveNow)
    private readonly logPlantRemoveNowRepository: Repository<LogPlantRemoveNow>,
    @InjectRepository(LogPlantImportNow)
    private readonly logPlantImportNowRepository: Repository<LogPlantImportNow>,
    private momentWrapper: MomentService,
  ) {}

  async insertBarcode(input: LogRemoveCreateInput): Promise<any> {
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

    const logPlantImport = await this.logPlantImportNowRepository.findOne({
      where: {
        barcode: `${input.barcode.toString().trim()}`,
      },
    });
    if (!logPlantImport) {
      return {
        code: 400,
        message: `Barcode ${input.barcode} ยังไม่ได้นำเข้าระบบ`,
      };
    } else {
      // TIME PER DAY
      let timePerDay = input.time_per_day;
      if (timePerDay == '0') {
        const logPlantRemoveNowTimePerDayRepository =
          await this.logPlantRemoveNowRepository.findOne({
            where: {
              remove_date: input.remove_date,
            },
            order: {
              time_per_day: 'DESC',
            },
          });
        if (!logPlantRemoveNowTimePerDayRepository) {
          timePerDay = '1';
        } else {
          timePerDay = `${
            logPlantRemoveNowTimePerDayRepository.time_per_day + 1
          }`;
        }
      }

      // INSERT
      let isNew = 1;
      let logEntity = await this.logPlantRemoveNowRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
      console.log('logEntity:');
      console.log(logEntity);
      if (!logEntity) {
        console.log('isNew=0');
        isNew = 1;
        logEntity = new LogPlantRemoveNow();
      } else {
        console.log('isNew=1');
        isNew = 0;
      }
      logEntity.log_plant_import_id = logPlantImport.log_plant_import_id;
      logEntity.barcode = `${input.barcode.toString().trim()}`;
      logEntity.create_at = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      logEntity.create_by = createBy;

      logEntity.plant_remove_type_id = input.plant_remove_type_id;
      logEntity.receipt_id = input.receipt_id;
      logEntity.remark = input.remark;
      logEntity.remove_date = input.remove_date;
      logEntity.time_per_day = parseInt(timePerDay);

      const newLogPlant = await this.logPlantRemoveNowRepository.save(
        logEntity,
      );
      const r = await this.logPlantRemoveRepository.save(newLogPlant);
      console.log(r);

      return {
        data: {
          log_plant_id: newLogPlant.log_plant_import_id,
          time_per_day: timePerDay,
          is_new: isNew,
        },
      };
    }
  }

  async getReceipts(): Promise<any[]> {
    return await this.logPlantRemoveRepository.find();
  }

  async updateBarcode(input: LogRemoveUpdateInput): Promise<any> {
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

    // Check Barcode
    const memberWithBarcodeEntity =
      await this.memberWithBarcodeService.getByBarcode({
        barcode: input.barcode,
      } as MemberWithBarcodeGetByBarcodeInput);
    if (!memberWithBarcodeEntity) {
      return {
        code: 400,
        message: `ไม่พบ Barcode ${input.barcode} ในระบบ ก่อนลบ`,
      };
    }

    const logPlantImport = await this.logPlantImportNowRepository.findOne({
      where: {
        barcode: `${input.barcode}`,
      },
    });
    if (!logPlantImport) {
      return {
        code: 400,
        message: `Barcode ${input.barcode}  ยังไม่ได้นำเข้าระบบ`,
      };
    }

    let logPlantRemoveNow = await this.logPlantRemoveNowRepository.findOne({
      where: {
        barcode: `${input.barcode}`,
      },
    });

    console.log('logPlantRemoveNow:');
    console.log(logPlantRemoveNow);
    console.log('input');
    console.log(input);
    if (!logPlantRemoveNow) {
      if (
        !input.plant_remove_type_id ||
        input.plant_remove_type_id.toString() == '' ||
        input.plant_remove_type_id.toString() == '-1' ||
        !input.remove_date ||
        input.remove_date == ''
      ) {
        // NO SAVE
        console.log('OUT OF CONDITION');
        return {
          data: {},
        };
      }

      // NEW
      logPlantRemoveNow = new LogPlantRemoveNow();
      logPlantRemoveNow.log_plant_import_id =
        logPlantImport.log_plant_import_id;
      logPlantRemoveNow.barcode = `${input.barcode}`;
      logPlantRemoveNow.create_at = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      logPlantRemoveNow.remove_date = input.remove_date;
      logPlantRemoveNow.plant_remove_type_id = input.plant_remove_type_id;
      logPlantRemoveNow.receipt_id = logPlantImport.receipt_id;
      logPlantRemoveNow.create_by = createBy;
      logPlantRemoveNow.remark = input.remark;
      logPlantRemoveNow.time_per_day = parseInt(input.time_per_day);

      // INSERT
      await this.logPlantRemoveRepository.save(logPlantRemoveNow);
      await this.logPlantRemoveNowRepository.save(logPlantRemoveNow);

      console.log('INSERT');
      console.log(logPlantRemoveNow);
    } else {
      console.log('CASE#2');
      console.log(input);
      if (
        !input.plant_remove_type_id ||
        input.plant_remove_type_id.toString() == '' ||
        input.plant_remove_type_id.toString() == '-1' ||
        !input.remove_date ||
        input.remove_date == ''
      ) {
        console.log('DELETE');
        // DELETE
        await this.deleteBarcode({
          barcode: input.barcode,
        } as LogRemoveDeleteInput);
      } else {
        logPlantRemoveNow.remove_date = input.remove_date;
        logPlantRemoveNow.plant_remove_type_id = input.plant_remove_type_id;
        logPlantRemoveNow.create_by = createBy;
        logPlantRemoveNow.remark = input.remark;
        console.log('UPDATE');
        console.log(logPlantRemoveNow);
      }

      await this.logPlantRemoveNowRepository.save(logPlantRemoveNow);
      await this.logPlantRemoveRepository.save(logPlantRemoveNow);
    }

    return {
      data: {
        log_plant_id: logPlantRemoveNow.log_plant_import_id,
      },
    };
  }

  async updateBarcodeAll(input: LogRemoveUpdateAllInput): Promise<any> {
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

    // for (let i = 0; i < input.barcodes.length; i++) {
    //   const barcode = input.barcodes[i];
    //   const logPlantImportNowEntity =
    //     await this.logPlantImportNowRepository.findOne({
    //       where: {
    //         barcode: `${barcode}`,
    //       },
    //     });
    //   if (logPlantImportNowEntity) {
    //     const logPlantRemoveNow =
    //       await this.logPlantRemoveNowRepository.findOne({
    //         where: {
    //           barcode: `${barcode}`,
    //         },
    //       });
    //     if (logPlantRemoveNow) {
    //       logPlantRemoveNow.remove_date = input.remove_date;
    //       logPlantRemoveNow.plant_remove_type_id = input.plant_remove_type_id;
    //       logPlantRemoveNow.create_by = createBy;
    //       logPlantRemoveNow.remark = input.remark;
    //       await this.logPlantRemoveNowRepository.save(logPlantRemoveNow);
    //     }

    //     const logPlantRemove = await this.logPlantRemoveRepository.findOne({
    //       where: {
    //         barcode: `${barcode}`,
    //       },
    //     });
    //     if (logPlantRemove) {
    //       logPlantRemove.remove_date = input.remove_date;
    //       logPlantRemove.plant_remove_type_id = input.plant_remove_type_id;
    //       logPlantRemove.create_by = createBy;
    //       logPlantRemove.remark = input.remark;
    //       await this.logPlantRemoveRepository.save(logPlantRemove);
    //     }
    //   }
    // }
    return {
      data: {
        barcodes: [],
      },
    };
  }

  async updateBarcodeAllV2(
    input: LogRemoveUpdateAllInput,
    is_check_total: boolean,
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

    const filterRemoveStart = input.remove_start;
    const filterRemoveEnd = input.remove_end;
    const filterEmployeeId = input.employee_id;
    const filterPlantRemoveTypeId = input.plant_remove_type_id;
    const filterTimePerDay = input.time_per_day;

    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('remove.remove_date', 'remove_date')
          .addSelect('remove.time_per_day', 'time_per_day')
          .addSelect('remove.plant_remove_type_id', 'plant_remove_type_id')
          .addSelect('import.import_date', 'import_date')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .addSelect('remove.barcode', 'barcode')
          .addSelect('count(*)', 'total_remove')
          .from(LogPlantImport, 'import')
          .groupBy('remove.remove_date')
          .addGroupBy('remove.time_per_day')
          .addGroupBy('remove.barcode')
          .addGroupBy('remove.plant_remove_type_id')
          .addGroupBy('import.import_date')
          .addGroupBy('import.member_made')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('import.food_plant_id')
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            LogPlantRemove,
            'remove',
            'remove.log_plant_import_id = import.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            Customer,
            'customer_tb',
            'customer_tb.customer_id = receipt_tb.customer_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant_tb',
            'food_plant_tb.food_id = import.food_plant_id',
          );

        // Remove Date
        if (
          filterRemoveStart &&
          filterRemoveEnd &&
          filterRemoveStart != '' &&
          filterRemoveEnd != ''
        ) {
          sub.andWhere(
            '( remove.remove_date >= :removeStart AND remove.remove_date <= :removeEnd ) ',
            {
              removeStart: filterRemoveStart,
              removeEnd: filterRemoveEnd,
            },
          );
        }

        // Time per Day
        if (filterTimePerDay && filterTimePerDay != '') {
          sub.andWhere('remove.time_per_day = :time_per_day', {
            time_per_day: filterTimePerDay,
          });
        }

        // Plant Remove Type
        if (
          filterPlantRemoveTypeId &&
          filterPlantRemoveTypeId != '' &&
          filterPlantRemoveTypeId != '0'
        ) {
          sub.andWhere('remove.plant_remove_type_id = :plant_remove_type_id ', {
            plant_remove_type_id: filterPlantRemoveTypeId,
          });
        }

        // Employee
        if (filterEmployeeId && filterEmployeeId !== '') {
          sub.andWhere('remove.create_by = :employee ', {
            employee: filterEmployeeId,
          });
        }
        return sub;
      }, 'result_group')
      .leftJoin(
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      )
      .leftJoin(
        Receipt,
        'receipt_tb',
        'receipt_tb.receipt_id = result_group.receipt_id',
      )
      .leftJoin(
        Customer,
        'customer_tb',
        'customer_tb.customer_id = receipt_tb.customer_id',
      )
      .leftJoin(
        PlantFamilyMain,
        'plant_family_main_tb',
        'plant_family_main_tb.id = receipt_tb.family_main_id',
      )
      .leftJoin(
        SourcesWorkMainType,
        'sources_work_main_type_tb',
        'sources_work_main_type_tb.id = result_group.main_work_type_id',
      )
      .leftJoin(
        SourcesWorkType,
        'sources_work_type_tb',
        'sources_work_type_tb.id = result_group.work_type_id',
      )
      .leftJoin(
        FoodPlant,
        'food_plant_tb',
        'food_plant_tb.food_id = result_group.food_plant_id',
      )
      .leftJoin(
        SourcesPlantRemoveType,
        'sources_plant_remove_type_tb',
        'sources_plant_remove_type_tb.id = result_group.plant_remove_type_id',
      );

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    if (is_check_total == false) {
      // UPDATE-ALL
      let totalNow = 0;
      let totalLog = 0;
      query.select('result_group.barcode', 'barcode');

      const result = await query.getRawMany();

      for (let i = 0; i < result.length; i++) {
        const barcode = result[i].barcode;
        await this.logPlantRemoveNowRepository.update(
          { barcode },
          {
            plant_remove_type_id: parseInt(
              input.update_plant_remove_type_id.toString(),
            ),
            create_by: createBy,
            remark: input.update_remark,
            remove_date: input.update_remove_date,
          },
        );
        totalNow++;
      }

      for (let i = 0; i < result.length; i++) {
        const barcode = result[i].barcode;
        await this.logPlantRemoveRepository.update(
          { barcode },
          {
            plant_remove_type_id: parseInt(
              input.update_plant_remove_type_id.toString(),
            ),
            create_by: createBy,
            remark: input.update_remark,
            remove_date: input.update_remove_date,
          },
        );
        totalLog++;
      }

      return {
        code: 200,
        data: {
          total_now: totalNow,
          total_log: totalLog,
        },
      };
    } else {
      return {
        code: 200,
        data: {
          total: totalAll.total,
        },
      };
    }
  }

  async updateBarcodeDetailAllV2(
    input: LogRemoveUpdateDetailAllInput,
    is_check_total: boolean,
  ): Promise<any> {
    console.log('call updateBarcodeDetailAllV2');
    console.log(input);
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

    const filterImportStart = input.import_start;
    const filterImportEnd = input.import_end;
    const filterRemoveStart = input.remove_start;
    const filterRemoveEnd = input.remove_end;
    const filterMainWorkTypeDesc = input.main_work_type_desc;
    const filterWorkTypeId = input.work_type_id;
    const filterEmployeeId = input.employee_id;
    const filterReceiptCode = input.receipt_code;
    const filterReceiptCodeIsMatchAll = input.receipt_code_is_match_all;
    const filterReceiptName = input.receipt_name;
    const filterReceiptNameIsMatchAll = input.receipt_name_is_match_all;
    const filterFoodPlantDesc = input.food_plant_desc;
    const filterFoodPlantDescIsMatchAll = input.food_plant_desc_is_match_all;
    const filterFamilyMainDesc = input.family_main_desc;
    const filterFamilyMainDescIsMatchAll = input.family_main_desc_is_match_all;
    const filterCustomerId = input.customer_id;
    const filterCustomerIdIsMatchAll = input.customer_id_is_match_all;
    const filterPlantRemoveTypeId = input.plant_remove_type_id;
    // add
    const filterTimePerDay = input.time_per_day;

    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('remove.barcode', 'barcode')
          .addSelect('remove.time_per_day', 'time_per_day')
          .addSelect('remove.remove_date', 'remove_date')
          .addSelect('remove.plant_remove_type_id', 'plant_remove_type_id')
          .addSelect('remove.remark', 'remark')
          .addSelect('import.import_date', 'import_date')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .from(LogPlantRemove, 'remove')
          .leftJoin(
            LogPlantImport,
            'import',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          );
        // Remove Date
        if (filterRemoveStart != '' && filterRemoveEnd != '') {
          sub.andWhere(
            '( remove.remove_date >= :removeStart AND remove.remove_date <= :removeEnd ) ',
            {
              removeStart: filterRemoveStart,
              removeEnd: filterRemoveEnd,
            },
          );
        }

        // Remove TYPE
        if (filterPlantRemoveTypeId && filterPlantRemoveTypeId != '') {
          sub.andWhere(
            '( remove.plant_remove_type_id = :plant_remove_type_id ) ',
            {
              plant_remove_type_id: filterPlantRemoveTypeId,
            },
          );
        }

        // Import Date
        if (filterImportStart != '' && filterImportEnd != '') {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: filterImportStart,
              importEnd: filterImportEnd,
            },
          );
        }

        // Main Work Type
        if (filterMainWorkTypeDesc !== '') {
          sub.andWhere('sources_work_main_type_tb.description = :mainTask ', {
            mainTask: filterMainWorkTypeDesc,
          });
        }
        // Work Type
        if (filterWorkTypeId) {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: filterWorkTypeId,
          });
        }

        // Employee
        if (filterEmployeeId != '') {
          sub.andWhere('import.member_made = :employee ', {
            employee: filterEmployeeId,
          });
        }

        // TIME PER DAY
        if (filterTimePerDay != '') {
          sub.andWhere('remove.time_per_day = :time_per_day ', {
            time_per_day: filterTimePerDay,
          });
        }

        return sub;
      }, 'result_group')

      .leftJoin(
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      )
      .leftJoin(
        Receipt,
        'receipt_tb',
        'receipt_tb.receipt_id = result_group.receipt_id',
      )
      .leftJoin(
        Customer,
        'customer_tb',
        'customer_tb.customer_id = receipt_tb.customer_id',
      )
      .leftJoin(
        PlantFamilyMain,
        'plant_family_main_tb',
        'plant_family_main_tb.id = receipt_tb.family_main_id',
      )
      .leftJoin(
        SourcesWorkMainType,
        'sources_work_main_type_tb',
        'sources_work_main_type_tb.id = result_group.main_work_type_id',
      )
      .leftJoin(
        FoodPlant,
        'food_plant_tb',
        'food_plant_tb.food_id = result_group.food_plant_id',
      )
      .leftJoin(
        SourcesWorkType,
        'sources_work_type_tb',
        'sources_work_type_tb.id = result_group.work_type_id',
      )
      .leftJoin(
        SourcesPlantRemoveType,
        'sources_plant_remove_type_tb',
        'sources_plant_remove_type_tb.id = result_group.plant_remove_type_id',
      );
    // Code
    if (filterReceiptCode != '') {
      if (filterReceiptCodeIsMatchAll == true) {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${filterReceiptCode}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${filterReceiptCode}%`,
        });
      }
    } else {
      query.andWhere('receipt_tb.code  LIKE :code ', {
        code: `%%`,
      });
    }

    // Receipt Name
    if (filterReceiptName != '') {
      if (filterReceiptNameIsMatchAll == true) {
        query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
          receipt_name: `${filterReceiptName}`,
        });
      } else {
        query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
          receipt_name: `%${filterReceiptName}%`,
        });
      }
    }

    // FOOD PLANT
    if (filterFoodPlantDesc != '') {
      if (filterFoodPlantDescIsMatchAll == true) {
        query.andWhere('food_plant_tb.description  LIKE :food ', {
          food: `${filterFoodPlantDesc}`,
        });
      } else {
        query.andWhere('food_plant_tb.description  LIKE :food ', {
          food: `%${filterFoodPlantDesc}%`,
        });
      }
    }

    // Family main
    if (filterFamilyMainDesc != '') {
      if (filterFamilyMainDescIsMatchAll == true) {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `${filterFamilyMainDesc}`,
        });
      } else {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `%${filterFamilyMainDesc}%`,
        });
      }
    }

    // Customer
    if (filterCustomerId != '') {
      if (filterCustomerIdIsMatchAll == true) {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `${filterCustomerId}`,
        });
      } else {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `${filterCustomerId}`,
        });
      }
    }

    // Employee
    if (filterEmployeeId != '') {
      query.andWhere('result_group.member_made = :member_made ', {
        member_made: filterEmployeeId,
      });
    }

    const queryTotal = query;
    if (is_check_total == false) {
      // UPDATE-ALL
      let totalNow = 0;
      let totalLog = 0;
      query
        .select('result_group.barcode', 'barcode')
        .addSelect('member_tb.member_id', 'member_id')
        .addSelect('member_tb.name', 'member_name')
        .addSelect('member_tb.surname', 'member_surname')

        .addSelect('result_group.remove_date', 'remove_date')
        .addSelect('result_group.time_per_day', 'time_per_day')
        .addSelect('result_group.import_date', 'import_date')
        .addSelect('result_group.plant_remove_type_id', 'plant_remove_type_id')
        .addSelect('result_group.remark', 'remark')

        .addSelect('sources_plant_remove_type_tb.description', 'remove_type')
        .addSelect('receipt_tb.name', 'receipt_name')
        .addSelect('receipt_tb.code', 'receipt_code')
        .addSelect('receipt_tb.num_order', 'receipt_num_order')

        .addSelect('customer_tb.customer_id', 'customer_id')
        .addSelect('customer_tb.name', 'customer_name')

        .addSelect('plant_family_main_tb.description', 'plant_family_main')
        .addSelect('sources_work_main_type_tb.id', 'main_work_type_id')
        .addSelect('sources_work_main_type_tb.description', 'main_work_type')
        .addSelect('sources_work_type_tb.id', 'work_type_id')
        .addSelect('sources_work_type_tb.description', 'work_type')
        .addSelect('food_plant_tb.food_id', 'food_id')
        .addSelect('food_plant_tb.description', 'food');
      query
        .orderBy('result_group.remove_date', 'ASC')
        .addOrderBy('member_tb.name', 'ASC')
        .addOrderBy('member_tb.surname', 'ASC')
        .addOrderBy('result_group.barcode', 'ASC');

      const resultStr = await query.getQueryAndParameters();
      console.log(resultStr);
      const result = await query.getRawMany();
      console.log(result);

      for (let i = 0; i < result.length; i++) {
        const barcode = result[i].barcode;
        console.log('barcode:' + barcode);
        await this.logPlantRemoveNowRepository.update(
          { barcode },
          {
            plant_remove_type_id: parseInt(
              input.update_plant_remove_type_id.toString(),
            ),
            create_by: createBy,
            remark: input.update_remark,
            remove_date: input.update_remove_date,
          },
        );
        totalNow++;
      }

      for (let i = 0; i < result.length; i++) {
        const barcode = result[i].barcode;
        const resultUpdate = await this.logPlantRemoveRepository.update(
          { barcode },
          {
            plant_remove_type_id: parseInt(
              input.update_plant_remove_type_id.toString(),
            ),
            create_by: createBy,
            remark: input.update_remark,
            remove_date: input.update_remove_date,
          },
        );
        totalLog++;
      }

      return {
        code: 200,
        data: {
          total_now: totalNow,
          total_log: totalLog,
        },
      };
    } else {
      const resultStr = await query.getQueryAndParameters();
      console.log(resultStr);
      const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();
      return {
        code: 200,
        data: {
          total: totalAll.total,
        },
      };
    }
  }

  async deleteBarcodeByReceiptId(
    input: LogRemoveDeleteByReceiptIdInput,
  ): Promise<any> {
    await this.logPlantRemoveRepository
      .createQueryBuilder()
      .where('receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      })
      .delete()
      .execute();
    await this.logPlantRemoveNowRepository
      .createQueryBuilder()
      .where('receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      })
      .delete()
      .execute();
    return {
      code: 200,
    };
  }

  async deleteBarcode(input: LogRemoveDeleteInput): Promise<any> {
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

    const logPlantRemoveNowEntity =
      await this.logPlantRemoveNowRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
    await this.logPlantRemoveNowRepository.remove(logPlantRemoveNowEntity);
    const logPlantRemoveEntity = await this.logPlantRemoveRepository.findOne({
      where: {
        barcode: `${input.barcode}`,
      },
    });
    await this.logPlantRemoveRepository.remove(logPlantRemoveEntity);
    return {
      data: {},
    };
  }

  async deleteBarcodeRangeBarcode(
    input: LogRemoveDeleteRangeBarcodeInput,
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

    await this.logPlantRemoveRepository
      .createQueryBuilder()
      .where('barcode >= :barcode_start', {
        barcode_start: input.barcode_start,
      })
      .andWhere('barcode <= :barcode_end', {
        barcode_end: input.barcode_end,
      })
      .delete()
      .execute();

    await this.logPlantRemoveNowRepository
      .createQueryBuilder()
      .where('barcode >= :barcode_start', {
        barcode_start: input.barcode_start,
      })
      .andWhere('barcode <= :barcode_end', {
        barcode_end: input.barcode_end,
      })
      .delete()
      .execute();
    return {
      code: 200,
    };
  }

  async getLogPlantRemoveByReceipt(
    input: LogRemoveGetByReceiptIdInput,
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

    const query = this.logPlantRemoveRepository
      .createQueryBuilder('log_plant_remove')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = log_plant_remove.create_by',
      )
      .leftJoinAndSelect(
        SourcesPlantRemoveType,
        'sources_plant_remove_type',
        'sources_plant_remove_type.id = log_plant_remove.plant_remove_type_id',
      )
      .where('log_plant_remove.receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      });

    if (input.type_id == '0') {
      query.andWhere('log_plant_remove.plant_remove_type_id != 5');
    } else {
      query.andWhere(
        'log_plant_remove.plant_remove_type_id = :plant_remove_type_id',
        {
          plant_remove_type_id: input.type_id,
        },
      );
    }

    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const queryTotal = query;

    const resultTotal = await queryTotal
      .select('COUNT(*)', 'total')
      .getRawOne();

    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    query
      .select([
        'log_plant_remove.log_plant_import_id',
        'log_plant_remove.barcode',
        'log_plant_remove.remove_date',
        'log_plant_remove.remark',
        'member',
        'sources_plant_remove_type',
      ])
      .orderBy('log_plant_remove.remove_date', 'DESC');

    const result = await query.getRawMany();
    const logPlantImportEntities = result.map((row: any) => ({
      log_plant_import_id: row.log_plant_remove_log_plant_import_id,
      barcode: row.log_plant_remove_barcode,
      remove_date: row.log_plant_remove_remove_date,
      remark: row.log_plant_remove_remark,
      member_made: {
        member_id: row.member_member_id,
        username: row.member_username,
        name: row.member_name,
        surname: row.member_surname,
      },
      plant_remove_type: {
        id: row.sources_plant_remove_type_id,
        code: row.sources_plant_remove_type_code,
        description: row.sources_plant_remove_type_description,
      },
    }));
    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: logPlantImportEntities,
      },
    };
    return result;
  }

  async getLogPlantRemoveDetailByBarcode(
    input: LogRemoveGetDetailByBarcodeInput,
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

    const query = this.logPlantRemoveRepository
      .createQueryBuilder('log_plant_remove')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = log_plant_remove.member_made',
      )
      .leftJoinAndSelect(
        SourcesPlantRemoveType,
        'sources_plant_remove_type',
        'sources_plant_remove_type.id = log_plant_remove.plant_remove_type_id',
      )
      .where('log_plant_remove.barcode = :barcode', {
        barcode: input.barcode,
      })
      .select([
        'log_plant_remove.log_plant_import_id',
        'log_plant_remove.barcode',
        'log_plant_remove.remove_date',
        'log_plant_remove.remark',
        'member',
        'sources_plant_remove_type',
      ]);
    const result = await query.getRawOne();

    const row = result;

    const logPlantImportEntities = {
      log_plant_import_id: row.log_plant_remove_log_plant_import_id,
      barcode: row.log_plant_remove_barcode,
      remove_date: row.log_plant_remove_remove_date,
      remark: row.log_plant_remove_remark,
      member_made: {
        member_id: row.member_member_id,
        username: row.member_username,
        name: row.member_name,
        surname: row.member_surname,
      },
      plant_remove_type: {
        id: row.sources_plant_remove_type_id,
        code: row.sources_plant_remove_type_code,
        description: row.sources_plant_remove_type_description,
      },
    };
    return {
      code: 200,
      data: logPlantImportEntities,
    };
    return result;
  }

  async getLogPlantRemoveTotalByReceiptId(
    input: LogRemoveGetTotalByReceiptIdInput,
  ): Promise<any> {
    const results = await this.logPlantRemoveRepository.find({
      where: {
        receipt_id: input.receipt_id,
      },
    });

    return results.length;
  }

  async getLogPlantRemoveTotalByReceiptIdAndType(
    input: LogRemoveGetTotalByReceiptIdAndTypeInput,
  ): Promise<any> {
    const results = await this.logPlantRemoveRepository
      .createQueryBuilder()
      .where('receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      });
    if (input.plant_remove_type_id && input.plant_remove_type_id != '0') {
      results.andWhere('plant_remove_type_id = :plant_remove_type_id', {
        plant_remove_type_id: input.plant_remove_type_id,
      });
    } else {
      results.andWhere('plant_remove_type_id != 5');
    }

    return (await results.getRawMany()).length;
  }

  getStartIndexPage = (page: number, limit_per_page: number) => {
    return (page - 1) * limit_per_page;
  };
}
