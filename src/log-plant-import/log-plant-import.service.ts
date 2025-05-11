import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { LogPlantImport } from './entity/log-plant-import-entity.model';
import { LogPlantImportNow } from './entity/log-plant-import-now-entity.model';
import { LogImportCreateInput } from './dto/log-import-create.input';
import { MomentService } from 'src/utils/MomentService';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { SourcesWorkType } from 'src/sources-work-type/entity/sources-work-type-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { Receipt } from 'src/receipt/entity/receipt-entity.model';
import { LogImportUpdateInput } from './dto/log-import-update.input';
import { LogImportUpdateAllInput } from './dto/log-import-update-all.input';
import { LogImportDeleteInput } from './dto/log-import-delete.input';
import { LogPlantRemoveNow } from 'src/log-plant-remove/entity/log-plant-remove-now-entity.model';
import { LogImportDeleteRangeBarcodeInput } from './dto/log-import-delete-range-barcode.input';
import { LogImportDeleteByReceiptIdInput } from './dto/log-import-delete-by-receipt-id.input';
import { LogImportGetTotalByFoodIdInput } from './dto/log-import-get-total-by-foodid.input';
import { LogImportGetTotalByWorkMainTypeIdInput } from './dto/log-import-get-total-by-workmaintypeid.input';
import { LogImportGetTotalByWorkTypeIdInput } from './dto/log-import-get-total-by-worktypeid.input';
import { MemberWithBarcodeGetByBarcodeInput } from 'src/member-with-barcode/dto/member-with-barcode-get-by-barcode.input';
import { MemberWithBarcodeService } from 'src/member-with-barcode/member-with-barcode.service';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { LogImportGetByReceiptIdInput } from './dto/log-import-get-by-receipt-id.input';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { ReceiptService } from 'src/receipt/receipt.service';
import { LogImportGetDetailByBarcodeInput } from './dto/log-import-get-detail-by-barcode.input';
import { LogImportUpdateGroupAllInput } from './dto/log-import-update-group-all.input';
import { SourcesWorkMainType } from 'src/sources-work-main-type/entity/sources-work-main-type-entity.model';
import { LogPlantRemove } from 'src/log-plant-remove/entity/log-plant-remove-entity.model';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { ReceiptGetByCodeInput } from 'src/receipt/dto/receipt-get-by-code.input';
import { LogImportGetTotalByReceiptIdInput } from './dto/log-import-get-total-by-receiptid.input';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
import { ReportProductionResponse } from 'src/report/modal/report-production.response';
import { SourcesPlantRemoveType } from 'src/sources-plant-remove-type/entity/sources-plant-remove-type-entity.model';

@Injectable()
export class LogPlantImportService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    @Inject(forwardRef(() => LogTokenService))
    private readonly logTokenService: LogTokenService,
    @Inject(forwardRef(() => ReceiptService))
    private readonly receiptService: ReceiptService,
    @InjectRepository(LogPlantImport)
    private readonly logPlantImportRepository: Repository<LogPlantImport>,
    @InjectRepository(LogPlantImportNow)
    private readonly logPlantImportNowRepository: Repository<LogPlantImportNow>,
    @InjectRepository(LogPlantRemove)
    private readonly logPlantRemoveRepository: Repository<LogPlantRemove>,
    @InjectRepository(FoodPlant)
    private readonly foodPlantRepository: Repository<FoodPlant>,
    @InjectRepository(SourcesWorkType)
    private readonly sourcesWorkTypeRepository: Repository<SourcesWorkType>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private memberWithBarcodeService: MemberWithBarcodeService,
    private momentWrapper: MomentService,
  ) {}

  async getReceipts(): Promise<any[]> {
    return await this.logPlantImportRepository.find();
  }

  async insertBarcode(
    input: LogImportCreateInput,
    is_add_on: boolean,
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

    // Check Barcode
    const memberWithBarcodeEntity =
      await this.memberWithBarcodeService.getByBarcode({
        barcode: input.barcode,
      } as MemberWithBarcodeGetByBarcodeInput);
    if (memberWithBarcodeEntity) {
      const logPlantImportNowEntity =
        await this.logPlantImportNowRepository.findOne({
          where: {
            barcode: `${input.barcode.toString().trim()}`,
          },
        });
      if (logPlantImportNowEntity) {
        return {
          code: 400,
          message: `นำเข้า Barcode ${input.barcode} แล้วในระบบ`,
        };
      } else {
        // FOOD
        let foodEntity = await this.foodPlantRepository.findOne({
          where: {
            description: input.food_description,
          },
        });
        if (!foodEntity) {
          const foodNewEntity = new FoodPlant();
          foodNewEntity.description = input.food_description;
          foodNewEntity.create_by = memberWithBarcodeEntity.member_id;
          foodNewEntity.create_at = this.momentWrapper
            .moment()
            .format('YYYY-MM-DD HH:mm:ss');
          foodEntity = await this.foodPlantRepository.save(foodNewEntity);
        }

        //WORK TYPE
        let workTypeEntity = await this.sourcesWorkTypeRepository.findOne({
          where: {
            description: input.work_type_description,
          },
        });
        console.log('workTypeEntity: ' + input.work_type_description);
        console.log(workTypeEntity);
        if (!workTypeEntity) {
          console.log('workTypeEntity no data: ');
          const workTypeNewEntity = new SourcesWorkType();
          workTypeNewEntity.description = input.work_type_description;
          workTypeEntity = await this.sourcesWorkTypeRepository.save(
            workTypeNewEntity,
          );
        }

        // TIME PER DAY
        let timePerDay = input.time_per_day;
        if (timePerDay == '0') {
          console.log('Zeto time per day');
          const logPlantImportNowTimePerDayRepository =
            await this.logPlantImportNowRepository.findOne({
              where: {
                import_date: input.import_date,
              },
              order: {
                time_per_day: 'DESC',
              },
            });
          console.log('logPlantImportNowTimePerDayRepository');
          console.log(logPlantImportNowTimePerDayRepository);
          if (!logPlantImportNowTimePerDayRepository) {
            timePerDay = '1';
          } else {
            console.log(logPlantImportNowTimePerDayRepository.time_per_day);
            timePerDay = `${
              logPlantImportNowTimePerDayRepository.time_per_day + 1
            }`;
          }
        }
        // GET RECEIPT
        let recipetId = null;
        if (input.reciept_id) {
          recipetId = input.reciept_id;
        } else {
          const receiptEntity = await this.receiptService.getReceiptByCode({
            code: input.reciept_code,
          } as ReceiptGetByCodeInput);
          if (receiptEntity) {
            recipetId = receiptEntity.receipt_id;
          }
        }
        if (!recipetId) {
          return {
            code: 400,
            message: `ไม่พบรหัสใบงาน`,
          };
        }

        // INSERT
        const logEntity = new LogPlantImportNow();
        logEntity.barcode = `${input.barcode.toString().trim()}`;
        logEntity.create_at = this.momentWrapper
          .moment()
          .format('YYYY-MM-DD HH:mm:ss');
        logEntity.create_by = createBy;
        logEntity.food_plant_id = `${foodEntity.food_id}`;
        logEntity.import_date = input.import_date;
        logEntity.main_work_type_id = input.main_work_type_id;
        if (is_add_on == true) {
          logEntity.member_made = input.member_id;
        } else {
          logEntity.member_made = memberWithBarcodeEntity.member_id;
        }

        logEntity.receipt_id = recipetId;
        logEntity.time_per_day = parseInt(timePerDay);
        logEntity.work_type_id = workTypeEntity.id;
        const newLogPlant = await this.logPlantImportRepository.save(logEntity);

        logEntity.log_plant_import_id = newLogPlant.log_plant_import_id;
        console.log('logEntity:');
        console.log(logEntity);
        const r = await this.logPlantImportNowRepository.save(logEntity);
        console.log('r2');
        console.log(r);
        const memberMadeEntity = await this.memberRepository.findOne({
          where: {
            member_id: memberWithBarcodeEntity.member_id,
          },
        });
        return {
          data: {
            log_plant_id: newLogPlant.log_plant_import_id,
            time_per_day: timePerDay,
            member: {
              name: memberMadeEntity.name,
              surname: memberMadeEntity.surname,
            },
          },
        };
      }
    } else {
      return {
        code: 400,
        message: `ไม่พบ Barcode ${input.barcode} ในระบบ ก่อนนำเข้า`,
      };
    }
  }

  async updateBarcode(input: LogImportUpdateInput): Promise<any> {
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

    const logPlantImportNowEntity =
      await this.logPlantImportNowRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
    logPlantImportNowEntity.food_plant_id = `${input.food_id}`;
    logPlantImportNowEntity.work_type_id = input.work_type_id;
    logPlantImportNowEntity.main_work_type_id = input.main_work_type_id;
    logPlantImportNowEntity.import_date = input.import_date;
    logPlantImportNowEntity.receipt_id = input.receipt_id;
    const resultLogNow = await this.logPlantImportNowRepository.save(
      logPlantImportNowEntity,
    );

    const logPlantImportRepositoryEntity =
      await this.logPlantImportRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
    logPlantImportRepositoryEntity.food_plant_id = `${input.food_id}`;
    logPlantImportRepositoryEntity.work_type_id = input.work_type_id;
    logPlantImportRepositoryEntity.main_work_type_id = input.main_work_type_id;
    logPlantImportRepositoryEntity.import_date = input.import_date;
    logPlantImportRepositoryEntity.receipt_id = input.receipt_id;
    const resultLog = await this.logPlantImportRepository.save(
      logPlantImportRepositoryEntity,
    );
    if (resultLogNow && resultLog) {
      return {
        data: {
          barcode: input.barcode,
        },
      };
    } else {
      return {
        code: 400,
        message: 'พบข้อผิดพลาดของข้อมูล',
      };
    }
  }

  async updateBarcodeAll(
    input: LogImportUpdateAllInput,
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

    // for (let i = 0; i < input.barcodes.length; i++) {
    //   const barcode = input.barcodes[i];

    //   if (is_check_total == false) {
    //     const logPlantImportNowEntity =
    //       await this.logPlantImportNowRepository.findOne({
    //         where: {
    //           barcode: `${barcode}`,
    //         },
    //       });
    //     logPlantImportNowEntity.food_plant_id = `${input.food_id}`;
    //     logPlantImportNowEntity.work_type_id = input.work_type_id;
    //     logPlantImportNowEntity.main_work_type_id = input.main_work_type_id;
    //     logPlantImportNowEntity.import_date = input.import_date;
    //     logPlantImportNowEntity.receipt_id = input.receipt_id;
    //     const resultLogNow = await this.logPlantImportNowRepository.save(
    //       logPlantImportNowEntity,
    //     );

    //     const logPlantImportRepositoryEntity =
    //       await this.logPlantImportRepository.findOne({
    //         where: {
    //           barcode: `${barcode}`,
    //         },
    //       });
    //     logPlantImportRepositoryEntity.food_plant_id = `${input.food_id}`;
    //     logPlantImportRepositoryEntity.work_type_id = input.work_type_id;
    //     logPlantImportRepositoryEntity.main_work_type_id =
    //       input.main_work_type_id;
    //     logPlantImportRepositoryEntity.import_date = input.import_date;
    //     logPlantImportRepositoryEntity.receipt_id = input.receipt_id;
    //     const resultLog = await this.logPlantImportRepository.save(
    //       logPlantImportRepositoryEntity,
    //     );
    //   }
    // }

    if (is_check_total == true) {
      return {
        data: {
          total: input.barcodes.length,
        },
      };
    }

    return {
      data: {
        barcodes: input.barcodes,
      },
    };
  }

  async updateBarcodeAllV2(
    input: LogImportUpdateAllInput,
    is_check_total: boolean,
  ): Promise<any> {
    const filterImportStart = input.import_start;
    const filterImportEnd = input.import_end;
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
    // add
    const filterTimePerDay = input.time_per_day;

    if (filterImportStart == '' || filterImportEnd == '') {
      return {
        code: 200,
        data: [],
      };
    }

    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('import.barcode', 'barcode')
          .addSelect('import.time_per_day', 'time_per_day')
          .addSelect('import.import_date', 'import_date')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .addSelect('sources_plant_remove_type_tb.description', 'remove_type')
          .from(LogPlantImport, 'import')
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
            SourcesPlantRemoveType,
            'sources_plant_remove_type_tb',
            'sources_plant_remove_type_tb.id = remove.plant_remove_type_id',
          );
        // Import Date
        if (
          filterImportStart &&
          filterImportEnd &&
          filterImportStart != '' &&
          filterImportEnd != ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: filterImportStart,
              importEnd: filterImportEnd,
            },
          );
        }

        // Main Work Type
        if (filterMainWorkTypeDesc && filterMainWorkTypeDesc !== '') {
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
        if (filterEmployeeId && filterEmployeeId != '') {
          sub.andWhere('import.member_made = :employee ', {
            employee: filterEmployeeId,
          });
        }

        // TIME PER DAY
        if (filterTimePerDay && filterTimePerDay != '') {
          sub.andWhere('import.time_per_day = :time_per_day ', {
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
        'food_plant',
        'food_plant.food_id = result_group.food_plant_id',
      )
      .leftJoin(
        SourcesWorkType,
        'sources_work_type_tb',
        'sources_work_type_tb.id = result_group.work_type_id',
      );
    // Code
    if (filterReceiptCode && filterReceiptCode != '') {
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
    if (filterReceiptName && filterReceiptName != '') {
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
    if (filterFoodPlantDesc && filterFoodPlantDesc != '') {
      if (filterFoodPlantDescIsMatchAll == true) {
        query.andWhere('food_plant.description  LIKE :food ', {
          food: `${filterFoodPlantDesc}`,
        });
      } else {
        query.andWhere('food_plant.description  LIKE :food ', {
          food: `%${filterFoodPlantDesc}%`,
        });
      }
    }

    // Family main
    if (filterFamilyMainDesc && filterFamilyMainDesc != '') {
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
    if (filterCustomerId && filterCustomerId != '') {
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
    if (filterEmployeeId && filterEmployeeId != '') {
      query.andWhere('result_group.member_made = :employee ', {
        employee: filterEmployeeId,
      });
    }

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
        await this.logPlantImportNowRepository.update(
          { barcode }, // ค้นหาด้วย barcode
          {
            food_plant_id: `${input.update_food_id}`,
            work_type_id: input.update_work_type_id,
            main_work_type_id: input.update_main_work_type_id,
            import_date: input.update_import_date,
            receipt_id: input.update_receipt_id,
          },
        );
        totalNow++;
      }

      for (let i = 0; i < result.length; i++) {
        const barcode = result[i].barcode;
        await this.logPlantImportRepository.update(
          { barcode }, // ค้นหาด้วย barcode
          {
            food_plant_id: `${input.update_food_id}`,
            work_type_id: input.update_work_type_id,
            main_work_type_id: input.update_main_work_type_id,
            import_date: input.update_import_date,
            receipt_id: input.update_receipt_id,
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

  async deleteBarcode(input: LogImportDeleteInput): Promise<any> {
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

    const logPlantRemoveRepository =
      await this.logPlantRemoveRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
    if (logPlantRemoveRepository) {
      throw new HttpException(
        {
          code: 400,
          message: 'กรุณาลบประวัติการนำออกของ Barcode นี้ก่อนลบ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.logPlantImportNowRepository
      .createQueryBuilder()
      .delete()
      .where({ barcode: `${input.barcode}` })
      .execute();

    await this.logPlantImportRepository
      .createQueryBuilder()
      .delete()
      .where({ barcode: `${input.barcode}` })
      .execute();

    return {
      data: {},
    };
  }

  async deleteBarcodeByReceiptId(
    input: LogImportDeleteByReceiptIdInput,
  ): Promise<any> {
    await this.logPlantImportRepository
      .createQueryBuilder()
      .where('receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      })
      .delete()
      .execute();
    await this.logPlantImportNowRepository
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

  async deleteBarcodeRangeBarcode(
    input: LogImportDeleteRangeBarcodeInput,
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

    await this.logPlantImportNowRepository
      .createQueryBuilder()
      .where('barcode >= :barcode_start', {
        barcode_start: input.barcode_start,
      })
      .andWhere('barcode <= :barcode_end', {
        barcode_end: input.barcode_end,
      })
      .delete()
      .execute();

    await this.logPlantImportRepository
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

  async getLogPlantImportTotalByFood(
    input: LogImportGetTotalByFoodIdInput,
  ): Promise<any> {
    const results = await this.logPlantImportRepository.find({
      where: {
        food_plant_id: input.food_id,
      },
    });

    return results.length;
  }

  async getLogPlantImportTotalByWorkMainType(
    input: LogImportGetTotalByWorkMainTypeIdInput,
  ): Promise<any> {
    const results = await this.logPlantImportRepository.find({
      where: {
        main_work_type_id: input.main_work_type_id,
      },
    });

    return results.length;
  }

  async getLogPlantImportTotalByWorkType(
    input: LogImportGetTotalByWorkTypeIdInput,
  ): Promise<any> {
    const results = await this.logPlantImportRepository.find({
      where: {
        work_type_id: input.work_type_id,
      },
    });

    return results.length;
  }

  async getLogPlantImportTotalByReceiptId(
    input: LogImportGetTotalByReceiptIdInput,
  ): Promise<any> {
    const results = await this.logPlantImportRepository.find({
      where: {
        receipt_id: input.receipt_id,
      },
    });

    return results.length;
  }

  async getLogPlantImportByReceipt(
    input: LogImportGetByReceiptIdInput,
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

    const query = await this.logPlantImportRepository
      .createQueryBuilder('log_plant_import')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = log_plant_import.create_by',
      )
      .leftJoinAndSelect(
        SourcesWorkMainType,
        'sources_work_main_type',
        'sources_work_main_type.id = log_plant_import.main_work_type_id',
      )
      .leftJoinAndSelect(
        SourcesWorkType,
        'sources_work_type',
        'sources_work_type.id = log_plant_import.work_type_id',
      )
      .leftJoinAndSelect(
        FoodPlant,
        'food_plant',
        'food_plant.food_id = log_plant_import.food_plant_id',
      )
      .where('log_plant_import.receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      });

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

    const receiptEntities = await query
      .select([
        'log_plant_import.log_plant_import_id',
        'log_plant_import.barcode',
        'log_plant_import.receipt_id',
        'log_plant_import.member_made',
        'log_plant_import.import_date',
        'log_plant_import.food_plant_id',
        'log_plant_import.main_work_type_id',
        'log_plant_import.work_type_id',
        'member',
        'sources_work_main_type',
        'sources_work_type',
        'food_plant',
      ])
      .orderBy('log_plant_import.import_date', 'DESC')
      .getRawMany();

    const lists: any[] = [];
    for (let i = 0; i < receiptEntities.length; i++) {
      const row = receiptEntities[i];
      lists.push({
        log_plant_import_id: row.log_plant_import_log_plant_import_id,
        barcode: row.log_plant_import_barcode,
        import_date: row.log_plant_import_import_date,
        member_made: {
          member_id: row.member_member_id,
          username: row.member_username,
          name: row.member_name,
          surname: row.member_surname,
        },
        main_work_type: {
          id: row.sources_work_main_type_id,
          description: row.sources_work_main_type_description,
        },
        work_type: {
          id: row.sources_work_type_id,
          description: row.sources_work_type_description,
        },
        food_plant: {
          food_id: row.food_plant_food_id,
          description: row.food_plant_description,
        },
      });
    }

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: lists,
      },
    };
  }

  async getLogPlantImportDetailByBarcode(
    input: LogImportGetDetailByBarcodeInput,
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

    const row = await this.logPlantImportRepository
      .createQueryBuilder('log_plant_import')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = log_plant_import.member_made',
      )
      .leftJoinAndSelect(
        SourcesWorkMainType,
        'sources_work_main_type',
        'sources_work_main_type.id = log_plant_import.main_work_type_id',
      )
      .leftJoinAndSelect(
        SourcesWorkType,
        'sources_work_type',
        'sources_work_type.id = log_plant_import.work_type_id',
      )
      .leftJoinAndSelect(
        FoodPlant,
        'food_plant',
        'food_plant.food_id = log_plant_import.food_plant_id',
      )
      .leftJoinAndSelect(
        Receipt,
        'receipt',
        'receipt.receipt_id = log_plant_import.receipt_id',
      )
      .where('log_plant_import.barcode = :barcode', {
        barcode: input.barcode,
      })
      .select([
        'log_plant_import.log_plant_import_id',
        'log_plant_import.barcode',
        'log_plant_import.receipt_id',
        'log_plant_import.member_made',
        'log_plant_import.import_date',
        'log_plant_import.food_plant_id',
        'log_plant_import.main_work_type_id',
        'log_plant_import.work_type_id',
        'member',
        'receipt',
        'sources_work_main_type',
        'sources_work_type',
        'food_plant',
      ])
      .orderBy('log_plant_import.import_date', 'DESC')
      .getRawOne();

    const logPlantImportEntities = {
      log_plant_import_id: row.log_plant_import_log_plant_import_id,
      barcode: row.log_plant_import_barcode,
      import_date: row.log_plant_import_import_date,
      member_made: {
        member_id: row.member_member_id,
        username: row.member_username,
        name: row.member_name,
        surname: row.member_surname,
      },
      receipt: {
        receipt_id: row.receipt_receipt_id,
        code: row.receipt_code,
      },
      main_work_type: {
        id: row.sources_work_main_type_id,
        description: row.sources_work_main_type_description,
      },
      work_type: {
        id: row.sources_work_type_id,
        description: row.sources_work_type_description,
      },
      food_plant: {
        food_id: row.food_plant_food_id,
        description: row.food_plant_description,
      },
    };
    return {
      code: 200,
      data: logPlantImportEntities,
    };
  }

  async updateLogPlantImportGroupAll(
    input: LogImportUpdateGroupAllInput,
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

    // ALL
    const queryBuilder = this.logPlantImportRepository
      .createQueryBuilder('log_plant_import')
      .leftJoinAndSelect(
        LogPlantRemove,
        'log_plant_remove',
        'log_plant_remove.log_plant_import_id = log_plant_import.log_plant_import_id',
      )
      .leftJoinAndSelect(
        Receipt,
        'receipt',
        'receipt.receipt_id = log_plant_import.receipt_id',
      )
      .leftJoinAndSelect(
        PlantFamilyMain,
        'plant_family_main',
        'plant_family_main.id = receipt.family_main_id',
      )
      .leftJoinAndSelect(
        Customer,
        'customer',
        'customer.customer_id = receipt.customer_id',
      )
      .leftJoinAndSelect(
        FoodPlant,
        'food_plant',
        'food_plant.food_id = log_plant_import.food_plant_id',
      )
      .leftJoinAndSelect(
        SourcesWorkMainType,
        'sources_work_main_type',
        'sources_work_main_type.id = log_plant_import.main_work_type_id',
      );
    const filter = input.filter;
    // RECEIPT CODE
    if (filter.code) {
      const code = filter.code;
      const isMatchAllCode = filter.isMatchAllCode;
      queryBuilder.andWhere(`receipt.code LIKE :code`, {
        code: isMatchAllCode ? code : `%${code}%`,
      });
    }
    // RECEIPT NAME
    if (filter.name) {
      const name = filter.name;
      const isMatchAllName = filter.isMatchAllName;
      queryBuilder.andWhere(`receipt.name LIKE :name`, {
        name: isMatchAllName ? name : `%${name}%`,
      });
    }
    // PLANT FAMILY MAIN + RECEIPT
    if (filter.familyMain) {
      const familyMain = filter.familyMain;
      const isMatchAllFamilyMain = filter.isMatchAllFamilyMain;
      queryBuilder.andWhere(`plant_family_main.description LIKE :familyMain`, {
        familyMain: isMatchAllFamilyMain ? familyMain : `%${familyMain}%`,
      });
    }

    // CUSTOMER ID
    if (filter.customer) {
      const customer = filter.customer;
      const isMatchAllCustomer = filter.isMatchAllCustomer;
      queryBuilder.andWhere(`customer.customer_id LIKE :customer`, {
        customer: isMatchAllCustomer ? customer : `%${customer}%`,
      });
    }

    // REMOVE DATE START - END
    if (filter.removeStart && filter.removeEnd) {
      const removeStart = filter.removeStart;
      const removeEnd = filter.removeEnd;
      queryBuilder.andWhere(
        `(log_plant_remove.remove_date BETWEEN :removeStart AND :removeEnd)`,
        { removeStart, removeEnd },
      );
    }

    // IMPORT DATE START - END
    if (filter.importStart && filter.importEnd) {
      const importStart = filter.importStart;
      const importEnd = filter.importEnd;
      queryBuilder.andWhere(
        `(log_plant_import.import_date BETWEEN :importStart AND :importEnd)`,
        { importStart, importEnd },
      );
    }

    // FOOD PLANT
    if (filter.food) {
      const food = filter.food;
      const isMatchAllFood = filter.isMatchAllFood;
      queryBuilder.andWhere(`food_plant.description LIKE :food`, {
        food: isMatchAllFood ? food : `%${food}%`,
      });
    }

    // REMOVE BY EMPLOYEE ID
    if (filter.employee) {
      const employee = filter.employee;
      queryBuilder.andWhere(`log_plant_remove.create_by = :employee`, {
        employee,
      });
    }

    // WORK TYPE
    if (filter.workType) {
      const workType = filter.workType;
      queryBuilder.andWhere(`log_plant_import.work_type_id = :workType`, {
        workType,
      });
    }

    // WORK MAIN TYPE
    if (filter.mainTask) {
      const mainTask = filter.mainTask;
      queryBuilder.andWhere(
        `sources_work_main_type.description LIKE :mainTask`,
        {
          mainTask: `%${mainTask}%`,
        },
      );
    }

    // TIME PER DAY
    if (input.time_per_day) {
      const timePerDay = input.time_per_day;
      queryBuilder.andWhere(`log_plant_remove.time_per_day = :timePerDay`, {
        timePerDay,
      });
    }

    // PLANT REMOVE TYPE ID
    if (filter.plantRemoveTypeId && filter.plantRemoveTypeId != '0') {
      const plantRemoveTypeId = filter.plantRemoveTypeId;
      queryBuilder.andWhere(
        `log_plant_remove.plant_remove_type_id = :plantRemoveTypeId`,
        {
          plantRemoveTypeId,
        },
      );
    }

    const resultIds = await queryBuilder.getMany();
    const ids = resultIds.map((item) => item.log_plant_import_id);
    console.log(resultIds);
    // UPDATE REMOVE LOG
    const updateResult = await this.logPlantImportRepository
      .createQueryBuilder()
      .update(LogPlantRemove)
      .set({
        plant_remove_type_id: input.plant_remove_type_id,
        remove_date: input.remove_date,
        remark: input.remark,
      })
      .whereInIds(ids)
      .execute();

    // UPDATE REMOVE LOG NOW
    const updateNowResult = await this.logPlantImportNowRepository
      .createQueryBuilder()
      .update(LogPlantRemoveNow)
      .set({
        plant_remove_type_id: input.plant_remove_type_id,
        remove_date: input.remove_date,
        remark: input.remark,
      })
      .whereInIds(ids)
      .execute();
    return { updateResult, updateNowResult };
  }
  getStartIndexPage = (page: number, limit_per_page: number) => {
    return (page - 1) * limit_per_page;
  };
}
