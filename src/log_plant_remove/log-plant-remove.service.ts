import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogPlantRemove } from './entity/log-plant-remove-entity.model';
import { LogRemoveCreateInput } from './dto/log-remove-create.input';
import { LogToken } from 'src/log_token/entity/log-token-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { LogPlantImportNow } from 'src/log_plant_import/entity/log-plant-import-now-entity.model';
import { LogPlantRemoveNow } from './entity/log-plant-remove-now-entity.model';
import { LogRemoveDeleteInput } from './dto/log-remove-delete.input';
import { LogRemoveUpdateInput } from './dto/log-remove-update.input';
import { MemberWithBarcodeGetByBarcodeInput } from 'src/member_with_barcode/dto/member-with-barcode-get-by-barcode.input';
import { MemberWithBarcodeService } from 'src/member_with_barcode/member-with-barcode.service';
import { LogRemoveUpdateAllInput } from './dto/log-remove-update-all.input';
import { LogRemoveDeleteRangeBarcodeInput } from './dto/log-remove-delete-range-barcode.input';
import { LogRemoveDeleteByReceiptIdInput } from './dto/log-remove-delete-by-receipt-id.input';

@Injectable()
export class LogPlantRemoveService {
  constructor(
    @InjectRepository(LogPlantRemove)
    private readonly logPlantRemoveRepository: Repository<LogPlantRemove>,
    @InjectRepository(LogPlantRemoveNow)
    private readonly logPlantRemoveNowRepository: Repository<LogPlantRemoveNow>,
    @InjectRepository(LogPlantImportNow)
    private readonly logPlantImportNowRepository: Repository<LogPlantImportNow>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(LogToken)
    private readonly logTokenRepository: Repository<LogToken>,
    private memberWithBarcodeService: MemberWithBarcodeService,
    private momentWrapper: MomentService,
  ) {}

  async insertBarcode(input: LogRemoveCreateInput): Promise<any> {
    // Check Member
    let memberEntity = null;
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity) {
      return {
        code: 400,
        message: 'Username นี้ ถูก Block',
      };
    } else {
      memberEntity = await this.memberRepository.findOne({
        where: {
          member_id: logTokenEntity.member_id,
        },
      });
      if (!memberEntity || memberEntity.is_block === '1') {
        return {
          code: 400,
          message: 'Username นี้ ถูก Block',
        };
      }
    }

    const logPlantImport = await this.logPlantImportNowRepository.findOne({
      where: {
        barcode: `${input.barcode}`,
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
      logEntity.barcode = `${input.barcode}`;
      logEntity.create_at = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      logEntity.create_by = memberEntity.member_id;

      logEntity.plant_remove_type_id = input.plant_remove_type_id;
      logEntity.receipt_id = input.reciept_id;
      logEntity.remark = input.remark;
      logEntity.remove_date = input.remove_date;
      logEntity.time_per_day = parseInt(timePerDay);

      const newLogPlant = await this.logPlantRemoveNowRepository.save(
        logEntity,
      );
      await this.logPlantRemoveRepository.save(newLogPlant);

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
    let memberEntity = null;
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity) {
      return {
        code: 400,
        message: 'Username นี้ ถูก Block',
      };
    } else {
      memberEntity = await this.memberRepository.findOne({
        where: {
          member_id: logTokenEntity.member_id,
        },
      });
      if (!memberEntity || memberEntity.is_block === '1') {
        return {
          code: 400,
          message: 'Username นี้ ถูก Block',
        };
      }
    }

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

    if (!logPlantRemoveNow) {
      // TIME PER DAY
      let timePerDay = '0';
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
      logPlantRemoveNow.create_by = memberEntity.member_id;
      logPlantRemoveNow.remark = input.remark;
      logPlantRemoveNow.time_per_day = parseInt(timePerDay);
      await this.logPlantRemoveRepository.save(logPlantRemoveNow);
      await this.logPlantRemoveNowRepository.save(logPlantRemoveNow);
    } else {
      if (
        input.plant_remove_type_id == -1 ||
        !input.remove_date ||
        input.remove_date == ''
      ) {
        logPlantRemoveNow.remove_date = null;
        logPlantRemoveNow.plant_remove_type_id = null;
        logPlantRemoveNow.remark = '';
        logPlantRemoveNow.create_by = memberEntity.member_id;
      } else {
        logPlantRemoveNow.remove_date = input.remove_date;
        logPlantRemoveNow.plant_remove_type_id = input.plant_remove_type_id;
        logPlantRemoveNow.create_by = memberEntity.member_id;
        logPlantRemoveNow.remark = input.remark;
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
    let memberEntity = null;
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity) {
      return {
        code: 400,
        message: 'Username นี้ ถูก Block',
      };
    } else {
      memberEntity = await this.memberRepository.findOne({
        where: {
          member_id: logTokenEntity.member_id,
        },
      });
      if (!memberEntity || memberEntity.is_block === '1') {
        return {
          code: 400,
          message: 'Username นี้ ถูก Block',
        };
      }
    }

    for (let i = 0; i < input.barcodes.length; i++) {
      const barcode = input.barcodes[i];
      const logPlantImportNowEntity =
        await this.logPlantImportNowRepository.findOne({
          where: {
            barcode: `${barcode}`,
          },
        });
      if (logPlantImportNowEntity) {
        const logPlantRemoveNow =
          await this.logPlantRemoveNowRepository.findOne({
            where: {
              barcode: `${barcode}`,
            },
          });
        if (logPlantRemoveNow) {
          logPlantRemoveNow.remove_date = input.remove_date;
          logPlantRemoveNow.plant_remove_type_id = input.plant_remove_type_id;
          logPlantRemoveNow.create_by = memberEntity.member_id;
          logPlantRemoveNow.remark = input.remark;
          await this.logPlantRemoveNowRepository.save(logPlantRemoveNow);
        }

        const logPlantRemove = await this.logPlantRemoveRepository.findOne({
          where: {
            barcode: `${barcode}`,
          },
        });
        if (logPlantRemove) {
          logPlantRemove.remove_date = input.remove_date;
          logPlantRemove.plant_remove_type_id = input.plant_remove_type_id;
          logPlantRemove.create_by = memberEntity.member_id;
          logPlantRemove.remark = input.remark;
          await this.logPlantRemoveRepository.save(logPlantRemove);
        }
      }
    }
    return {
      data: {
        barcodes: input.barcodes,
      },
    };
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
    let memberEntity = null;
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity) {
      return {
        code: 400,
        message: 'Username นี้ ถูก Block',
      };
    } else {
      memberEntity = await this.memberRepository.findOne({
        where: {
          member_id: logTokenEntity.member_id,
        },
      });
      if (!memberEntity || memberEntity.is_block === '1') {
        return {
          code: 400,
          message: 'Username นี้ ถูก Block',
        };
      }
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
    let memberEntity = null;
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity) {
      return {
        code: 400,
        message: 'Username นี้ ถูก Block',
      };
    } else {
      memberEntity = await this.memberRepository.findOne({
        where: {
          member_id: logTokenEntity.member_id,
        },
      });
      if (!memberEntity || memberEntity.is_block === '1') {
        return {
          code: 400,
          message: 'Username นี้ ถูก Block',
        };
      }
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
}
