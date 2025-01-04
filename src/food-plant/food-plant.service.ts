import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FoodPlant } from './entity/food-plant-entity.model';
import { LogTokenGetInput } from 'src/log_token/dto/log-token-get.input';
import { LogTokenService } from 'src/log_token/log-token.service';
import { MomentService } from 'src/utils/MomentService';
import { FoodPlantCreateInput } from './dto/food-plant-create.input';
import { FoodPlantUpdateInput } from './dto/food-plant-update.input';
import { FoodPlantDeleteInput } from './dto/food-plant-delete.input';
import { FoodPlantGetAllInput } from './dto/food-plant-get-all.input';
import { FoodPlantGetByIdInput } from './dto/food-plant-get-by-id.input';
import { FoodPlantSearchInput } from './dto/food-plant-search';
import { LogPlantImportService } from 'src/log_plant_import/log-plant-import.service';
import { LogImportGetTotalByFoodIdInput } from 'src/log_plant_import/dto/log-import-get-total-by-foodid.input';
@Injectable()
export class FoodPlantService {
  constructor(
    @InjectRepository(FoodPlant)
    private readonly foodPlantRepository: Repository<FoodPlant>,
    private logTokenService: LogTokenService,
    private logPlantImportService: LogPlantImportService,
    private momentWrapper: MomentService,
  ) {}

  async createFoodPlant(input: FoodPlantCreateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
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

    const foodResult = await this.foodPlantRepository.findOne({
      where: {
        description: input.description,
      },
    });

    if (foodResult) {
      throw new HttpException(
        {
          code: 400,
          message: `มี อาหาร ${input.description} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const foodPlantEntity = new FoodPlant();
    foodPlantEntity.description = input.description;
    foodPlantEntity.create_at = updateAt;
    foodPlantEntity.create_by = logTokenEntity.member_id;
    const foodNewEntity = await this.foodPlantRepository.save(foodPlantEntity);

    return {
      code: 200,
      data: {
        data: {
          food_id: foodNewEntity.food_id,
        },
      },
    };
  }

  async updateFoodPlant(input: FoodPlantUpdateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
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

    const foodResult = await this.foodPlantRepository.findOne({
      where: {
        food_id: input.id,
      },
    });

    if (!foodResult) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่มี อาหาร ในระบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    foodResult.description = input.description;
    await this.foodPlantRepository.save(foodResult);

    return {
      code: 200,
      data: {
        data: {
          food_id: input.id,
        },
      },
    };
  }

  async deleteFoodPlant(input: FoodPlantDeleteInput): Promise<any> {
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
      await this.logPlantImportService.getLogPlantImportTotalByFood({
        food_id: input.id.toString(),
      } as LogImportGetTotalByFoodIdInput);
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
      await this.foodPlantRepository
        .createQueryBuilder()
        .delete()
        .where({ food_id: input.id })
        .execute();
      return {
        code: 200,
        data: {},
      };
    }
  }

  async getFoodPlantAll(input: FoodPlantGetAllInput): Promise<any> {
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

    const foodEntities = await this.foodPlantRepository.find({
      order: {
        description: 'ASC',
      },
    });

    return {
      code: 200,
      data: foodEntities,
    };
  }

  async getFoodPlantById(input: FoodPlantGetByIdInput): Promise<any> {
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

    const foodEntities = await this.foodPlantRepository.findOne({
      where: {
        food_id: input.id,
      },
    });

    return {
      code: 200,
      data: foodEntities,
    };
  }

  async searchFoodPlant(input: FoodPlantSearchInput): Promise<any> {
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

    const foodEntities = await this.foodPlantRepository.find({
      where: [{ description: Like(`%${input.word}%`) }],
      order: {
        description: 'ASC',
      },
    });

    return {
      code: 200,
      data: foodEntities,
    };
  }
}
