import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogTokenService } from 'src/log-token/log-token.service';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { Like, Repository } from 'typeorm';
import { PlantFamilyMainCreateInput } from './dto/plant-family-main-create.input';
import { PlantFamilyMainUpdateInput } from './dto/plant-family-main-update.input';
import { PlantFamilyMainDeleteInput } from './dto/plant-family-main-delete.input';
import { PlantFamilyMainGetAllInput } from './dto/plant-family-main-get-all.input';
import { PlantFamilyMainGetByIdInput } from './dto/plant-family-main-get-by-id.input';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { PlantFamilyMainSearchInput } from './dto/plant-family-main-search';
import { ReceiptService } from 'src/receipt/receipt.service';
import { ReceiptGetTotalByPlantFamilyMainIdInput } from 'src/receipt/dto/receipt-get-total-by-plant-family-main-id-input';

@Injectable()
export class PlantFamilyMainService {
  constructor(
    @InjectRepository(PlantFamilyMain)
    private readonly plantFamilyMainRepository: Repository<PlantFamilyMain>,
    private logTokenService: LogTokenService,
    private receiptService: ReceiptService,
    private momentWrapper: MomentService,
  ) {}

  async createPlantFamilyMain(input: PlantFamilyMainCreateInput): Promise<any> {
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

    const plantFamilyMainResult = await this.plantFamilyMainRepository.findOne({
      where: {
        description: input.description,
      },
    });

    if (plantFamilyMainResult) {
      throw new HttpException(
        {
          code: 400,
          message: `มี สายพันธุ์ ${input.description} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const plantFamilyMainEntity = new PlantFamilyMain();
    plantFamilyMainEntity.description = input.description;
    const plantFamilyMainNewEntity = await this.plantFamilyMainRepository.save(
      plantFamilyMainEntity,
    );

    return {
      code: 200,
      data: {
        data: {
          food_main_id: plantFamilyMainNewEntity.id,
        },
      },
    };
  }

  async updatePlantFamilyMain(input: PlantFamilyMainUpdateInput): Promise<any> {
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

    const plantFamilyMainResult = await this.plantFamilyMainRepository.findOne({
      where: {
        id: input.id,
      },
    });

    if (!plantFamilyMainResult) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่มี สายพันธุ์ ในระบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    plantFamilyMainResult.description = input.description;
    await this.plantFamilyMainRepository.save(plantFamilyMainResult);

    return {
      code: 200,
      data: {
        data: {
          food_main_id: input.id,
        },
      },
    };
  }

  async deletePlantFamilyMain(input: PlantFamilyMainDeleteInput): Promise<any> {
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
    const totalReceipt =
      await this.receiptService.getReceiptTotalByPlantFamilyMain({
        family_main_id: input.id,
      } as ReceiptGetTotalByPlantFamilyMainIdInput);
    if (totalReceipt > 0) {
      return {
        code: 200,
        data: {
          data: {
            total: totalReceipt,
          },
        },
      };
    } else {
      await this.plantFamilyMainRepository
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

  async getPlantFamilyMainAll(input: PlantFamilyMainGetAllInput): Promise<any> {
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

    const plantFamilyMainEntities = await this.plantFamilyMainRepository.find({
      order: {
        description: 'ASC',
      },
    });

    return {
      code: 200,
      data: plantFamilyMainEntities,
    };
  }

  async getPlantFamilyMainById(
    input: PlantFamilyMainGetByIdInput,
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

    const plantFamilyMainEntities =
      await this.plantFamilyMainRepository.findOne({
        where: {
          id: input.id,
        },
      });

    return {
      code: 200,
      data: plantFamilyMainEntities,
    };
  }

  async searchPlantFamilyMain(input: PlantFamilyMainSearchInput): Promise<any> {
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

    const plantFamilyMainEntities = await this.plantFamilyMainRepository.find({
      where: [{ description: Like(`%${input.word}%`) }],
      order: {
        description: 'ASC',
      },
    });

    return {
      code: 200,
      data: plantFamilyMainEntities,
    };
  }
}
