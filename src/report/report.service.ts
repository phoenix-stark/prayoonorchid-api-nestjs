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
import { Connection, Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectConnection()
    private connection: Connection,
    @InjectRepository(LogPlantImport)
    private readonly logPlantImportRepository: Repository<LogPlantImport>,
  ) {}

  async getReportProduction(): Promise<any> {
    return await this.connection
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
        return subQuery
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
          .where('import.import_date >= :date', { date: '2022-09-01' });
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
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('member_tb.name', 'ASC')
      .addOrderBy('member_tb.surname', 'ASC')
      .getRawMany();
  }

  async getReportStock(): Promise<any> {
    return await this.connection
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
        return subQuery
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
          .where('import.import_date >= :date', { date: '2022-09-01' });
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
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC')
      .getRawMany();
  }

  async getReportBottle(): Promise<any> {
    return await this.connection
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
        return subQuery
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
          .where('import.import_date >= :date', { date: '2022-09-01' });
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
      )
      .orderBy('result_group.import_date', 'ASC')
      .addOrderBy('receipt_tb.code', 'ASC')
      .getRawMany();
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
}
