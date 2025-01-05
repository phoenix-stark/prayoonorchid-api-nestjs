import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogTokenService } from 'src/log-token/log-token.service';
import { MomentService } from 'src/utils/MomentService';
import { Repository } from 'typeorm';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { SourcesWorkMainTypeGetByIdInput } from 'src/sources-work-main-type/dto/sources-work-main-type-get-by-id.input';
import { SourcesPlantRemoveTypeGetAllInput } from './dto/sources-plant-remove-type-get-all.input';
import { SourcesPlantRemoveType } from './entity/sources-plant-remove-type-entity.model';

@Injectable()
export class SourcesPlantRemoveTypeService {
  constructor(
    @InjectRepository(SourcesPlantRemoveType)
    private readonly sourcesPlantRemoveTypeRepository: Repository<SourcesPlantRemoveType>,
    private logTokenService: LogTokenService,
    private momentWrapper: MomentService,
  ) {}

  async getSourcesWorkTypeAll(
    input: SourcesPlantRemoveTypeGetAllInput,
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

    const sourcesPlantRemoveTypeEntities =
      await this.sourcesPlantRemoveTypeRepository.find({
        order: {
          description: 'ASC',
        },
      });

    return {
      code: 200,
      data: sourcesPlantRemoveTypeEntities,
    };
  }

  async getSourcesPlantRemoveTypeById(
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

    const sourcesPlantRemoveTypeEntities =
      await this.sourcesPlantRemoveTypeRepository.findOne({
        where: {
          id: input.id,
        },
      });

    return {
      code: 200,
      data: sourcesPlantRemoveTypeEntities,
    };
  }
}
