import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import moment from 'moment-timezone';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { LogPlantImport } from 'src/log-plant-import/entity/log-plant-import-entity.model';
import { LogPlantRemove } from 'src/log-plant-remove/entity/log-plant-remove-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Receipt } from 'src/receipt/entity/receipt-entity.model';
import { SourcesPlantRemoveType } from 'src/sources-plant-remove-type/entity/sources-plant-remove-type-entity.model';
import { SourcesWorkMainType } from 'src/sources-work-main-type/entity/sources-work-main-type-entity.model';
import { SourcesWorkType } from 'src/sources-work-type/entity/sources-work-type-entity.model';
import { Connection, Repository } from 'typeorm';
import { ReportGetInput } from './dto/report-get.input';
import { FilterObject } from './modal/filter';
import { FilterMultipleObject } from './modal/filterMultiple';
import { ReportBottleResponse } from './modal/report-bottle.response';
import {
  ReportPlantFailData,
  ReportPlantFailResponse,
} from './modal/report-plant-fail.response';
import { ReportProductionResponse } from './modal/report-production.response';
import { ReportRemoveAllResponse } from './modal/report-remove-all.response';
import { ReportStockResponse } from './modal/report-stock.response';
import { ReportGetByBarcodeInput } from './dto/report-get-barcode.input';
import { ReportGetLogPlantImportGroupingInput } from './dto/report-get-log-plant-import-grouping.input';
import { ReportGetLogPlantImportGroupingDetailInput } from './dto/report-get-log-plant-import-grouping-detail.input';
import { ReportGetLogPlantRemoveGroupingInput } from './dto/report-get-log-plant-remove-grouping.input';
import { ReportGetLogPlantRemoveTimeInput } from './dto/report-get-log-plant-remove-time.input';
import { ReportGetLogPlantRemoveGroupingDetailInput } from './dto/report-get-log-plant-remove-grouping-detail.input';
import { ReportGetProductionMultipleInput } from './dto/report-get-production-multiple.input';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
import { ReportGetStockInput } from './dto/report-get-stock.input';
import { ReportGetBottleInput } from './dto/report-get-bottle.input';
import { ReportGetFailInput } from './dto/report-get-fail.input';
import { ReportGetRemoveAllInput } from './dto/report-get-remove-all.input';

@Injectable()
export class ReportService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    @InjectRepository(LogPlantImport)
    private readonly logPlantImportRepository: Repository<LogPlantImport>,
  ) {}
  async getReportProduction(
    input: ReportGetInput,
  ): Promise<ReportProductionResponse> {
    const filter = this.getFilter(input.filter);
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('import.import_date', 'import_date')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .addSelect('COUNT(*)', 'total_import')
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 1 then 1 else 0 end)',
            'remove_type_1',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 2 then 1 else 0 end)',
            'remove_type_2',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 3 then 1 else 0 end)',
            'remove_type_3',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 4 then 1 else 0 end)',
            'remove_type_4',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 5 then 1 else 0 end)',
            'export',
          )
          .from(LogPlantImport, 'import')
          .groupBy('import.import_date')
          .addGroupBy('import.member_made')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('import.food_plant_id')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          );
        // Code
        if (filter.filter[1].plant_code.description != '') {
          if (filter.filter[1].plant_code.is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${filter.filter[1].plant_code.description}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${filter.filter[1].plant_code.description}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Import Date
        if (
          filter.filter[8].import_start_date.description !== '' &&
          filter.filter[9].import_end_date.description !== ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: filter.filter[8].import_start_date.description,
              importEnd: filter.filter[9].import_end_date.description,
            },
          );
        }

        // Main Work Type
        if (filter.filter[7].main_task.description !== '') {
          sub.andWhere('sources_work_main_type_tb.description = :mainTask ', {
            mainTask: filter.filter[7].main_task.description,
          });
        }
        // Work Type
        if (filter.filter[3].work_type.id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: filter.filter[3].work_type.id,
          });
        }

        // Food
        if (filter.filter[4].food.description !== '') {
          if (filter.filter[4].food.is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${filter.filter[4].food.description}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${filter.filter[4].food.description}%`,
            });
          }
        }

        // Employee
        if (filter.filter[6].employee.id !== '') {
          sub.andWhere('import.member_made = :employee ', {
            employee: filter.filter[6].employee.id,
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
      );

    // Code
    if (filter.filter[1].plant_code.description !== '') {
      if (filter.filter[1].plant_code.is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${filter.filter[1].plant_code.description}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${filter.filter[1].plant_code.description}%`,
        });
      }
    } else {
      query.andWhere('receipt_tb.code  LIKE :code ', {
        code: `%%`,
      });
    }

    // Receipt Name
    if (filter.filter[0].plant_name.description !== '') {
      if (filter.filter[0].plant_name.is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `${filter.filter[0].plant_name.description}`,
        });
      } else {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `%${filter.filter[0].plant_name.description}%`,
        });
      }
    }

    // Family main
    if (filter.filter[2].family_main.description !== '') {
      if (filter.filter[2].family_main.is_match_all + '' == 'true') {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `${filter.filter[2].family_main.description}`,
        });
      } else {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `%${filter.filter[2].family_main.description}%`,
        });
      }
    }

    // Customer
    if (filter.filter[5].customer.id !== '') {
      if (filter.filter[5].customer.is_match_all + '' == 'true') {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `${filter.filter[5].customer.id}`,
        });
      } else {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `%${filter.filter[5].customer.id}%`,
        });
      }
    }

    // Employee
    if (filter.filter[6].employee.id !== '') {
      query.andWhere('result_group.member_made = :employee ', {
        employee: filter.filter[6].employee.id,
      });
    }

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('result_group.import_date', 'import_date')
      .addSelect('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('food_plant_tb.description', 'food')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect('result_group.remove_type_1', 'remove_type_1')
      .addSelect('result_group.remove_type_2', 'remove_type_2')
      .addSelect('result_group.remove_type_3', 'remove_type_3')
      .addSelect('result_group.remove_type_4', 'remove_type_4')
      .addSelect('result_group.export', 'export')
      .addSelect(
        '(result_group.total_import - ( result_group.remove_type_1 + result_group.remove_type_2 + result_group.remove_type_3 + result_group.remove_type_4 + result_group.export )  )',
        'summary',
      );

    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    const data = await query.getRawMany();

    const result = {
      total: totalAll.total,
      data: data,
    } as ReportProductionResponse;
    return result;
  }

  async getReportProductionMultiple(
    input: ReportGetProductionMultipleInput,
  ): Promise<ReportProductionResponse> {
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('import.import_date', 'import_date')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .addSelect('COUNT(*)', 'total_import')
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 1 then 1 else 0 end)',
            'remove_type_1',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 2 then 1 else 0 end)',
            'remove_type_2',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 3 then 1 else 0 end)',
            'remove_type_3',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 4 then 1 else 0 end)',
            'remove_type_4',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 5 then 1 else 0 end)',
            'export',
          )
          .from(LogPlantImport, 'import')
          .groupBy('import.import_date')
          .addGroupBy('import.member_made')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('import.food_plant_id')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          );
        // Code
        if (input.receipt_code_desc && input.receipt_code_desc != '') {
          if (input.receipt_code_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${input.receipt_code_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${input.receipt_code_desc}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Import Date
        if (
          input.import_start_date &&
          input.import_end_date &&
          input.import_start_date !== '' &&
          input.import_end_date !== ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: input.import_start_date,
              importEnd: input.import_end_date,
            },
          );
        }

        // Main Work Type Multiple **
        if (input.work_main_types) {
          const itemMainTask = JSON.parse(input.work_main_types);
          const strId = [];
          for (let b = 0; b < itemMainTask.length; b++) {
            const id = itemMainTask[b].id;
            strId.push(id);
          }
          console.log(strId);
          if (strId.length > 0) {
            sub.andWhere('sources_work_main_type_tb.id IN (:mainTask)', {
              mainTask: strId,
            });
          }
        }
        // Work Type
        if (input.work_type_id && input.work_type_id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: input.work_type_id,
          });
        }

        // Food
        if (input.food_plant_desc && input.food_plant_desc !== '') {
          if (input.food_plant_is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${input.food_plant_desc}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${input.food_plant_desc}%`,
            });
          }
        }

        // // Employee
        // if (input.employee_id && input.employee_id !== '') {
        //   sub.andWhere('import.member_made = :employee ', {
        //     employee: input.employee_id,
        //   });
        // }

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
      );

    // Code
    if (input.receipt_code_desc && input.receipt_code_desc != '') {
      if (input.receipt_code_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${input.receipt_code_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${input.receipt_code_desc}%`,
        });
      }
    } else {
      query.andWhere('receipt_tb.code  LIKE :code ', {
        code: `%%`,
      });
    }

    // Receipt Name
    if (input.receipt_name_desc && input.receipt_name_desc != '') {
      if (input.receipt_name_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
          receipt_name: `${input.receipt_name_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
          receipt_name: `%${input.receipt_name_desc}%`,
        });
      }
    }

    // Family main
    if (input.family_main_desc && input.family_main_desc !== '') {
      if (input.family_main_is_match_all == true) {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `${input.family_main_desc}`,
        });
      } else {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `%${input.family_main_desc}%`,
        });
      }
    }

    // Customer
    if (input.customer_id_desc && input.customer_id_desc != '') {
      if (input.customer_id_is_match_all + '' == 'true') {
        query.andWhere('( customer_tb.name  LIKE :customer  )', {
          customer: `${input.customer_id_desc}`,
        });
      } else {
        query.andWhere('( customer_tb.name  LIKE :customer  )', {
          customer: `%${input.customer_id_desc}%`,
        });
      }
    }

    // Employee
    console.log('employee-where');
    console.log(input);
    console.log('input.employee_id: ' + input.employee_id);
    console.log(
      'input.employee_id_is_match_all: ' + input.employee_id_is_match_all,
    );
    if (input.employee_id && input.employee_id != '') {
      const parts = input.employee_id.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || null;

      if (input.employee_id_is_match_all + '' == 'true') {
        console.log('CASE11');
        // ต้องตรงทั้งชื่อและนามสกุล
        query.andWhere('member_tb.name LIKE :firstName', {
          firstName: `${firstName}`,
        });
        query.andWhere('member_tb.surname LIKE :lastName', {
          lastName: `${lastName}`,
        });
      } else {
        // ตรงชื่อหรือนามสกุล อย่างใดอย่างหนึ่งก็ได้
        console.log('CASE22');
        console.log(firstName);
        console.log(lastName);
        query.andWhere(
          '((member_tb.name LIKE :firstName OR member_tb.surname LIKE :lastName) OR (member_tb.surname LIKE :firstName OR member_tb.name LIKE :lastName))',
          {
            firstName: `%${firstName}%`,
            lastName: `%${lastName}%`,
          },
        );
      }
    }

    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('result_group.import_date', 'import_date')
      .addSelect('member_tb.member_id', 'member_id')
      .addSelect('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('customer_tb.customer_id', 'customer_id')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.id', 'main_work_type_id')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.id', 'work_type_id')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('food_plant_tb.food_id', 'food_id')
      .addSelect('food_plant_tb.description', 'food')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect('result_group.remove_type_1', 'remove_type_1')
      .addSelect('result_group.remove_type_2', 'remove_type_2')
      .addSelect('result_group.remove_type_3', 'remove_type_3')
      .addSelect('result_group.remove_type_4', 'remove_type_4')
      .addSelect('result_group.export', 'export')
      .addSelect(
        '(result_group.total_import - ( result_group.remove_type_1 + result_group.remove_type_2 + result_group.remove_type_3 + result_group.remove_type_4 + result_group.export )  )',
        'summary',
      );

    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    const data = await query.getRawMany();

    const result = {
      start_index: startIndex,
      end_index: endIndex,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as any;
    return result;
  }

  async getReportStock(input: ReportGetInput): Promise<ReportStockResponse> {
    const filter = this.getFilter(input.filter);
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('LEFT(import.import_date, 7)', 'import_date')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .addSelect('import.member_made', 'member_made')
          .addSelect('COUNT(*)', 'total_import')
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 1 then 1 else 0 end)',
            'remove_type_1',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 2 then 1 else 0 end)',
            'remove_type_2',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 3 then 1 else 0 end)',
            'remove_type_3',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 4 then 1 else 0 end)',
            'remove_type_4',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 5 then 1 else 0 end)',
            'export',
          )
          .from(LogPlantImport, 'import')
          .groupBy('LEFT(import.import_date, 7)')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('import.food_plant_id')
          .addGroupBy('import.member_made')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          );
        // Code
        if (filter.filter[1].plant_code.description !== '') {
          if (filter.filter[1].plant_code.is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${filter.filter[1].plant_code.description}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${filter.filter[1].plant_code.description}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Import Date
        if (
          filter.filter[8].import_start_date.description !== '' &&
          filter.filter[9].import_end_date.description !== ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: filter.filter[8].import_start_date.description,
              importEnd: filter.filter[9].import_end_date.description,
            },
          );
        }

        // Main Work Type
        if (filter.filter[7].main_task.description !== '') {
          sub.andWhere('sources_work_main_type_tb.description = :mainTask ', {
            mainTask: filter.filter[7].main_task.description,
          });
        }
        // Work Type
        if (filter.filter[3].work_type.id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: filter.filter[3].work_type.id,
          });
        }

        // Food
        if (filter.filter[4].food.description !== '') {
          if (filter.filter[4].food.is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${filter.filter[4].food.description}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${filter.filter[4].food.description}%`,
            });
          }
        }

        // Employee
        if (filter.filter[6].employee.id !== '') {
          sub.andWhere('import.member_made = :employee ', {
            employee: filter.filter[6].employee.id,
          });
        }

        return sub;
      }, 'result_group')
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
      );
    // Code
    if (filter.filter[1].plant_code.description !== '') {
      if (filter.filter[1].plant_code.is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${filter.filter[1].plant_code.description}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${filter.filter[1].plant_code.description}%`,
        });
      }
    } else {
      query.andWhere('receipt_tb.code  LIKE :code ', {
        code: `%%`,
      });
    }

    // Receipt Name
    if (filter.filter[0].plant_name.description !== '') {
      if (filter.filter[0].plant_name.is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `${filter.filter[0].plant_name.description}`,
        });
      } else {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `%${filter.filter[0].plant_name.description}%`,
        });
      }
    }

    // Family main
    if (filter.filter[2].family_main.description !== '') {
      if (filter.filter[2].family_main.is_match_all + '' == 'true') {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `${filter.filter[2].family_main.description}`,
        });
      } else {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `%${filter.filter[2].family_main.description}%`,
        });
      }
    }

    // Customer
    if (filter.filter[5].customer.id !== '') {
      if (filter.filter[5].customer.is_match_all + '' == 'true') {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `${filter.filter[5].customer.id}`,
        });
      } else {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `%${filter.filter[5].customer.id}%`,
        });
      }
    }

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('result_group.import_date', 'import_date')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('food_plant_tb.description', 'food')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect('result_group.remove_type_1', 'remove_type_1')
      .addSelect('result_group.remove_type_2', 'remove_type_2')
      .addSelect('result_group.remove_type_3', 'remove_type_3')
      .addSelect('result_group.remove_type_4', 'remove_type_4')
      .addSelect('result_group.export', 'export')
      .addSelect(
        '(result_group.total_import - ( result_group.remove_type_1 + result_group.remove_type_2 + result_group.remove_type_3 + result_group.remove_type_4 + result_group.export )  )',
        'summary',
      );

    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    const data = await query.getRawMany();
    const result = {
      total: totalAll.total,
      data: data,
    } as ReportStockResponse;
    return result;
  }

  async getReportStockMultiple(
    input: ReportGetStockInput,
  ): Promise<ReportStockResponse> {
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('LEFT(import.import_date, 7)', 'import_date')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          // .addSelect('import.member_made', 'member_made')
          .addSelect('COUNT(*)', 'total_import')
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 1 then 1 else 0 end)',
            'remove_type_1',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 2 then 1 else 0 end)',
            'remove_type_2',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 3 then 1 else 0 end)',
            'remove_type_3',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 4 then 1 else 0 end)',
            'remove_type_4',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 5 then 1 else 0 end)',
            'export',
          )
          .from(LogPlantImport, 'import')
          .groupBy('LEFT(import.import_date, 7)')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('import.food_plant_id')
          // .addGroupBy('import.member_made')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          );
        // Code
        if (input.receipt_code_desc && input.receipt_code_desc != '') {
          if (input.receipt_code_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${input.receipt_code_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${input.receipt_code_desc}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Receipt Name
        if (input.receipt_name_desc && input.receipt_name_desc !== '') {
          if (input.receipt_name_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.name  LIKE :food ', {
              food: `${input.receipt_name_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.name  LIKE :food ', {
              food: `%${input.receipt_name_desc}%`,
            });
          }
        }

        // Import Date
        if (
          input.import_start_date &&
          input.import_end_date &&
          input.import_start_date !== '' &&
          input.import_end_date !== ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: input.import_start_date,
              importEnd: input.import_end_date,
            },
          );
        }

        // Main Work Type Multiple **
        if (input.work_main_types) {
          const itemMainTask = JSON.parse(input.work_main_types);
          const strId = [];
          for (let b = 0; b < itemMainTask.length; b++) {
            const id = itemMainTask[b].id;
            strId.push(id);
          }
          console.log(strId);
          if (strId.length > 0) {
            sub.andWhere('sources_work_main_type_tb.id IN (:mainTask)', {
              mainTask: strId,
            });
          }
        }

        // Work Type
        if (input.work_type_id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: input.work_type_id,
          });
        }

        // Food
        if (input.food_plant_desc && input.food_plant_desc !== '') {
          if (input.food_plant_is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${input.food_plant_desc}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${input.food_plant_desc}%`,
            });
          }
        }
        return sub;
      }, 'result_group')
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
      );
    // .leftJoin(
    //   Member,
    //   'member_tb',
    //   'member_tb.member_id = result_group.member_made',
    // );
    // Code
    if (input.receipt_code_desc && input.receipt_code_desc !== '') {
      if (input.receipt_code_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${input.receipt_code_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${input.receipt_code_desc}%`,
        });
      }
    } else {
      query.andWhere('receipt_tb.code  LIKE :code ', {
        code: `%%`,
      });
    }

    // Receipt Name
    if (input.receipt_name_desc && input.receipt_name_desc !== '') {
      if (input.receipt_name_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `${input.receipt_name_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `%${input.receipt_name_desc}%`,
        });
      }
    }

    // // Employee
    // if (input.employee_id && input.employee_id != '') {
    //   const parts = input.employee_id.trim().split(' ');
    //   const firstName = parts[0];
    //   const lastName = parts[1] || null;

    //   if (input.employee_id_is_match_all + '' == 'true') {
    //     // ต้องตรงทั้งชื่อและนามสกุล
    //     query.andWhere('member_tb.name LIKE :firstName', {
    //       firstName: `${firstName}`,
    //     });
    //     query.andWhere('member_tb.surname LIKE :lastName', {
    //       lastName: `${lastName}`,
    //     });
    //   } else {
    //     // ตรงชื่อหรือนามสกุล อย่างใดอย่างหนึ่งก็ได้
    //     query.andWhere(
    //       '(member_tb.name LIKE :firstName OR member_tb.surname LIKE :lastName OR member_tb.surname LIKE :firstName OR member_tb.name LIKE :lastName)',
    //       {
    //         firstName: `%${firstName}%`,
    //         lastName: `%${lastName}%`,
    //       },
    //     );
    //   }
    // }

    // Family main
    if (input.family_main_desc && input.family_main_desc !== '') {
      if (input.family_main_is_match_all + '' == 'true') {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `${input.family_main_desc}`,
        });
      } else {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `%${input.family_main_desc}%`,
        });
      }
    }

    // Customer
    if (input.customer_id_desc && input.customer_id_desc !== '') {
      if (input.customer_id_is_match_all + '' == 'true') {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `${input.customer_id_desc}`,
        });
      } else {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `%${input.customer_id_desc}%`,
        });
      }
    }

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('result_group.import_date', 'import_date')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('customer_tb.name', 'customer_name')
      // .addSelect('member_tb.name', 'member_name')
      // .addSelect('member_tb.surname', 'member_surname')
      // .addSelect('result_group.member_made', 'member_made')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('food_plant_tb.description', 'food')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect('result_group.remove_type_1', 'remove_type_1')
      .addSelect('result_group.remove_type_2', 'remove_type_2')
      .addSelect('result_group.remove_type_3', 'remove_type_3')
      .addSelect('result_group.remove_type_4', 'remove_type_4')
      .addSelect('result_group.export', 'export')
      .addSelect(
        '(result_group.total_import - ( result_group.remove_type_1 + result_group.remove_type_2 + result_group.remove_type_3 + result_group.remove_type_4 + result_group.export )  )',
        'summary',
      );

    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC');

    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    const data = await query.getRawMany();
    console.log(await query.getSql());

    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const result = {
      start_index: startIndex,
      end_index: endIndex,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as any;
    return result;
  }

  async getReportBottle(
    input: ReportGetBottleInput,
  ): Promise<ReportBottleResponse> {
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('import.import_date', 'import_date')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .addSelect('COUNT(*)', 'total_import')
          .from(LogPlantImport, 'import')
          .groupBy('import.import_date')
          .addGroupBy('import.member_made')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('import.food_plant_id')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          );
        // Code
        if (input.receipt_code_desc && input.receipt_code_desc !== '') {
          if (input.receipt_code_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${input.receipt_code_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${input.receipt_code_desc}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Import Date
        if (
          input.import_start_date &&
          input.import_end_date &&
          input.import_start_date !== '' &&
          input.import_end_date !== ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: input.import_start_date,
              importEnd: input.import_end_date,
            },
          );
        }

        // Main Work Type Multiple **
        if (input.work_main_types) {
          const itemMainTask = JSON.parse(input.work_main_types);
          const strId = [];
          for (let b = 0; b < itemMainTask.length; b++) {
            const id = itemMainTask[b].id;
            strId.push(id);
          }
          console.log(strId);
          if (strId.length > 0) {
            sub.andWhere('sources_work_main_type_tb.id IN (:mainTask)', {
              mainTask: strId,
            });
          }
        }

        // Work Type
        if (input.work_type_id && input.work_type_id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: input.work_type_id,
          });
        }

        // Food
        if (input.food_plant_desc !== '') {
          if (input.food_plant_is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${input.food_plant_desc}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${input.food_plant_desc}%`,
            });
          }
        }
        return sub;
      }, 'result_group')
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
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      );

    // Code
    if (input.receipt_code_desc && input.receipt_code_desc !== '') {
      if (input.receipt_code_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${input.receipt_code_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${input.receipt_code_desc}%`,
        });
      }
    } else {
      query.andWhere('receipt_tb.code  LIKE :code ', {
        code: `%%`,
      });
    }

    // Receipt Name
    if (input.receipt_name_desc && input.receipt_name_desc !== '') {
      if (input.receipt_name_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `${input.receipt_name_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `%${input.receipt_name_desc}%`,
        });
      }
    }

    // Family main
    if (input.family_main_desc && input.family_main_desc !== '') {
      if (input.family_main_is_match_all + '' == 'true') {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `${input.family_main_desc}`,
        });
      } else {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `%${input.family_main_desc}%`,
        });
      }
    }

    // Customer
    if (input.customer_id_desc && input.customer_id_desc !== '') {
      if (input.customer_id_is_match_all + '' == 'true') {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `${input.customer_id_desc}`,
        });
      } else {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `%${input.customer_id_desc}%`,
        });
      }
    }

    // Employee
    if (input.employee_id && input.employee_id !== '') {
      const parts = input.employee_id.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || null;

      if (input.employee_id_is_match_all + '' == 'true') {
        // ต้องตรงทั้งชื่อและนามสกุล
        query.andWhere('member_tb.name LIKE :firstName', {
          firstName: `${firstName}`,
        });
        query.andWhere('member_tb.surname LIKE :lastName', {
          lastName: `${lastName}`,
        });
      } else {
        // ตรงชื่อหรือนามสกุล อย่างใดอย่างหนึ่งก็ได้
        query.andWhere(
          '((member_tb.name LIKE :firstName OR member_tb.surname LIKE :lastName) OR (member_tb.surname LIKE :firstName OR member_tb.name LIKE :lastName))',
          {
            firstName: `%${firstName}%`,
            lastName: `%${lastName}%`,
          },
        );
      }
    }

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('result_group.import_date', 'import_date')
      .addSelect('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.id', 'work_type_id')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('food_plant_tb.description', 'food')
      .addSelect('result_group.total_import', 'total_import');

    query
      .orderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC')
      .addOrderBy('result_group.import_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    const data = await query.getRawMany();

    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const result = {
      start_index: startIndex,
      end_index: endIndex,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as any;
    return result;
  }

  async getReportPlantFail(input: ReportGetFailInput): Promise<any> {
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .addSelect('import.member_made', 'member_made')
          .addSelect('COUNT(*)', 'total_import')

          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 1 then 1 else 0 end)',
            'remove_type_1',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 2 then 1 else 0 end)',
            'remove_type_2',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 3 then 1 else 0 end)',
            'remove_type_3',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 4 then 1 else 0 end)',
            'remove_type_4',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 5 then 1 else 0 end)',
            'export',
          )
          .from(LogPlantImport, 'import')
          .groupBy('import.member_made')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          )
          .leftJoin(
            PlantFamilyMain,
            'plant_family_main_tb',
            'plant_family_main_tb.id = receipt_tb.family_main_id',
          )
          .leftJoin(
            Customer,
            'customer_tb',
            'customer_tb.customer_id = receipt_tb.customer_id',
          );
        // Code
        if (input.receipt_code_desc && input.receipt_code_desc !== '') {
          if (input.receipt_code_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${input.receipt_code_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${input.receipt_code_desc}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Import Date
        if (
          input.import_start_date &&
          input.import_end_date &&
          input.import_start_date !== '' &&
          input.import_end_date !== ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: input.import_start_date,
              importEnd: input.import_end_date,
            },
          );
        } else {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: moment().format('YYYY-MM-DD'),
              importEnd: moment().format('YYYY-MM-DD'),
            },
          );
        }

        // Receipt Name
        if (input.receipt_code_desc && input.receipt_code_desc !== '') {
          if (input.receipt_code_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.name  LIKE :receipt_code ', {
              receipt_code: `${input.receipt_code_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.name  LIKE :receipt_code ', {
              receipt_code: `%${input.receipt_code_desc}%`,
            });
          }
        }

        // Family main
        if (input.family_main_desc && input.family_main_desc !== '') {
          if (input.family_main_is_match_all + '' == 'true') {
            sub.andWhere(
              'plant_family_main_tb.description  LIKE :familyMain ',
              {
                familyMain: `${input.family_main_desc}`,
              },
            );
          } else {
            sub.andWhere(
              'plant_family_main_tb.description  LIKE :familyMain ',
              {
                familyMain: `%${input.family_main_desc}%`,
              },
            );
          }
        }

        // Main Work Type Multiple **
        if (input.work_main_types) {
          const itemMainTask = JSON.parse(input.work_main_types);
          const strId = [];
          for (let b = 0; b < itemMainTask.length; b++) {
            const id = itemMainTask[b].id;
            strId.push(id);
          }
          console.log(strId);
          if (strId.length > 0) {
            sub.andWhere('sources_work_main_type_tb.id IN (:mainTask)', {
              mainTask: strId,
            });
          }
        }

        // Work Type
        if (input.work_type_id && input.work_type_id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: input.work_type_id,
          });
        }

        // Food
        if (input.food_plant_desc && input.food_plant_desc !== '') {
          if (input.food_plant_is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${input.food_plant_desc}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${input.food_plant_desc}%`,
            });
          }
        }

        // Customer
        if (input.customer_id_desc && input.customer_id_desc !== '') {
          if (input.customer_id_is_match_all + '' == 'true') {
            sub.andWhere('customer_tb.name  LIKE :customer ', {
              customer: `${input.customer_id_desc}`,
            });
          } else {
            sub.andWhere('customer_tb.name  LIKE :customer ', {
              customer: `%${input.customer_id_desc}%`,
            });
          }
        }
        return sub;
      }, 'result_group')
      .leftJoin(
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      );

    // Employee
    if (input.employee_id && input.employee_id !== '') {
      const parts = input.employee_id.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || null;

      if (input.employee_id_is_match_all + '' == 'true') {
        // ต้องตรงทั้งชื่อและนามสกุล
        query.andWhere('member_tb.name LIKE :firstName', {
          firstName: `${firstName}`,
        });
        query.andWhere('member_tb.surname LIKE :lastName', {
          lastName: `${lastName}`,
        });
      } else {
        // ตรงชื่อหรือนามสกุล อย่างใดอย่างหนึ่งก็ได้
        query.andWhere(
          '((member_tb.name LIKE :firstName OR member_tb.surname LIKE :lastName) OR (member_tb.surname LIKE :firstName OR member_tb.name LIKE :lastName))',
          {
            firstName: `%${firstName}%`,
            lastName: `%${lastName}%`,
          },
        );
      }
    }
    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .orderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    query
      .select('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect('result_group.remove_type_1', 'remove_type_1')
      .addSelect('result_group.remove_type_2', 'remove_type_2')
      .addSelect(
        '(((result_group.remove_type_1 + result_group.remove_type_2) / result_group.total_import ) * 100)',
        'persentage',
      );

    const data = await query.getRawMany();
    const summary: ReportPlantFailData[] = [];
    // let sum_total_import = 0;
    // let sum_total_remove_type_1 = 0;
    // let sum_total_remove_type_2 = 0;
    // let sum_total_persentage = 0;
    // for (let i = 0; i < data.length; i++) {
    //   summary.push(data[i]);
    //   sum_total_remove_type_1 += parseInt(data[i].remove_type_1);
    //   sum_total_remove_type_2 += parseInt(data[i].remove_type_1);
    //   sum_total_import += parseInt(data[i].total_import);
    // }
    // if (sum_total_import > 0) {
    //   sum_total_persentage = (sum_total_remove_type_1 / sum_total_import) * 100;
    // }
    // const summaryTotal = {
    //   member_name: 'รวมทั้งหมด',
    //   member_surname: '',
    //   total_import: sum_total_import,
    //   remove_type_1: sum_total_remove_type_1,
    //   remove_type_2: sum_total_remove_type_2,
    //   persentage: sum_total_persentage,
    // } as ReportPlantFailData;
    // summary.unshift(summaryTotal);
    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const result = {
      start_index: startIndex,
      end_index: endIndex,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    };
    return result;
  }

  async getReportPlantFailAll(input: ReportGetFailInput): Promise<any> {
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .addSelect('import.member_made', 'member_made')
          .addSelect('COUNT(*)', 'total_import')

          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 1 then 1 else 0 end)',
            'remove_type_1',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 2 then 1 else 0 end)',
            'remove_type_2',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 3 then 1 else 0 end)',
            'remove_type_3',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 4 then 1 else 0 end)',
            'remove_type_4',
          )
          .addSelect(
            'SUM(case when remove.plant_remove_type_id = 5 then 1 else 0 end)',
            'export',
          )
          .from(LogPlantImport, 'import')
          .groupBy('import.member_made')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          )
          .leftJoin(
            PlantFamilyMain,
            'plant_family_main_tb',
            'plant_family_main_tb.id = receipt_tb.family_main_id',
          )
          .leftJoin(
            Customer,
            'customer_tb',
            'customer_tb.customer_id = receipt_tb.customer_id',
          );
        // Code
        if (input.receipt_code_desc && input.receipt_code_desc !== '') {
          if (input.receipt_code_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${input.receipt_code_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${input.receipt_code_desc}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Import Date
        if (
          input.import_start_date &&
          input.import_end_date &&
          input.import_start_date !== '' &&
          input.import_end_date !== ''
        ) {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: input.import_start_date,
              importEnd: input.import_end_date,
            },
          );
        } else {
          sub.andWhere(
            '( import.import_date >= :importStart AND import.import_date <= :importEnd ) ',
            {
              importStart: moment().format('YYYY-MM-DD'),
              importEnd: moment().format('YYYY-MM-DD'),
            },
          );
        }

        // Receipt Name
        if (input.receipt_name_desc && input.receipt_name_desc !== '') {
          if (input.receipt_name_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.name  LIKE :food ', {
              food: `${input.receipt_name_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.name  LIKE :food ', {
              food: `%${input.receipt_name_desc}%`,
            });
          }
        }

        // Family main
        if (input.family_main_desc && input.family_main_desc !== '') {
          if (input.family_main_is_match_all + '' == 'true') {
            sub.andWhere(
              'plant_family_main_tb.description  LIKE :familyMain ',
              {
                familyMain: `${input.family_main_desc}`,
              },
            );
          } else {
            sub.andWhere(
              'plant_family_main_tb.description  LIKE :familyMain ',
              {
                familyMain: `%${input.family_main_desc}%`,
              },
            );
          }
        }

        // Main Work Type Multiple **
        if (input.work_main_types) {
          const itemMainTask = JSON.parse(input.work_main_types);
          const strId = [];
          for (let b = 0; b < itemMainTask.length; b++) {
            const id = itemMainTask[b].id;
            strId.push(id);
          }
          console.log(strId);
          if (strId.length > 0) {
            sub.andWhere('sources_work_main_type_tb.id IN (:mainTask)', {
              mainTask: strId,
            });
          }
        }

        // Work Type
        if (input.work_type_id && input.work_type_id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: input.work_type_id,
          });
        }

        // Food
        if (input.food_plant_desc && input.food_plant_desc !== '') {
          if (input.food_plant_is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${input.food_plant_desc}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${input.food_plant_desc}%`,
            });
          }
        }

        // Customer
        if (input.customer_id_desc && input.customer_id_desc !== '') {
          if (input.customer_id_is_match_all + '' == 'true') {
            sub.andWhere('customer_tb.name  LIKE :customer ', {
              customer: `${input.customer_id_desc}`,
            });
          } else {
            sub.andWhere('customer_tb.name  LIKE :customer ', {
              customer: `%${input.customer_id_desc}%`,
            });
          }
        }
        return sub;
      }, 'result_group')
      .leftJoin(
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      );

    // Employee
    if (input.employee_id && input.employee_id !== '') {
      const parts = input.employee_id.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || null;

      if (input.employee_id_is_match_all + '' == 'true') {
        // ต้องตรงทั้งชื่อและนามสกุล
        query.andWhere('member_tb.name LIKE :firstName', {
          firstName: `${firstName}`,
        });
        query.andWhere('member_tb.surname LIKE :lastName', {
          lastName: `${lastName}`,
        });
      } else {
        // ตรงชื่อหรือนามสกุล อย่างใดอย่างหนึ่งก็ได้
        query.andWhere(
          '((member_tb.name LIKE :firstName OR member_tb.surname LIKE :lastName) OR (member_tb.surname LIKE :firstName OR member_tb.name LIKE :lastName))',
          {
            firstName: `%${firstName}%`,
            lastName: `%${lastName}%`,
          },
        );
      }
    }

    query
      .select('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect('result_group.remove_type_1', 'remove_type_1')
      .addSelect('result_group.remove_type_2', 'remove_type_2')
      .addSelect(
        '(((result_group.remove_type_1 + result_group.remove_type_2) / result_group.total_import ) * 100)',
        'persentage',
      );

    const data = await query.getRawMany();
    const summary: ReportPlantFailData[] = [];
    let sum_total_import = 0;
    let sum_total_remove_type_1 = 0;
    let sum_total_remove_type_2 = 0;
    let sum_total_persentage = 0;
    for (let i = 0; i < data.length; i++) {
      sum_total_remove_type_1 += parseInt(data[i].remove_type_1);
      sum_total_remove_type_2 += parseInt(data[i].remove_type_2);
      sum_total_import += parseInt(data[i].total_import);
    }
    if (sum_total_import > 0) {
      sum_total_persentage = (sum_total_remove_type_1 / sum_total_import) * 100;
    }
    const summaryTotal = {
      member_name: 'รวมทั้งหมด',
      member_surname: '',
      total_import: sum_total_import,
      remove_type_1: sum_total_remove_type_1,
      remove_type_2: sum_total_remove_type_2,
      persentage: sum_total_persentage,
      total: data.length,
    } as ReportPlantFailData;

    const result = summaryTotal;
    return result;
  }

  async getReportRemoveAll(input: ReportGetRemoveAllInput): Promise<any> {
    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('import.import_date', 'import_date')
          .addSelect('remove.remove_date', 'remove_date')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('remove.create_by', 'create_by')
          .addSelect('remove.plant_remove_type_id', 'plant_remove_type_id')
          .addSelect('count(remove.plant_remove_type_id)', 'total')
          .from(LogPlantImport, 'import')
          .groupBy('import.import_date')
          .addGroupBy('import.member_made')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('remove.remove_date')
          .addGroupBy('remove.create_by')
          .addGroupBy('remove.plant_remove_type_id')
          .leftJoin(
            LogPlantRemove,
            'remove',
            'import.log_plant_import_id = remove.log_plant_import_id',
          )
          .leftJoin(
            Receipt,
            'receipt_tb',
            'receipt_tb.receipt_id = import.receipt_id',
          )
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
          )
          .leftJoin(
            FoodPlant,
            'food_plant',
            'food_plant.food_id = import.food_plant_id',
          );
        sub.where('remove.remove_date IS NOT NULL');
        // Code
        if (input.receipt_code_desc && input.receipt_code_desc !== '') {
          if (input.receipt_code_is_match_all + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${input.receipt_code_desc}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${input.receipt_code_desc}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

        // Remove Date
        if (
          input.import_start_date &&
          input.import_end_date &&
          input.import_start_date !== '' &&
          input.import_end_date !== ''
        ) {
          sub.andWhere(
            '( remove.remove_date >= :importStart AND remove.remove_date <= :importEnd ) ',
            {
              importStart: input.import_start_date,
              importEnd: input.import_end_date,
            },
          );
        }

        // // Main Work Type
        // if (filter.filter[7].main_task.description !== '') {
        //   sub.andWhere('sources_work_main_type_tb.description = :mainTask ', {
        //     mainTask: filter.filter[7].main_task.description,
        //   });
        // }
        // Work Type
        if (input.work_type_id && input.work_type_id !== '') {
          sub.andWhere('import.work_type_id = :workType ', {
            workType: input.work_type_id,
          });
        }

        // Food
        if (input.food_plant_desc && input.food_plant_desc !== '') {
          if (input.food_plant_is_match_all + '' == 'true') {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `${input.food_plant_desc}`,
            });
          } else {
            sub.andWhere('food_plant.description  LIKE :food ', {
              food: `%${input.food_plant_desc}%`,
            });
          }
        }
        return sub;
      }, 'result_group')
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
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      )
      .leftJoin(
        Member,
        'create_member_tb',
        'create_member_tb.member_id = result_group.create_by',
      )
      .leftJoin(
        SourcesPlantRemoveType,
        'sources_plant_remove_type_tb',
        'sources_plant_remove_type_tb.id = result_group.plant_remove_type_id',
      );

    // Code
    if (input.receipt_code_desc && input.receipt_code_desc !== '') {
      if (input.receipt_code_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${input.receipt_code_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${input.receipt_code_desc}%`,
        });
      }
    } else {
      query.andWhere('receipt_tb.code  LIKE :code ', {
        code: `%%`,
      });
    }

    // Receipt Name
    if (input.receipt_name_desc && input.receipt_name_desc !== '') {
      if (input.receipt_name_is_match_all + '' == 'true') {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `${input.receipt_name_desc}`,
        });
      } else {
        query.andWhere('receipt_tb.name  LIKE :food ', {
          food: `%${input.receipt_name_desc}%`,
        });
      }
    }

    // Family main
    if (input.family_main_desc && input.family_main_desc !== '') {
      if (input.family_main_is_match_all + '' == 'true') {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `${input.family_main_desc}`,
        });
      } else {
        query.andWhere('plant_family_main_tb.description  LIKE :familyMain ', {
          familyMain: `%${input.family_main_desc}%`,
        });
      }
    }

    // Customer
    if (input.customer_id_desc && input.customer_id_desc !== '') {
      if (input.customer_id_is_match_all + '' == 'true') {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `${input.customer_id_desc}`,
        });
      } else {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `%${input.customer_id_desc}%`,
        });
      }
    }

    // Employee
    if (input.employee_id && input.employee_id !== '') {
      const parts = input.employee_id.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || null;

      if (input.employee_id_is_match_all + '' == 'true') {
        // ต้องตรงทั้งชื่อและนามสกุล
        query.andWhere('member_tb.name LIKE :firstName', {
          firstName: `${firstName}`,
        });
        query.andWhere('member_tb.surname LIKE :lastName', {
          lastName: `${lastName}`,
        });
      } else {
        // ตรงชื่อหรือนามสกุล อย่างใดอย่างหนึ่งก็ได้
        query.andWhere(
          '((member_tb.name LIKE :firstName OR member_tb.surname LIKE :lastName) OR (member_tb.surname LIKE :firstName OR member_tb.name LIKE :lastName))',
          {
            firstName: `%${firstName}%`,
            lastName: `%${lastName}%`,
          },
        );
      }
    }

    // Remove Type
    if (input.reason_remove_type_desc && input.reason_remove_type_desc != '') {
      query.andWhere('sources_plant_remove_type_tb.description LIKE :reason ', {
        reason: `%${input.reason_remove_type_desc}%`,
      });
    }

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('result_group.import_date', 'import_date')
      .addSelect('result_group.remove_date', 'remove_date')
      .addSelect('create_member_tb.name', 'create_member_name')
      .addSelect('create_member_tb.surname', 'create_member_surname')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('sources_plant_remove_type_tb.description', 'description')
      .addSelect('result_group.total', 'total');

    query
      .orderBy('result_group.remove_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }
    const data = await query.getRawMany();
    console.log(await query.getQueryAndParameters());
    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const result = {
      start_index: startIndex,
      end_index: endIndex,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as any;
    return result;
  }

  getStartIndexPage = (page: number, limit_per_page: number) => {
    return (page - 1) * limit_per_page;
  };

  getFilter = (jsonStr: string) => {
    const jsonObj = JSON.parse(jsonStr);
    const reportFilter = {
      filter: [
        {
          plant_name: {
            id: jsonObj[0].value.data.id,
            description: jsonObj[0].value.data.description,
            is_match_all: jsonObj[0].value.is_match_all,
          },
        },
        {
          plant_code: {
            id: jsonObj[1].value.data.id,
            description: jsonObj[1].value.data.description,
            is_match_all: jsonObj[1].value.is_match_all,
          },
        },
        {
          family_main: {
            id: jsonObj[2].value.data.id,
            description: jsonObj[2].value.data.description,
            is_match_all: jsonObj[2].value.is_match_all,
          },
        },
        {
          work_type: {
            id: jsonObj[3].value.data.id,
            description: jsonObj[3].value.data.description,
            is_match_all: jsonObj[3].value.is_match_all,
          },
        },
        {
          food: {
            id: jsonObj[4].value.data.id,
            description: jsonObj[4].value.data.description,
            is_match_all: jsonObj[4].value.is_match_all,
          },
        },
        {
          customer: {
            id: jsonObj[5].value.data.id,
            description: jsonObj[5].value.data.description,
            is_match_all: jsonObj[5].value.is_match_all,
          },
        },
        {
          employee: {
            id: jsonObj[6].value.data.id,
            description: jsonObj[6].value.data.description,
            is_match_all: jsonObj[6].value.is_match_all,
          },
        },
        {
          main_task: {
            id: jsonObj[7].value.data.id,
            description: jsonObj[7].value.data.description,
            is_match_all: jsonObj[7].value.is_match_all,
          },
        },
        {
          import_start_date: {
            id: jsonObj[8].value.data.id,
            description: jsonObj[8].value.data.description,
            is_match_all: jsonObj[8].value.is_match_all,
          },
        },
        {
          import_end_date: {
            id: jsonObj[9].value.data.id,
            description: jsonObj[9].value.data.description,
            is_match_all: jsonObj[9].value.is_match_all,
          },
        },
        {
          reason_remove_type: {
            id: jsonObj.length > 10 ? jsonObj[10].value.data.id : '',
            description:
              jsonObj.length > 10 ? jsonObj[10].value.data.description : '',
            is_match_all:
              jsonObj.length > 10 ? jsonObj[10].value.is_match_all : false,
          },
        },
      ],
    };
    return reportFilter as FilterObject;
  };

  getFilterMultiple = (jsonStr: string) => {
    const jsonObj = JSON.parse(jsonStr);
    console.log('getFilterMultiple:');
    console.log(jsonObj);
    const reportFilter = {
      filter: [
        {
          plant_name: {
            id: jsonObj[0].value.data.id,
            description: jsonObj[0].value.data.description,
            is_match_all: jsonObj[0].value.is_match_all,
          },
        },
        {
          plant_code: {
            id: jsonObj[1].value.data.id,
            description: jsonObj[1].value.data.description,
            is_match_all: jsonObj[1].value.is_match_all,
          },
        },
        {
          family_main: {
            id: jsonObj[2].value.data.id,
            description: jsonObj[2].value.data.description,
            is_match_all: jsonObj[2].value.is_match_all,
          },
        },
        {
          work_type: {
            id: jsonObj[3].value.data.id,
            description: jsonObj[3].value.data.description,
            is_match_all: jsonObj[3].value.is_match_all,
          },
        },
        {
          food: {
            id: jsonObj[4].value.data.id,
            description: jsonObj[4].value.data.description,
            is_match_all: jsonObj[4].value.is_match_all,
          },
        },
        {
          customer: {
            id: jsonObj[5].value.data.id,
            description: jsonObj[5].value.data.description,
            is_match_all: jsonObj[5].value.is_match_all,
          },
        },
        {
          employee: {
            id: jsonObj[6].value.data.id,
            description: jsonObj[6].value.data.description,
            is_match_all: jsonObj[6].value.is_match_all,
          },
        },
        {
          main_task: {
            id: jsonObj[7].value.data.id,
            description: jsonObj[7].value.data.description,
            is_match_all: jsonObj[7].value.is_match_all,
          },
        },
        {
          import_start_date: {
            id: jsonObj[8].value.data.id,
            description: jsonObj[8].value.data.description,
            is_match_all: jsonObj[8].value.is_match_all,
          },
        },
        {
          import_end_date: {
            id: jsonObj[9].value.data.id,
            description: jsonObj[9].value.data.description,
            is_match_all: jsonObj[9].value.is_match_all,
          },
        },
        {
          main_task_multiple: {
            id: jsonObj.length > 10 ? jsonObj[10].value.data.id : '',
            description: jsonObj.length > 10 ? jsonObj[10].value.data : [],
            is_match_all: false,
          },
        },
      ],
    };
    return reportFilter as FilterMultipleObject;
  };

  async getReportBarcode(input: ReportGetByBarcodeInput): Promise<any> {
    const query = await this.logPlantImportRepository
      .createQueryBuilder('log_plant_import')
      .select('log_plant_import.barcode', 'barcode')
      .addSelect('log_plant_import.import_date', 'import_date')
      .addSelect('receipt.code', 'code')
      .addSelect('receipt.name', 'name')
      .addSelect('plant_family_main.description', 'plant_family_main')
      .addSelect('customer.name', 'customer')
      .addSelect('sources_work_main_type.description', 'work_main_type')
      .addSelect('sources_work_type.description', 'work_type')
      .addSelect('food_plant.description', 'food_plant')
      .addSelect('sources_plant_remove_type.description', 'remove_type')
      .addSelect('sources_plant_remove_type.id', 'plant_remove_type_id')
      .addSelect('log_plant_remove.remove_date', 'remove_date')
      .addSelect('log_plant_remove.remark', 'remark')
      .addSelect('log_plant_remove.time_per_day', 'time_per_day')
      .addSelect('log_plant_import.member_made', 'member_made')
      .addSelect('member.member_id', 'member_id')
      .addSelect('member.name', 'member_name')
      .addSelect('member.surname', 'member_surname')
      .leftJoin(
        LogPlantRemove,
        'log_plant_remove',
        'log_plant_remove.log_plant_import_id = log_plant_import.log_plant_import_id',
      )
      .leftJoin(
        Receipt,
        'receipt',
        'receipt.receipt_id = log_plant_import.receipt_id',
      )
      .leftJoin(
        PlantFamilyMain,
        'plant_family_main',
        'plant_family_main.id = receipt.family_main_id',
      )
      .leftJoin(
        Customer,
        'customer',
        'customer.customer_id = receipt.customer_id',
      )
      .leftJoin(
        FoodPlant,
        'food_plant',
        'food_plant.food_id = log_plant_import.food_plant_id',
      )
      .leftJoin(
        Member,
        'member',
        'member.member_id = log_plant_import.member_made',
      )
      .leftJoin(
        SourcesWorkMainType,
        'sources_work_main_type',
        'sources_work_main_type.id = log_plant_import.main_work_type_id',
      )
      .leftJoin(
        SourcesWorkType,
        'sources_work_type',
        'sources_work_type.id = log_plant_import.work_type_id',
      )
      .leftJoin(
        SourcesPlantRemoveType,
        'sources_plant_remove_type',
        'sources_plant_remove_type.id = log_plant_remove.plant_remove_type_id',
      )
      .where('log_plant_import.barcode = :barcode', { barcode: input.barcode });
    const data = await query.getRawMany();
    const result = data;
    return {
      code: 200,
      data: result,
    };
  }

  async getReportLogImportHistoryGrouping(
    input: ReportGetLogPlantImportGroupingInput,
  ): Promise<any> {
    const filterImportStart = input.import_start;
    const filterImportEnd = input.import_end;
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
    const filterEmployeeIdIsMatchAll = input.employee_id_is_match_all;

    if (filterImportStart == '' || filterImportEnd == '') {
      return {
        code: 200,
        page: input.page,
        per_page: input.per_page,
        total_all: 0,
        data: [],
      };
    }

    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('import.import_date', 'import_date')
          .addSelect('import.time_per_day', 'time_per_day')
          .addSelect('import.member_made', 'member_made')
          .addSelect('import.receipt_id', 'receipt_id')
          .addSelect('import.main_work_type_id', 'main_work_type_id')
          .addSelect('import.work_type_id', 'work_type_id')
          .addSelect('import.food_plant_id', 'food_plant_id')
          .addSelect('count(*)', 'total_import')
          .from(LogPlantImport, 'import')
          .groupBy('import.import_date')
          .addGroupBy('import.time_per_day')
          .addGroupBy('import.member_made')
          .addGroupBy('import.receipt_id')
          .addGroupBy('import.main_work_type_id')
          .addGroupBy('import.work_type_id')
          .addGroupBy('import.food_plant_id')
          .leftJoin(
            SourcesWorkMainType,
            'sources_work_main_type_tb',
            'sources_work_main_type_tb.id = import.main_work_type_id',
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

        // Main Work Type Multiple **
        if (input.main_work_type) {
          const itemMainTask = JSON.parse(input.main_work_type);
          const strId = [];
          for (let b = 0; b < itemMainTask.length; b++) {
            const id = itemMainTask[b].id;
            strId.push(id);
          }
          console.log(strId);
          if (strId.length > 0) {
            sub.andWhere('sources_work_main_type_tb.id IN (:mainTask)', {
              mainTask: strId,
            });
          }
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
    console.log('filterReceiptCode:' + filterReceiptCode);
    console.log('filterReceiptCodeIsMatchAll:' + filterReceiptCodeIsMatchAll);
    console.log('filterReceiptName:' + filterReceiptName);
    console.log('filterReceiptNameIsMatchAll:' + filterReceiptNameIsMatchAll);
    if (filterReceiptCode && filterReceiptCode != '') {
      if (filterReceiptCodeIsMatchAll + '' == 'true') {
        query.andWhere('receipt_tb.code  = :code ', {
          code: `${filterReceiptCode}`,
        });
        console.log('filterReceiptCode:CASE1');
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${filterReceiptCode}%`,
        });
        console.log('filterReceiptCode:CASE2');
      }
    } else {
      // Receipt Name
      if (filterReceiptName && filterReceiptName != '') {
        if (filterReceiptNameIsMatchAll + '' == 'true') {
          query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
            receipt_name: `${filterReceiptName}`,
          });
          console.log('filterReceiptCode:CASE3');
        } else {
          query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
            receipt_name: `%${filterReceiptName}%`,
          });
          console.log('filterReceiptCode:CASE4');
        }
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%%`,
        });
        console.log('filterReceiptCode:CASE5');
      }
    }

    // FOOD
    if (filterFoodPlantDesc && filterFoodPlantDesc != '') {
      if (filterFoodPlantDescIsMatchAll + '' == 'true') {
        query.andWhere('food_plant.description  LIKE :food ', {
          food: `${filterFoodPlantDesc}`,
        });
      } else {
        query.andWhere('food_plant.description  LIKE :food ', {
          food: `%${filterFoodPlantDesc}%`,
        });
      }
    }

    // Work Type
    if (filterWorkTypeId) {
      query.andWhere('sources_work_type_tb.description LIKE :workType ', {
        workType: `%${filterWorkTypeId}%`,
      });
    }

    // Family main
    if (filterFamilyMainDesc && filterFamilyMainDesc != '') {
      if (filterFamilyMainDescIsMatchAll + '' == 'true') {
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
      if (filterCustomerIdIsMatchAll + '' == 'true') {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `${filterCustomerId}`,
        });
      } else {
        query.andWhere('customer_tb.name  LIKE :customer ', {
          customer: `%${filterCustomerId}%`,
        });
      }
    }

    // Employee
    console.log('filterEmployeeIdIsMatchAll:' + filterEmployeeIdIsMatchAll);
    if (filterEmployeeId && filterEmployeeId !== '') {
      const parts = filterEmployeeId.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts[1] || null;
      console.log(parts);

      if (filterEmployeeIdIsMatchAll + '' == 'true') {
        // ต้องตรงทั้งชื่อและนามสกุล
        query.andWhere('member_tb.name = :firstName', {
          firstName: `${firstName}`,
        });
        query.andWhere('member_tb.surname = :lastName', {
          lastName: `${lastName}`,
        });
        console.log('CASE1:');
      } else {
        // ตรงชื่อหรือนามสกุล อย่างใดอย่างหนึ่งก็ได้
        query.andWhere(
          '((member_tb.name LIKE :firstName OR member_tb.surname LIKE :lastName) OR (member_tb.surname LIKE :firstName OR member_tb.name LIKE :lastName))',
          {
            firstName: `%${firstName}%`,
            lastName: `%${lastName}%`,
          },
        );
        console.log('CASE2:');
      }
    }

    // // Employee
    // if (filterEmployeeId && filterEmployeeId.trim() !== '') {
    //   const parts = filterEmployeeId.trim().split(' ');
    //   const firstName = parts[0];
    //   const lastName = parts[1] || '';

    //   if (filterEmployeeIdIsMatchAll + '' === 'true') {
    //     // ต้องตรงทั้งชื่อและนามสกุล
    //     query.andWhere('member_tb.name LIKE :firstName', {
    //       firstName: firstName,
    //     });
    //     query.andWhere('member_tb.surname LIKE :lastName', {
    //       lastName: lastName,
    //     });
    //   } else {
    //     // ชื่อหรือนามสกุล ตรงอย่างใดอย่างหนึ่งก็ได้
    //     query.andWhere(
    //       `(
    //         member_tb.name LIKE :firstName OR
    //         member_tb.surname LIKE :firstName OR
    //         member_tb.name LIKE :lastName OR
    //         member_tb.surname LIKE :lastName
    //       )`,
    //       {
    //         firstName: `%${firstName}%`,
    //         lastName: `%${lastName}%`,
    //       },
    //     );
    //   }
    // }

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('result_group.import_date', 'import_date')
      .addSelect('member_tb.member_id', 'member_id')
      .addSelect('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('result_group.time_per_day', 'time_per_day')
      .addSelect('receipt_tb.receipt_id', 'receipt_id')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('customer_tb.customer_id', 'customer_id')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect('sources_work_main_type_tb.id', 'main_work_type_id')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.id', 'work_type_id')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('food_plant.food_id', 'food_id')
      .addSelect('food_plant.description', 'food');

    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('result_group.time_per_day', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    console.log(await query.getQueryAndParameters());
    const data = await query.getRawMany();

    const result = {
      total: totalAll.total,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as ReportProductionResponse;
    return {
      code: 200,
      data: result,
    };
  }

  async getReportLogImportHistoryGroupingDetail(
    input: ReportGetLogPlantImportGroupingDetailInput,
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
          .addSelect('sources_plant_remove_type_tb.id', 'remove_type_id')
          .addSelect('sources_plant_remove_type_tb.description', 'remove_type')
          .addSelect('remove.remark', 'remove_remark')
          .addSelect('remove.remove_date', 'remove_date')
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

        // // Employee
        // if (filterEmployeeId && filterEmployeeId != '') {
        //   sub.andWhere('import.member_made = :employee ', {
        //     employee: filterEmployeeId,
        //   });
        // }

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
      if (filterReceiptCodeIsMatchAll + '' == 'true') {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `${filterReceiptCode}`,
        });
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%${filterReceiptCode}%`,
        });
      }
    } else {
      // query.andWhere('receipt_tb.code  LIKE :code ', {
      //   code: `%%`,
      // });

      // Receipt Name
      if (filterReceiptName && filterReceiptName != '') {
        if (filterReceiptNameIsMatchAll + '' == 'true') {
          query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
            receipt_name: `${filterReceiptName}`,
          });
        } else {
          query.andWhere('receipt_tb.name  LIKE :receipt_name ', {
            receipt_name: `%${filterReceiptName}%`,
          });
        }
      } else {
        query.andWhere('receipt_tb.code  LIKE :code ', {
          code: `%%`,
        });
      }
    }
    // FOOD PLANT
    if (filterFoodPlantDesc && filterFoodPlantDesc != '') {
      if (filterFoodPlantDescIsMatchAll + '' == 'true') {
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
      if (filterFamilyMainDescIsMatchAll + '' == 'true') {
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
      if (filterCustomerIdIsMatchAll + '' == 'true') {
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

    query
      .select('result_group.barcode', 'barcode')
      .addSelect('member_tb.member_id', 'member_id')
      .addSelect('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('result_group.import_date', 'import_date')
      .addSelect('result_group.time_per_day', 'time_per_day')
      .addSelect('receipt_tb.receipt_id', 'receipt_id')
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
      .addSelect('food_plant.food_id', 'food_id')
      .addSelect('food_plant.description', 'food')
      .addSelect('result_group.remove_date', 'remove_date')
      .addSelect('result_group.remove_type_id', 'remove_type_id')
      .addSelect('result_group.remove_type', 'remove_type')
      .addSelect('result_group.remove_remark', 'remove_remark');
    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('result_group.time_per_day', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC')
      .addOrderBy('result_group.barcode', 'ASC');

    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }
    const data = await query.getRawMany();

    const result = {
      total: totalAll.total,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as ReportProductionResponse;
    return {
      code: 200,
      data: result,
    };
  }

  async getReportLogRemoveHistoryTime(
    input: ReportGetLogPlantRemoveTimeInput,
  ): Promise<any> {
    // fix
    const filterRemoveStart = input.remove_start;
    const filterRemoveEnd = input.remove_end;

    const filterReceiptCode = input.receipt_code;
    const filterReceiptCodeIsMatchAll = input.receipt_code_is_match_all;

    const filterWorkTypeId = input.work_type_id;
    const filterEmployeeId = input.employee_id;
    const filterFoodPlantDesc = input.food_plant_desc;
    const filterFoodPlantDescIsMatchAll = input.food_plant_desc_is_match_all;
    const filterCustomerId = input.customer_id;
    const filterCustomerIdIsMatchAll = input.customer_id_is_match_all;

    // add
    const filterPlantRemoveTypeId = input.plant_remove_type_id;

    if (filterRemoveStart == '' || filterRemoveEnd == '') {
      return {
        code: 200,
        page: input.page,
        per_page: input.per_page,
        total_all: 0,
        data: [],
      };
    }

    const query = await this.connection
      .createQueryBuilder()
      .from((subQuery) => {
        const sub = subQuery
          .select('remove.remove_date', 'remove_date')
          .addSelect('remove.time_per_day', 'time_per_day')
          .addSelect('remove.plant_remove_type_id', 'plant_remove_type_id')
          .addSelect('remove.create_by', 'create_by')
          .addSelect('count(*)', 'total_remove')
          .from(LogPlantImport, 'import')
          .groupBy('remove.remove_date')
          .addGroupBy('remove.time_per_day')
          .addGroupBy('remove.create_by')
          .addGroupBy('remove.plant_remove_type_id')
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
            SourcesWorkType,
            'sources_work_type_tb',
            'sources_work_type_tb.id = import.work_type_id',
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

        // Code
        if (filterReceiptCode != '') {
          if (filterReceiptCodeIsMatchAll + '' == 'true') {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `${filterReceiptCode}`,
            });
          } else {
            sub.andWhere('receipt_tb.code  LIKE :code ', {
              code: `%${filterReceiptCode}%`,
            });
          }
        } else {
          sub.andWhere('receipt_tb.code  LIKE :code ', {
            code: `%%`,
          });
        }

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

        // Main Work Type Multiple **
        if (input.main_work_type) {
          const itemMainTask = JSON.parse(input.main_work_type);
          const strId = [];
          for (let b = 0; b < itemMainTask.length; b++) {
            const id = itemMainTask[b].id;
            strId.push(id);
          }
          console.log(strId);
          if (strId.length > 0) {
            sub.andWhere('sources_work_main_type_tb.id IN (:mainTask)', {
              mainTask: strId,
            });
          }
        }

        // Work Type
        if (filterWorkTypeId) {
          sub.andWhere('sources_work_type_tb.description LIKE :workType ', {
            workType: `%${filterWorkTypeId}%`,
          });
        }

        // Employee
        if (filterEmployeeId && filterEmployeeId !== '') {
          sub.andWhere('remove.create_by = :employee ', {
            employee: filterEmployeeId,
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

        // Customer
        if (filterCustomerId && filterCustomerId != '') {
          if (filterCustomerIdIsMatchAll + '' == 'true') {
            sub.andWhere('customer_tb.name  LIKE :customer ', {
              customer: `${filterCustomerId}`,
            });
          } else {
            sub.andWhere('customer_tb.name  LIKE :customer ', {
              customer: `%${filterCustomerId}%`,
            });
          }
        }

        // Food
        if (filterFoodPlantDesc && filterFoodPlantDesc != '') {
          if (filterFoodPlantDescIsMatchAll + '' == 'true') {
            sub.andWhere('food_plant_tb.description  LIKE :food ', {
              food: `${filterFoodPlantDesc}`,
            });
          } else {
            sub.andWhere('food_plant_tb.description  LIKE :food ', {
              food: `%${filterFoodPlantDesc}%`,
            });
          }
        }

        return sub;
      }, 'result_group')
      .leftJoin(
        Member,
        'member_tb',
        'member_tb.member_id = result_group.create_by',
      )
      .leftJoin(
        SourcesPlantRemoveType,
        'sources_plant_remove_type_tb',
        'sources_plant_remove_type_tb.id = result_group.plant_remove_type_id',
      );
    // Employee
    if (filterEmployeeId && filterEmployeeId != '') {
      query.andWhere('result_group.create_by = :create_by ', {
        create_by: filterEmployeeId,
      });
    }

    const queryTotal = query;
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

    query
      .select('result_group.remove_date', 'remove_date')
      .addSelect('result_group.total_remove', 'total_remove')
      .addSelect('result_group.create_by', 'create_by')
      .addSelect('result_group.plant_remove_type_id', 'plant_remove_type_id')
      .addSelect('sources_plant_remove_type_tb.description', 'remove_type')
      .addSelect('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('result_group.time_per_day', 'time_per_day');
    query
      .orderBy('result_group.remove_date', 'ASC')
      .addOrderBy('result_group.time_per_day', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }
    const str = await query.getQueryAndParameters();
    console.log(str);
    const data = await query.getRawMany();

    const result = {
      total: totalAll.total,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as ReportProductionResponse;
    return {
      code: 200,
      data: result,
    };
  }

  async getReportLogRemoveHistoryGrouping(
    input: ReportGetLogPlantRemoveGroupingInput,
  ): Promise<any> {
    const filterRemoveStart = input.remove_start;
    const filterRemoveEnd = input.remove_end;
    const filterEmployeeId = input.employee_id;
    const filterPlantRemoveTypeId = input.plant_remove_type_id;
    // add
    const filterTimePerDay = input.time_per_day;

    if (filterRemoveStart == '' || filterRemoveEnd == '') {
      return {
        code: 200,
        page: input.page,
        per_page: input.per_page,
        total_all: 0,
        data: {
          data: [],
        },
      };
    }

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
          .addSelect('count(*)', 'total_remove')
          .from(LogPlantImport, 'import')
          .groupBy('remove.remove_date')
          .addGroupBy('remove.time_per_day')
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

    query
      .select('result_group.remove_date', 'remove_date')
      .addSelect('member_tb.name', 'member_name')
      .addSelect('member_tb.surname', 'member_surname')
      .addSelect('member_tb.member_id', 'member_id')
      .addSelect('result_group.import_date', 'import_date')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('customer_tb.customer_id', 'customer_id')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_main_type_tb.id', 'main_work_type_id')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('sources_work_type_tb.id', 'work_type_id')
      .addSelect('food_plant_tb.description', 'food')
      .addSelect('food_plant_tb.food_id', 'food_id')
      .addSelect('result_group.total_remove', 'total_remove')
      .addSelect('result_group.time_per_day', 'time_per_day')
      .addSelect('sources_plant_remove_type_tb.id', 'remove_type_id')
      .addSelect('sources_plant_remove_type_tb.description', 'remove_type');
    query
      .orderBy('result_group.remove_date', 'ASC')
      .addOrderBy('result_group.time_per_day', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC');
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }
    const data = await query.getRawMany();

    const result = {
      total: totalAll.total,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as ReportProductionResponse;
    return {
      code: 200,
      data: result,
    };
  }

  async getReportLogRemoveHistoryGroupingDetail(
    input: ReportGetLogPlantRemoveGroupingDetailInput,
  ): Promise<any> {
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

    if (filterRemoveStart == '' || filterRemoveEnd == '') {
      return {
        code: 200,
        data: [],
      };
    }

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
      if (filterReceiptCodeIsMatchAll + '' == 'true') {
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
      if (filterReceiptNameIsMatchAll + '' == 'true') {
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
      if (filterFoodPlantDescIsMatchAll + '' == 'true') {
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
      if (filterFamilyMainDescIsMatchAll + '' == 'true') {
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
      if (filterCustomerIdIsMatchAll + '' == 'true') {
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
    const totalAll = await queryTotal.select('COUNT(*)', 'total').getRawOne();

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
    const data = await query.getRawMany();
    if (input.page && input.per_page) {
      const start = this.getStartIndexPage(input.page, input.per_page);
      query.offset(start);
      query.limit(input.per_page);
    }

    const result = {
      total: totalAll.total,
      page: input.page,
      per_page: input.per_page,
      total_all: totalAll.total,
      data: data,
    } as ReportProductionResponse;
    return {
      code: 200,
      data: result,
    };
  }
}
