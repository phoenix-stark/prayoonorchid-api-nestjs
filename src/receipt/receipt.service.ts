import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Repository } from 'typeorm';
import { ReceiptGetInput } from './dto/receipt-get-input';
import { Receipt } from './entity/receipt-entity.model';
import { ReceiptDeleteInput } from './dto/receipt-delete-input';
import { Member } from 'src/member/entity/member-entity.model';
import { ReceiptGetTotalByCustomerIdInput } from './dto/receipt-get-total-by-customer-id-input';
import { ReceiptGetTotalByPlantFamilyMainIdInput } from './dto/receipt-get-total-by-plant-family-main-id-input';
import { ReceiptGetByIdInput } from './dto/receipt-get-by-id.input';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';
import { ReceiptCreateInput } from './dto/receipt-create-input';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { PlantFamilyMainService } from 'src/plant-family-main/plant-family-main.service';
import { PlantFamilySecondaryService } from 'src/plant-family-secondary/plant-family-secondary.service';
import { PlantFamilyMainGetByDescInput } from 'src/plant-family-main/dto/plant-family-main-get-by-desc.input';
import { PlantFamilyMainCreateInput } from 'src/plant-family-main/dto/plant-family-main-create.input';
import { PlantFamilySecondaryGetByDescInput } from 'src/plant-family-secondary/dto/plant-family-secondary-get-by-desc.input';
import { PlantFamilySecondaryCreateInput } from 'src/plant-family-secondary/dto/plant-family-secondary-create.input';
import { MomentService } from 'src/utils/MomentService';
import * as crypto from 'crypto';
import { ReceiptUpdateInput } from './dto/receipt-update-input';
import { ReceiptCheckDeleteInput } from './dto/receipt-check-delete.input';
import { LogPlantImportService } from 'src/log-plant-import/log-plant-import.service';
import { LogPlantRemoveService } from 'src/log-plant-remove/log-plant-remove.service';
import { ReceiptGetByCodeInput } from './dto/receipt-get-by-code.input';
import { LogImportGetTotalByReceiptIdInput } from 'src/log-plant-import/dto/log-import-get-total-by-receiptid.input';
import { LogRemoveGetTotalByReceiptIdInput } from 'src/log-plant-remove/dto/log-remove-get-total-by-receiptid.input';
import { PlantFamilySecondary } from 'src/plant-family-secondary/entity/plant-family-secondary-entity.model';
import { LogRemoveGetTotalByReceiptIdAndTypeInput } from 'src/log-plant-remove/dto/log-remove-get-total-by-receiptid-type.input';
import { ReceiptSearchByNameInput } from './dto/receipt-search-by-name';
import { ReceiptSearchByCodeInput } from './dto/receipt-search-by-code';
import { ReceiptSearchDetailByCodeInput } from './dto/receipt-search-detail-by-code';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
@Injectable()
export class ReceiptService {
  constructor(
    @Inject(forwardRef(() => PlantFamilyMainService))
    private readonly plantFamilyMainService: PlantFamilyMainService,
    @Inject(forwardRef(() => PlantFamilySecondaryService))
    private readonly plantFamilySecondaryService: PlantFamilySecondaryService,
    @Inject(forwardRef(() => LogTokenService))
    private readonly logTokenService: LogTokenService,
    @Inject(forwardRef(() => LogPlantImportService))
    private readonly logPlantImportService: LogPlantImportService,
    @Inject(forwardRef(() => LogPlantRemoveService))
    private readonly logPlantRemoveService: LogPlantRemoveService,
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    private momentWrapper: MomentService,
  ) {}

  async getReceipts(input: ReceiptGetInput): Promise<any[]> {
    console.log('getReceipts:');
    const sql = await this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoin(
        PlantFamilyMain,
        'plant_family_main',
        'receipt.family_main_id = plant_family_main.id',
      )
      .leftJoin(
        Customer,
        'customer',
        'receipt.customer_id = customer.customer_id',
      )
      .select('receipt')
      .addSelect(['plant_family_main.description'])
      .addSelect(['customer.name'])
      .orderBy('receipt.code', 'ASC');

    const receipts = sql.getRawMany();
    const sqlStr = await sql.getSql();
    console.log('sqlStr:');
    console.log(sqlStr);

    return receipts;
  }

  async deleteReceipt(input: ReceiptDeleteInput): Promise<any> {
    // Check Member
    const logTokenEntity = await this.logTokenService.getLogToken({
      token: input.token,
      // eslint-disable-next-line prettier/prettier
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

    // ss
    await this.receiptRepository
      .createQueryBuilder()
      .where('receipt_id = :receipt_id', { receipt_id: input.receipt_id })
      .delete()
      .execute();
    return {
      data: {
        code: 200,
      },
    };
  }

  async getReceiptTotalByCustomer(
    input: ReceiptGetTotalByCustomerIdInput,
  ): Promise<any> {
    const results = await this.receiptRepository.find({
      where: {
        customer_id: input.customer_id,
      },
    });

    return results.length;
  }

  async getReceiptTotalByPlantFamilyMain(
    input: ReceiptGetTotalByPlantFamilyMainIdInput,
  ): Promise<any> {
    const results = await this.receiptRepository.find({
      where: {
        family_main_id: input.family_main_id,
      },
    });

    return results.length;
  }

  async getReceiptById(input: ReceiptGetByIdInput): Promise<any> {
    //   name: 'Barcode',
    //   selector: row => row.barcode,
    //   sortable: true,
    // },
    // {
    //     name: 'วันที่นำเข้า',
    //     selector: row => formatDate(row.import_date),
    //     sortable: true,
    // },
    // {
    //     name: 'พนักงาน',
    //     selector: row => row.member_made.name,
    //     sortable: true,
    // },
    // {
    //     name: 'สายพันธุ์',
    //     selector: row => row.main_work_type.description,
    //     sortable: true,
    // },
    // {
    //     name: 'อาหารวุ้น',
    //     selector: row => row.food_plant.description,
    //     sortable: true,
    // },
    const result = await this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = receipt.create_by',
      )
      .leftJoinAndSelect(
        PlantFamilyMain,
        'plant_family_main',
        'plant_family_main.id = receipt.family_main_id',
      )
      .leftJoinAndSelect(
        FoodPlant,
        'food_plant',
        'food_plant.id = receipt.family_main_id',
      )
      .where('receipt.receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      })
      .select([
        'receipt.receipt_id',
        'receipt.code',
        'receipt.name',
        'receipt.create_by',
        'receipt.create_at',
        'receipt.family_main_id',
        'receipt.family_secondary_id',
        'receipt.customer_id',
        'member',
        'plant_family_main',
        'plant_family_main',
      ])
      .getRawOne();
    /*
      {
    receipt_id: result.receipt_receipt_id,
        code: result.receipt_code,
        import_date: result.receipt_import_date,
        import_date: result.receipt_import_date,
      }
      setPlantFood({
        id: infos.food_plant.food_id,
        description:infos.food_plant.description
      })
      setMainWorkTypeId(infos.main_work_type.id)
      setWorkTypeId({
        id: infos.work_type.id,
        description: infos.work_type.description
      }) 
    */
    return result;
  }

  async getReceiptByCode(input: ReceiptGetByCodeInput): Promise<any> {
    const result = await this.receiptRepository.findOne({
      where: {
        code: input.code.trim(),
      },
    });
    return result;
  }

  async createReceipt(input: ReceiptCreateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    let memberId = '';
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

    memberId = logTokenEntity.member_id;

    const numOrder =
      input.num_order == '' || input.num_order == null ? -1 : input.num_order;

    const receiptResult = await this.receiptRepository.findOne({
      where: {
        code: input.code.trim(),
      },
    });

    if (receiptResult) {
      throw new HttpException(
        {
          code: 400,
          message: `มี รหัสใบงาน ${input.code} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let plantFamilyMainId = '';
    let plantFamilySecondaryId = '';

    const plantFamilyMainEntity =
      await this.plantFamilyMainService.getPlantFamilyMainByDesc({
        token: input.token,
        description: input.plant_family_main_desc,
      } as PlantFamilyMainGetByDescInput);
    console.log(plantFamilyMainEntity);
    if (plantFamilyMainEntity && plantFamilyMainEntity.id) {
      plantFamilyMainId = plantFamilyMainEntity.id;
    } else {
      const plantFamilyMainEntity =
        await this.plantFamilyMainService.createPlantFamilyMain({
          token: input.token,
          description: input.plant_family_main_desc,
        } as PlantFamilyMainCreateInput);
      plantFamilyMainId = plantFamilyMainEntity?.data?.data?.food_main_id;
    }

    const plantFamilySecondaryEntity =
      await this.plantFamilySecondaryService.getPlantFamilySecondaryByDesc({
        token: input.token,
        description: input.plant_family_secondary_desc,
      } as PlantFamilySecondaryGetByDescInput);
    console.log(plantFamilySecondaryEntity);
    if (plantFamilySecondaryEntity && plantFamilySecondaryEntity.id) {
      plantFamilySecondaryId = plantFamilySecondaryEntity.id;
    } else {
      const plantFamilySecondaryEntity =
        await this.plantFamilySecondaryService.createPlantFamilySecondary({
          token: input.token,
          description: input.plant_family_secondary_desc,
        } as PlantFamilySecondaryCreateInput);
      console.log(plantFamilySecondaryEntity);
      plantFamilySecondaryId =
        plantFamilySecondaryEntity?.data?.data?.food_secondary_id;
    }

    const receiptNewEntity = new Receipt();
    receiptNewEntity.receipt_id = this.generateToken();
    receiptNewEntity.code = input.code.trim();
    receiptNewEntity.date = input.date;
    receiptNewEntity.name = input.name.trim();
    receiptNewEntity.num_order = parseInt(numOrder.toString());
    receiptNewEntity.create_by = memberId;
    receiptNewEntity.create_at = updateAt;
    receiptNewEntity.family_main_id = parseInt(plantFamilyMainId);
    receiptNewEntity.family_secondary_id = parseInt(plantFamilySecondaryId);
    receiptNewEntity.customer_id = input.customer_id;
    console.log(receiptNewEntity);
    const resultReceipt = await this.receiptRepository.save(receiptNewEntity);
    console.log(resultReceipt);
    return {
      code: 200,
      data: {
        data: {
          receipt_id: resultReceipt.receipt_id,
        },
      },
    };
  }

  async updateReceipt(input: ReceiptUpdateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    let memberId = '';
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

    memberId = logTokenEntity.member_id;

    const numOrder =
      input.num_order == '' || input.num_order == null ? -1 : input.num_order;

    const receiptResult = await this.receiptRepository.findOne({
      where: {
        code: input.code.trim(),
      },
    });

    if (receiptResult && input.receipt_id != receiptResult.receipt_id) {
      throw new HttpException(
        {
          code: 400,
          message: `มี รหัสใบงาน ${input.code} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let plantFamilyMainId = '';
    let plantFamilySecondaryId = '';

    const plantFamilyMainEntity =
      await this.plantFamilyMainService.getPlantFamilyMainByDesc({
        token: input.token,
        description: input.plant_family_main_desc,
      } as PlantFamilyMainGetByDescInput);
    console.log(plantFamilyMainEntity);
    if (plantFamilyMainEntity && plantFamilyMainEntity.id) {
      plantFamilyMainId = plantFamilyMainEntity.id;
    } else {
      const plantFamilyMainEntity =
        await this.plantFamilyMainService.createPlantFamilyMain({
          token: input.token,
          description: input.plant_family_main_desc,
        } as PlantFamilyMainCreateInput);
      plantFamilyMainId = plantFamilyMainEntity?.data?.data?.food_main_id;
    }

    const plantFamilySecondaryEntity =
      await this.plantFamilySecondaryService.getPlantFamilySecondaryByDesc({
        token: input.token,
        description: input.plant_family_secondary_desc,
      } as PlantFamilySecondaryGetByDescInput);
    console.log(plantFamilySecondaryEntity);
    if (plantFamilySecondaryEntity && plantFamilySecondaryEntity.id) {
      plantFamilySecondaryId = plantFamilySecondaryEntity.id;
    } else {
      const plantFamilySecondaryEntity =
        await this.plantFamilySecondaryService.createPlantFamilySecondary({
          token: input.token,
          description: input.plant_family_secondary_desc,
        } as PlantFamilySecondaryCreateInput);
      console.log(plantFamilySecondaryEntity);
      plantFamilySecondaryId =
        plantFamilySecondaryEntity?.data?.data?.food_secondary_id;
    }

    const receiptNewEntity = await this.receiptRepository.findOne({
      where: {
        receipt_id: input.receipt_id,
      },
    });

    if (!receiptNewEntity) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่พบ รหัสใบงาน ในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    receiptNewEntity.code = input.code.trim();
    receiptNewEntity.date = input.date;
    receiptNewEntity.name = input.name.trim();
    receiptNewEntity.num_order = parseInt(numOrder.toString());
    receiptNewEntity.family_main_id = parseInt(plantFamilyMainId);
    receiptNewEntity.family_secondary_id = parseInt(plantFamilySecondaryId);
    receiptNewEntity.customer_id = input.customer_id;
    console.log(receiptNewEntity);
    const resultReceipt = await this.receiptRepository.save(receiptNewEntity);
    console.log(resultReceipt);
    return {
      code: 200,
      data: {
        data: {
          receipt_id: resultReceipt.receipt_id,
        },
      },
    };
  }

  async checkDeleteReceipt(input: ReceiptCheckDeleteInput): Promise<any> {
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

    const totalImport =
      await this.logPlantImportService.getLogPlantImportTotalByReceiptId({
        receipt_id: input.id,
      } as LogImportGetTotalByReceiptIdInput);

    const totalRemove =
      await this.logPlantRemoveService.getLogPlantRemoveTotalByReceiptId({
        receipt_id: input.id,
      } as LogRemoveGetTotalByReceiptIdInput);

    return {
      code: 200,
      data: {
        data: {
          total_import: totalImport,
          total_remove: totalRemove,
        },
      },
    };
  }

  async getReceiptDetail(input: ReceiptGetByIdInput): Promise<any> {
    // Check Member
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
    const receiptEntity = await this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect(
        PlantFamilyMain,
        'family_main',
        'family_main.id = receipt.family_main_id',
      )
      .leftJoinAndSelect(
        PlantFamilySecondary,
        'family_secondary',
        'family_secondary.id = receipt.family_secondary_id',
      )
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = receipt.create_by',
      )
      .leftJoinAndSelect(
        Customer,
        'customer',
        'customer.customer_id = receipt.customer_id',
      )
      .where('receipt.receipt_id = :receipt_id', {
        receipt_id: input.receipt_id,
      })
      .select([
        'receipt',
        'family_main',
        'family_secondary',
        'member',
        'customer',
      ])
      .getRawOne();

    console.log(receiptEntity);
    if (!receiptEntity) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่พบ ใบงาน ในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalImport =
      await this.logPlantImportService.getLogPlantImportTotalByReceiptId({
        receipt_id: input.receipt_id,
      } as LogImportGetTotalByReceiptIdInput);

    const totalRemove =
      await this.logPlantRemoveService.getLogPlantRemoveTotalByReceiptIdAndType(
        {
          receipt_id: input.receipt_id,
          plant_remove_type_id: null,
        } as LogRemoveGetTotalByReceiptIdAndTypeInput,
      );
    const totalExport =
      await this.logPlantRemoveService.getLogPlantRemoveTotalByReceiptIdAndType(
        {
          receipt_id: input.receipt_id,
          plant_remove_type_id: 5,
        } as LogRemoveGetTotalByReceiptIdAndTypeInput,
      );
    const totalResult = totalImport - totalRemove - totalExport;
    return {
      code: 200,
      data: {
        receipt_id: receiptEntity.receipt_receipt_id,
        code: receiptEntity.receipt_code,
        name: receiptEntity.receipt_name,
        num_order: receiptEntity.receipt_num_order,
        create_by: {
          member_id: receiptEntity.member_member_id,
          username: receiptEntity.member_username,
          email: receiptEntity.member_email,
          phone: receiptEntity.member_phone,
          name: receiptEntity.member_name,
          surname: receiptEntity.member_surname,
        },
        create_at: receiptEntity.receipt_create_at,
        family_main: {
          id: receiptEntity.family_main_id,
          description: receiptEntity.family_main_description,
        },
        family_secondary: {
          id: receiptEntity.family_secondary_id,
          description: receiptEntity.family_secondary_description,
        },
        customer: {
          customer_id: receiptEntity.customer_customer_id,
          name: receiptEntity.customer_name,
          update_at: receiptEntity.customer_update_at,
          create_at: receiptEntity.customer_create_at,
          address: receiptEntity.customer_address,
          phone: receiptEntity.customer_phone,
          email: receiptEntity.customer_email,
        },
        total_import: totalImport,
        total_remove: totalRemove,
        total_export: totalExport,
        total_result: totalResult,
      },
    };
  }

  async searchReceiptByName(input: ReceiptSearchByNameInput): Promise<any> {
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

    const receiptEntity: any = await this.receiptRepository
      .createQueryBuilder('receipt')
      .where('receipt.name like :name', { name: `%${input.word}%` })
      .select(['receipt.name'])
      .distinct()
      .orderBy('receipt.name', 'ASC')
      .getRawMany();
    const transformedData = receiptEntity.map((item) => ({
      name: item.receipt_name,
    }));

    return {
      code: 200,
      data: {
        data: transformedData,
      },
    };
  }

  async searchReceiptByCode(input: ReceiptSearchByCodeInput): Promise<any> {
    // Check Member
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
    const query = await this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect(
        PlantFamilyMain,
        'family_main',
        'family_main.id = receipt.family_main_id',
      )
      .leftJoinAndSelect(
        PlantFamilySecondary,
        'family_secondary',
        'family_secondary.id = receipt.family_secondary_id',
      )
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = receipt.create_by',
      )
      .leftJoinAndSelect(
        Customer,
        'customer',
        'customer.customer_id = receipt.customer_id',
      );

    if (input.is_match_all == 'true') {
      query.where('receipt.code LIKE :code', {
        code: `${input.word}`,
      });
    } else {
      query.where('receipt.code LIKE :code', {
        code: `%${input.word}%`,
      });
    }

    const receiptEntities = await query
      .select([
        'receipt',
        'family_main',
        'family_secondary',
        'member',
        'customer',
      ])
      .orderBy('receipt.code', 'ASC')
      .getRawMany();

    const lists: any[] = [];
    for (let i = 0; i < receiptEntities.length; i++) {
      const receiptEntity = receiptEntities[i];

      lists.push({
        code: 200,
        data: {
          receipt_id: receiptEntity.receipt_receipt_id,
          code: receiptEntity.receipt_code,
          name: receiptEntity.receipt_name,
          num_order: receiptEntity.receipt_num_order,
          create_by: {
            member_id: receiptEntity.member_member_id,
            username: receiptEntity.member_username,
            email: receiptEntity.member_email,
            phone: receiptEntity.member_phone,
            name: receiptEntity.member_name,
            surname: receiptEntity.member_surname,
          },
          create_at: receiptEntity.receipt_create_at,
          family_main: {
            id: receiptEntity.family_main_id,
            description: receiptEntity.family_main_description,
          },
          family_secondary: {
            id: receiptEntity.family_secondary_id,
            description: receiptEntity.family_secondary_description,
          },
          customer: {
            customer_id: receiptEntity.customer_customer_id,
            name: receiptEntity.customer_name,
            update_at: receiptEntity.customer_update_at,
            create_at: receiptEntity.customer_create_at,
            address: receiptEntity.customer_address,
            phone: receiptEntity.customer_phone,
            email: receiptEntity.customer_email,
          },
        },
      });
    }

    return {
      code: 200,
      data: {
        data: lists,
      },
    };
  }

  async searchReceiptDetailByCode(
    input: ReceiptSearchDetailByCodeInput,
  ): Promise<any> {
    // Check Member
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
    const query = await this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect(
        PlantFamilyMain,
        'family_main',
        'family_main.id = receipt.family_main_id',
      )
      .leftJoinAndSelect(
        Customer,
        'customer',
        'customer.customer_id = receipt.customer_id',
      );

    if (input.code != '') {
      if (input.is_match_all_code == 'true') {
        query.andWhere('receipt.code LIKE :code', {
          code: `${input.code}`,
        });
      } else {
        query.andWhere('receipt.code LIKE :code', {
          code: `%${input.code}%`,
        });
      }
    }

    if (input.name != '') {
      if (input.is_match_all_name == 'true') {
        query.andWhere('receipt.name LIKE :name', {
          name: `${input.name}`,
        });
      } else {
        query.andWhere('receipt.name LIKE :name', {
          name: `%${input.name}%`,
        });
      }
    }

    if (input.family_main != '') {
      if (input.is_match_all_family_main == 'true') {
        query.andWhere('family_main.description LIKE :name', {
          family_main: `${input.family_main}`,
        });
      } else {
        query.andWhere('family_main.description LIKE :name', {
          family_main: `%${input.family_main}%`,
        });
      }
    }

    if (input.customer != '') {
      if (input.is_match_all_customer == 'true') {
        query.andWhere('receipt.customer_id LIKE :customer_id', {
          customer_id: `${input.customer}`,
        });
      } else {
        query.andWhere('receipt.customer_id LIKE :customer_id', {
          customer_id: `%${input.customer}%`,
        });
      }
    }

    const startIndex: number = GetIndexStartOfPage(input.page, input.per_page);
    const endIndex: number =
      parseInt(startIndex + '') + parseInt(input.per_page + '') - 1;

    const queryTotal = query;

    const resultTotal = await queryTotal
      .select('COUNT(*)', 'total')
      .getRawOne();

    const receiptEntities = await query
      .select(['receipt', 'family_main', 'customer'])
      .orderBy('receipt.create_at', 'DESC')
      .offset(startIndex)
      .limit(input.per_page)
      .getRawMany();

    console.log(receiptEntities);

    const lists: any[] = [];
    for (let i = 0; i < receiptEntities.length; i++) {
      const receiptEntity = receiptEntities[i];

      lists.push({
        code: 200,
        data: {
          receipt_id: receiptEntity.receipt_receipt_id,
          code: receiptEntity.receipt_code,
          name: receiptEntity.receipt_name,
          num_order: receiptEntity.receipt_num_order,
          create_at: receiptEntity.receipt_create_at,
          family_main: {
            id: receiptEntity.family_main_id,
            description: receiptEntity.family_main_description,
          },
          customer: {
            customer_id: receiptEntity.customer_customer_id,
            name: receiptEntity.customer_name,
            update_at: receiptEntity.customer_update_at,
            create_at: receiptEntity.customer_create_at,
            address: receiptEntity.customer_address,
            phone: receiptEntity.customer_phone,
            email: receiptEntity.customer_email,
          },
        },
      });
    }

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: lists,
      },
    };
  }

  generateToken(): string {
    return crypto.randomBytes(50).toString('hex');
  }
}
