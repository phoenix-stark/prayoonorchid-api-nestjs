import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { FoodPlant } from 'src/food_plant/entity/food-plant-entity.model';
import { LogPlantImport } from 'src/log_plant_import/entity/log-plant-import-entity.model';
import { LogPlantRemove } from 'src/log_plant_remove/entity/log-plant-remove-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Receipt } from 'src/receipt/entity/receipt-entity.model';
import { SourcesPlantRemoveType } from 'src/sources_plant_remove_type/entity/sources-plant-remove-type-entity.model';
import { SourcesWorkMainType } from 'src/sources_work_main_type/entity/sources-work-main-type-entity.model';
import { SourcesWorkType } from 'src/sources_work_type/entity/sources-work-type-entity.model';
import { Connection, MoreThan, Repository } from 'typeorm';
import { ReportGetInput } from './dto/report-get.input';
import { FilterObject } from './modal/filter';

@Injectable()
export class ReportService {
  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}
  async getReportProduction(input: ReportGetInput): Promise<any> {
    const filter = this.getFilter(input.filter);
    const query = await this.connection
      .createQueryBuilder()
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
      )

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
        if (filter.filter[1].plant_code.description !== '') {
          if (filter.filter[1].plant_code.is_match_all === true) {
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
          if (filter.filter[4].food.is_match_all === true) {
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
      if (filter.filter[1].plant_code.is_match_all === true) {
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
      if (filter.filter[0].plant_name.is_match_all === true) {
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
      if (filter.filter[2].family_main.is_match_all === true) {
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
      if (filter.filter[5].customer.is_match_all === true) {
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

    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC');

    return query.getRawMany();
  }

  async getReportStock(input: ReportGetInput): Promise<any> {
    const filter = this.getFilter(input.filter);
    const query = await this.connection
      .createQueryBuilder()
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
      )

      .from((subQuery) => {
        const sub = subQuery
          .select('LEFT(import.import_date, 7)', 'import_date')
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
          .groupBy('LEFT(import.import_date, 7)')
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
        if (filter.filter[1].plant_code.description !== '') {
          if (filter.filter[1].plant_code.is_match_all === true) {
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
          if (filter.filter[4].food.is_match_all === true) {
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
      if (filter.filter[1].plant_code.is_match_all === true) {
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
      if (filter.filter[0].plant_name.is_match_all === true) {
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
      if (filter.filter[2].family_main.is_match_all === true) {
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
      if (filter.filter[5].customer.is_match_all === true) {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `${filter.filter[5].customer.id}`,
        });
      } else {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `%${filter.filter[5].customer.id}%`,
        });
      }
    }

    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC');
    return query.getRawMany();
  }

  async getReportBottle(input: ReportGetInput): Promise<any> {
    const filter = this.getFilter(input.filter);
    const query = await this.connection
      .createQueryBuilder()
      .select('result_group.import_date', 'import_date')
      .select('member_tb.name', 'member_name')
      .select('member_tb.surname', 'member_surname')
      .addSelect('receipt_tb.code', 'receipt_code')
      .addSelect('receipt_tb.num_order', 'receipt_num_order')
      .addSelect('receipt_tb.name', 'receipt_name')
      .addSelect('customer_tb.name', 'customer_name')
      .addSelect('plant_family_main_tb.description', 'plant_family_main')
      .addSelect('sources_work_main_type_tb.description', 'main_work_type')
      .addSelect('sources_work_type_tb.description', 'work_type')
      .addSelect('food_plant_tb.description', 'food')
      .addSelect('result_group.total_import', 'total_import')

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
        if (filter.filter[1].plant_code.description !== '') {
          if (filter.filter[1].plant_code.is_match_all === true) {
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
          if (filter.filter[4].food.is_match_all === true) {
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
      )
      .leftJoin(
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      );

    // Code
    if (filter.filter[1].plant_code.description !== '') {
      if (filter.filter[1].plant_code.is_match_all === true) {
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
      if (filter.filter[0].plant_name.is_match_all === true) {
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
      if (filter.filter[2].family_main.is_match_all === true) {
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
      if (filter.filter[5].customer.is_match_all === true) {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `${filter.filter[5].customer.id}`,
        });
      } else {
        query.andWhere('customer_tb.customer_id  LIKE :customer ', {
          customer: `%${filter.filter[5].customer.id}%`,
        });
      }
    }
    query
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC');
    return query.getRawMany();
  }

  async getReportPlantFail(): Promise<any> {
    return await this.connection
      .createQueryBuilder()
      .select('member_tb.name', 'member_name')
      .select('member_tb.surname', 'member_surname')
      .addSelect('result_group.total_import', 'total_import')
      .addSelect(
        '(((result_group.remove_type_1 + result_group.remove_type_2) / result_group.total_import ) * 100)',
        'persentage',
      )
      .from((subQuery) => {
        return subQuery
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
          .where('import.import_date >= :date', { date: '2022-09-01' });
      }, 'result_group')
      .leftJoin(
        Member,
        'member_tb',
        'member_tb.member_id = result_group.member_made',
      )
      .orderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC')
      .getRawMany();
  }

  async getReportRemoveall(): Promise<any> {
    return await this.connection
      .createQueryBuilder()
      .select('member_tb.name', 'member_name')
      .select('member_tb.surname', 'member_surname')
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
      .addSelect(
        'sources_plant_remove_type_tb.description',
        'sources_plant_remove_type',
      )
      .addSelect('result_group.total', 'total')

      .from((subQuery) => {
        return subQuery
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
          .where('remove.remove_date IS NOT NULL')
          .andWhere('remove.remove_date >= :date', { date: '2022-08-01' });
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
      )
      .orderBy('result_group.remove_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC')
      .getRawMany();
  }

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
      ],
    };
    return reportFilter as FilterObject;
  };
}
