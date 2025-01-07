import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entity/customer-entity.model';
import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Repository } from 'typeorm';
import { ReceiptGetInput } from './dto/receipt-get-input';
import { Receipt } from './entity/receipt-entity.model';
import { ReceiptDeleteInput } from './dto/receipt-delete-input';
import { LogToken } from 'src/log-token/entity/log-token-entity.model';
import { Member } from 'src/member/entity/member-entity.model';
import { ReceiptGetTotalByCustomerIdInput } from './dto/receipt-get-total-by-customer-id-input';
import { ReceiptGetTotalByPlantFamilyMainIdInput } from './dto/receipt-get-total-by-plant-family-main-id-input';
import { ReceiptGetByIdInput } from './dto/receipt-get-by-id.input';
import { FoodPlant } from 'src/food-plant/entity/food-plant-entity.model';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(LogToken)
    private readonly logTokenRepository: Repository<LogToken>,
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
    let memberEntity = null;
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity) {
      return {
        code: 400,
        message: 'Username นี้ ถูก Block',
      };
    } else {
      memberEntity = await this.memberRepository.findOne({
        where: {
          member_id: logTokenEntity.member_id,
        },
      });
      if (!memberEntity || memberEntity.is_block === '1') {
        return {
          code: 400,
          message: 'Username นี้ ถูก Block',
        };
      }
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
}
