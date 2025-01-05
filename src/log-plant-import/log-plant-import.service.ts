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
import { LogPlantRemoveNow } from 'src/log_plant_remove/entity/log-plant-remove-now-entity.model';
import { LogImportDeleteRangeBarcodeInput } from './dto/log-import-delete-range-barcode.input';
import { LogImportDeleteByReceiptIdInput } from './dto/log-import-delete-by-receipt-id.input';
import { LogImportGetTotalByFoodIdInput } from './dto/log-import-get-total-by-foodid.input';
import { LogImportGetTotalByWorkMainTypeIdInput } from './dto/log-import-get-total-by-workmaintypeid.input';
import { LogImportGetTotalByWorkTypeIdInput } from './dto/log-import-get-total-by-worktypeid.input';
import { MemberWithBarcodeGetByBarcodeInput } from 'src/member-with-barcode/dto/member-with-barcode-get-by-barcode.input';
import { MemberWithBarcodeService } from 'src/member-with-barcode/member-with-barcode.service';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';

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
}
