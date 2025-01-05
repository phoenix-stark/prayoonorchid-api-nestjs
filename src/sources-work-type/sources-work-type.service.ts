import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogTokenService } from 'src/log-token/log-token.service';
import { MomentService } from 'src/utils/MomentService';
import { Like, Repository } from 'typeorm';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { LogPlantImportService } from 'src/log-plant-import/log-plant-import.service';
import { SourcesWorkType } from './entity/sources-work-type-entity.model';
import { LogImportGetTotalByWorkTypeIdInput } from 'src/log-plant-import/dto/log-import-get-total-by-worktypeid.input';
import { SourcesWorkTypeSearchInput } from './dto/sources-work-type-search';
import { SourcesWorkMainTypeGetByIdInput } from 'src/sources-work-main-type/dto/sources-work-main-type-get-by-id.input';
import { SourcesWorkMainType } from 'src/sources-work-main-type/entity/sources-work-main-type-entity.model';
import { SourcesWorkTypeCreateInput } from './dto/sources-work-type-create.input';
import { SourcesWorkTypeDeleteInput } from './dto/sources-work-type-delete.input';
import { SourcesWorkTypeGetAllInput } from './dto/sources-work-type-get-all.input';
import { SourcesWorkTypeUpdateInput } from './dto/sources-work-type-update.input';

@Injectable()
export class SourcesWorkTypeService {
  constructor(
    @InjectRepository(SourcesWorkType)
    private readonly sourcesWorkTypeRepository: Repository<SourcesWorkType>,
    private logTokenService: LogTokenService,
    private logPlantImportService: LogPlantImportService,
    private momentWrapper: MomentService,
  ) {}

  async createSourcesWorkType(input: SourcesWorkTypeCreateInput): Promise<any> {
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

    const sourcesWorkTypeMainResult =
      await this.sourcesWorkTypeRepository.findOne({
        where: {
          description: input.description,
        },
      });

    if (sourcesWorkTypeMainResult) {
      throw new HttpException(
        {
          code: 400,
          message: `มี ประเภทงาน ${input.description} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const sourcesWorkTypeEntity = new SourcesWorkMainType();
    sourcesWorkTypeEntity.description = input.description;
    const plantFamilyMainNewEntity = await this.sourcesWorkTypeRepository.save(
      sourcesWorkTypeEntity,
    );

    return {
      code: 200,
      data: {
        data: {
          work_type_id: plantFamilyMainNewEntity.id,
        },
      },
    };
  }

  async updateSourcesWorkType(input: SourcesWorkTypeUpdateInput): Promise<any> {
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

    const sourcesWorkTypeResult = await this.sourcesWorkTypeRepository.findOne({
      where: {
        id: input.id,
      },
    });

    if (!sourcesWorkTypeResult) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่มี ประเภทงาน ในระบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    sourcesWorkTypeResult.description = input.description;
    await this.sourcesWorkTypeRepository.save(sourcesWorkTypeResult);

    return {
      code: 200,
      data: {
        data: {
          work_type_id: input.id,
        },
      },
    };
  }

  async deleteSourcesWorkType(input: SourcesWorkTypeDeleteInput): Promise<any> {
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
      await this.logPlantImportService.getLogPlantImportTotalByWorkType({
        work_type_id: input.id,
      } as LogImportGetTotalByWorkTypeIdInput);
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
      await this.sourcesWorkTypeRepository
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

  async getSourcesWorkTypeAll(input: SourcesWorkTypeGetAllInput): Promise<any> {
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

    const sourcesWorkTypEntities = await this.sourcesWorkTypeRepository.find({
      order: {
        description: 'ASC',
      },
    });

    return {
      code: 200,
      data: sourcesWorkTypEntities,
    };
  }

  async getSourcesWorkTypeById(
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

    const sourcesWorkTypEntities = await this.sourcesWorkTypeRepository.findOne(
      {
        where: {
          id: input.id,
        },
      },
    );

    return {
      code: 200,
      data: sourcesWorkTypEntities,
    };
  }

  async searchSourcesWorkType(input: SourcesWorkTypeSearchInput): Promise<any> {
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

    const sourcesWorkTypEntities = await this.sourcesWorkTypeRepository.find({
      where: [{ description: Like(`%${input.word}%`) }],
      order: {
        description: 'ASC',
      },
    });

    return {
      code: 200,
      data: sourcesWorkTypEntities,
    };
  }
}
