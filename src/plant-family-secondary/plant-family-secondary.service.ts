import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogTokenService } from 'src/log-token/log-token.service';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { Repository } from 'typeorm';
import { PlantFamilySecondaryCreateInput } from './dto/plant-family-secondary-create.input';
import { PlantFamilySecondaryGetAllInput } from './dto/plant-family-secondary-get-all.input';
import { PlantFamilySecondaryGetByIdInput } from './dto/plant-family-secondary-get-by-id.input';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { PlantFamilySecondary } from './entity/plant-family-secondary-entity.model';
import { PlantFamilySecondaryGetByDescInput } from './dto/plant-family-secondary-get-by-desc.input';

@Injectable()
export class PlantFamilySecondaryService {
  constructor(
    @InjectRepository(PlantFamilySecondary)
    private readonly plantFamilySecondaryRepository: Repository<PlantFamilySecondary>,
    private logTokenService: LogTokenService,
    private momentWrapper: MomentService,
  ) {}

  async createPlantFamilySecondary(
    input: PlantFamilySecondaryCreateInput,
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

    const plantFamilySecondaryResult =
      await this.plantFamilySecondaryRepository.findOne({
        where: {
          description: input.description,
        },
      });

    if (plantFamilySecondaryResult) {
      throw new HttpException(
        {
          code: 400,
          message: `มี สายพันธุ์รอง ${input.description} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const plantFamilySecondaryEntity = new PlantFamilyMain();
    plantFamilySecondaryEntity.description = input.description;
    const plantFamilySecondaryNewEntity =
      await this.plantFamilySecondaryRepository.save(
        plantFamilySecondaryEntity,
      );

    return {
      code: 200,
      data: {
        data: {
          food_secondary_id: plantFamilySecondaryNewEntity.id,
        },
      },
    };
  }

  async getPlantFamilySecondaryAll(
    input: PlantFamilySecondaryGetAllInput,
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

    const plantFamilySecondaryEntities =
      await this.plantFamilySecondaryRepository.find({
        order: {
          description: 'ASC',
        },
      });

    return {
      code: 200,
      data: plantFamilySecondaryEntities,
    };
  }

  async getPlantFamilySecondaryById(
    input: PlantFamilySecondaryGetByIdInput,
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

    const plantFamilySecondaryEntities =
      await this.plantFamilySecondaryRepository.findOne({
        where: {
          id: input.id,
        },
      });

    return {
      code: 200,
      data: plantFamilySecondaryEntities,
    };
  }

  async getPlantFamilySecondaryByDesc(
    input: PlantFamilySecondaryGetByDescInput,
  ): Promise<any> {
    const plantFamilySecondaryEntities =
      await this.plantFamilySecondaryRepository.findOne({
        where: {
          description: input.description.trim(),
        },
      });

    return plantFamilySecondaryEntities;
  }
}
