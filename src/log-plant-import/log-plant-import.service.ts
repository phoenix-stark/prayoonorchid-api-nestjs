import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class LogPlantImportService {
  constructor(
    @Inject(forwardRef(() => LogTokenService))
    private readonly logTokenService: LogTokenService,
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(LogPlantImport)
    private readonly logPlantImportRepository: Repository<LogPlantImport>,
    @InjectRepository(LogPlantImportNow)
    private readonly logPlantImportNowRepository: Repository<LogPlantImportNow>,
    @InjectRepository(LogPlantRemoveNow)
    private readonly logPlantRemoveNowRepository: Repository<LogPlantRemoveNow>,
    @InjectRepository(FoodPlant)
    private readonly foodPlantRepository: Repository<FoodPlant>,
    @InjectRepository(SourcesWorkType)
    private readonly sourcesWorkTypeRepository: Repository<SourcesWorkType>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private memberWithBarcodeService: MemberWithBarcodeService,
    private receiptService: ReceiptService,
    private momentWrapper: MomentService,
  ) {}

  async getReceipts(): Promise<any[]> {
    return await this.logPlantImportRepository.find();
  }

  async insertBarcode(input: LogImportCreateInput): Promise<any> {
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
          cose: 400,
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
          const receiptEntity = await this.receiptRepository.findOne({
            where: {
              code: input.reciept_code,
            },
          });
          if (receiptEntity) {
            recipetId = receiptEntity.receipt_id;
          }
        }
        if (!recipetId) {
          return {
            cose: 400,
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
        logEntity.member_made = memberWithBarcodeEntity.member_id;
        logEntity.receipt_id = recipetId;
        logEntity.time_per_day = parseInt(timePerDay);
        logEntity.work_type_id = workTypeEntity.id;
        const newLogPlant = await this.logPlantImportRepository.save(logEntity);

        logEntity.log_plant_import_id = newLogPlant.log_plant_import_id;
        console.log('logEntity:');
        console.log(logEntity);
        await this.logPlantImportNowRepository.save(logEntity);
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
        cose: 400,
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
    logPlantImportNowEntity.receipt_id = input.reciept_id;
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
    logPlantImportRepositoryEntity.receipt_id = input.reciept_id;
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

  async updateBarcodeAll(input: LogImportUpdateAllInput): Promise<any> {
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

    const receiptEntity = await this.receiptRepository.findOne({
      where: {
        code: input.reciept_code,
      },
    });
    for (let i = 0; i < input.barcodes.length; i++) {
      const barcode = input.barcodes[i];
      const logPlantImportNowEntity =
        await this.logPlantImportNowRepository.findOne({
          where: {
            barcode: `${barcode}`,
          },
        });
      logPlantImportNowEntity.food_plant_id = `${input.food_id}`;
      logPlantImportNowEntity.work_type_id = input.work_type_id;
      logPlantImportNowEntity.main_work_type_id = input.main_work_type_id;
      logPlantImportNowEntity.import_date = input.import_date;
      logPlantImportNowEntity.receipt_id = receiptEntity.receipt_id;
      const resultLogNow = await this.logPlantImportNowRepository.save(
        logPlantImportNowEntity,
      );

      const logPlantImportRepositoryEntity =
        await this.logPlantImportRepository.findOne({
          where: {
            barcode: `${barcode}`,
          },
        });
      logPlantImportRepositoryEntity.food_plant_id = `${input.food_id}`;
      logPlantImportRepositoryEntity.work_type_id = input.work_type_id;
      logPlantImportRepositoryEntity.main_work_type_id =
        input.main_work_type_id;
      logPlantImportRepositoryEntity.import_date = input.import_date;
      logPlantImportRepositoryEntity.receipt_id = receiptEntity.receipt_id;
      const resultLog = await this.logPlantImportRepository.save(
        logPlantImportRepositoryEntity,
      );
    }
    return {
      data: {
        barcodes: input.barcodes,
      },
    };
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

    const logPlantRemoveNowEntity =
      await this.logPlantRemoveNowRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
    if (logPlantRemoveNowEntity) {
      return {
        code: 400,
        message: 'กรุณาลบประวัติการนำออกของ Barcode นี้ก่อนลบ',
      };
    }
    const logPlantImportNowEntity =
      await this.logPlantImportNowRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
    await this.logPlantImportNowRepository.delete(logPlantImportNowEntity);

    const logPlantImportRepositoryEntity =
      await this.logPlantImportRepository.findOne({
        where: {
          barcode: `${input.barcode}`,
        },
      });
    await this.logPlantImportRepository.delete(logPlantImportRepositoryEntity);

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

    const result = await this.logPlantImportRepository
      .createQueryBuilder('log_plant_import')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = log_plant_import.member_made',
      )
      .leftJoinAndSelect(
        PlantFamilyMain,
        'plant_family_main',
        'plant_family_main.id = log_plant_import.main_work_type_id',
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
        'plant_family_main',
        'food_plant',
      ])
      .orderBy('log_plant_import.import_date', 'DESC')
      .getRawMany();
    const logPlantImportEntities = result.map((row: any) => ({
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
        id: row.plant_family_main_id,
        description: row.plant_family_main_description,
      },
      work_type: {
        id: row.food_plant_food_id,
        description: row.food_plant_description,
      },
      food_plant: {
        food_id: row.food_plant_food_id,
        description: row.food_plant_description,
      },
    }));
    return {
      code: 200,
      data: logPlantImportEntities,
    };
    return result;
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

    const result = await this.logPlantImportRepository
      .createQueryBuilder('log_plant_import')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = log_plant_import.member_made',
      )
      .leftJoinAndSelect(
        PlantFamilyMain,
        'plant_family_main',
        'plant_family_main.id = log_plant_import.main_work_type_id',
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
        'plant_family_main',
        'food_plant',
      ])
      .orderBy('log_plant_import.import_date', 'DESC')
      .getRawMany();

    const logPlantImportEntities = result.map((row: any) => ({
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
        id: row.plant_family_main_id,
        description: row.plant_family_main_description,
      },
      work_type: {
        id: row.food_plant_food_id,
        description: row.food_plant_description,
      },
      food_plant: {
        food_id: row.food_plant_food_id,
        description: row.food_plant_description,
      },
    }));
    return {
      code: 200,
      data: logPlantImportEntities,
    };
    return result;
  }
}
