import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogTokenService } from 'src/log-token/log-token.service';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { Like, Repository } from 'typeorm';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { ReceiptService } from 'src/receipt/receipt.service';
import { ReceiptGetTotalByPlantFamilyMainIdInput } from 'src/receipt/dto/receipt-get-total-by-plant-family-main-id-input';
import { SourcesWorkMainType } from './entity/sources-work-main-type-entity.model';
import { SourcesWorkMainTypeCreateInput } from './dto/sources-work-main-type-create.input';
import { SourcesWorkMainTypeUpdateInput } from './dto/sources-work-main-type-update.input';
import { SourcesWorkMainTypeDeleteInput } from './dto/sources-work-main-type-delete.input';
import { SourcesWorkMainTypeGetAllInput } from './dto/sources-work-main-type-get-all.input';
import { SourcesWorkMainTypeSearchInput } from './dto/sources-work-main-type-search';
import { SourcesWorkMainTypeGetByIdInput } from './dto/sources-work-main-type-get-by-id.input';
import { LogPlantImportService } from 'src/log-plant-import/log-plant-import.service';
import { LogImportGetTotalByWorkMainTypeIdInput } from 'src/log-plant-import/dto/log-import-get-total-by-workmaintypeid.input';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';

@Injectable()
export class SourcesWorkMainTypeService {
  constructor(
    @InjectRepository(SourcesWorkMainType)
    private readonly sourcesWorkMainTypeRepository: Repository<SourcesWorkMainType>,
    private logTokenService: LogTokenService,
    private logPlantImportService: LogPlantImportService,
    private momentWrapper: MomentService,
  ) {}

  async createSourcesWorkMainType(
    input: SourcesWorkMainTypeCreateInput,
  ): Promise<any> {
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

    const sourcesWorkMainTypeMainResult =
      await this.sourcesWorkMainTypeRepository.findOne({
        where: {
          description: input.description,
        },
      });

    if (sourcesWorkMainTypeMainResult) {
      throw new HttpException(
        {
          code: 400,
          message: `มี ประเภทงานหลัก ${input.description} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sourcesWorkMainTypeMainEntity = new SourcesWorkMainType();
    sourcesWorkMainTypeMainEntity.description = input.description;
    const plantFamilyMainNewEntity =
      await this.sourcesWorkMainTypeRepository.save(
        sourcesWorkMainTypeMainEntity,
      );

    return {
      code: 200,
      data: {
        data: {
          work_main_type_id: plantFamilyMainNewEntity.id,
        },
      },
    };
  }

  async updateSourcesWorkMainType(
    input: SourcesWorkMainTypeUpdateInput,
  ): Promise<any> {
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

    const sourcesWorkMainTypeMainResult =
      await this.sourcesWorkMainTypeRepository.findOne({
        where: {
          id: input.id,
        },
      });

    if (!sourcesWorkMainTypeMainResult) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่มี ประเภทงานหลัก ในระบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    sourcesWorkMainTypeMainResult.description = input.description;
    await this.sourcesWorkMainTypeRepository.save(
      sourcesWorkMainTypeMainResult,
    );

    return {
      code: 200,
      data: {
        data: {
          work_main_type_id: input.id,
        },
      },
    };
  }

  async deleteSourcesWorkMainType(
    input: SourcesWorkMainTypeDeleteInput,
  ): Promise<any> {
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

    //
    const totalLogImport =
      await this.logPlantImportService.getLogPlantImportTotalByWorkMainType({
        main_work_type_id: input.id,
      } as LogImportGetTotalByWorkMainTypeIdInput);
    if (totalLogImport > 0) {
      return {
        code: 200,
        data: {
          data: {
            total: totalLogImport,
          },
        },
      };
    } else {
      await this.sourcesWorkMainTypeRepository
        .createQueryBuilder()
        .delete()
        .where({ id: input.id })
        .execute();
      return {
        code: 200,
        data: {},
      };
    }
  }

  async getSourcesWorkMainTypeAll(
    input: SourcesWorkMainTypeGetAllInput,
  ): Promise<any> {
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

    const query = this.sourcesWorkMainTypeRepository.createQueryBuilder(
      'source_work_main_type',
    );

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
      .select(['source_work_main_type'])
      .orderBy('description', 'ASC')
      .getRawMany();

    const result = await query.getRawMany();
    const sourcesWorkMainTypEntities = result.map((row: any) => ({
      id: row.source_work_main_type_id,
      description: row.source_work_main_type_description,
    }));

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: sourcesWorkMainTypEntities,
      },
    };
  }

  async getSourcesWorkMainTypeById(
    input: SourcesWorkMainTypeGetByIdInput,
  ): Promise<any> {
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

    const sourcesWorkMainTypEntities =
      await this.sourcesWorkMainTypeRepository.findOne({
        where: {
          id: input.id,
        },
      });

    return {
      code: 200,
      data: sourcesWorkMainTypEntities,
    };
  }

  async searchSourcesWorkMainType(
    input: SourcesWorkMainTypeSearchInput,
  ): Promise<any> {
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

    const query = this.sourcesWorkMainTypeRepository
      .createQueryBuilder('source_work_main_type')
      .where('description LIKE :keyword', { keyword: `%${input.word}%` });

    query
      .select(['source_work_main_type'])
      .orderBy('description', 'ASC')
      .getRawMany();

    const result = await query.getRawMany();
    const sourcesWorkMainTypEntities = result.map((row: any) => ({
      id: row.source_work_main_type_id,
      description: row.source_work_main_type_description,
    }));

    return {
      code: 200,
      data: sourcesWorkMainTypEntities,
    };
  }

  async searchSourcesWorkMainTypeByWord(
    input: SourcesWorkMainTypeSearchInput,
  ): Promise<any> {
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

    const query = this.sourcesWorkMainTypeRepository
      .createQueryBuilder('source_work_main_type')
      .where('description LIKE :keyword', { keyword: `%${input.word}%` });

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
      .select(['source_work_main_type'])
      .orderBy('description', 'ASC')
      .getRawMany();

    const result = await query.getRawMany();
    const sourcesWorkMainTypEntities = result.map((row: any) => ({
      id: row.source_work_main_type_id,
      description: row.source_work_main_type_description,
    }));

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: sourcesWorkMainTypEntities,
      },
    };
  }

  getStartIndexPage = (page: number, limit_per_page: number) => {
    return (page - 1) * limit_per_page;
  };
}
