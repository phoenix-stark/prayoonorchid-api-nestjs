import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { MemberWithBarcode } from './entity/member-with-barcode-entity.model';
import { MemberWithBarcodeGetByBarcodeInput } from './dto/member-with-barcode-get-by-barcode.input';
import { MemberWithBarcodeDeleteInput } from './dto/member-with-barcode-delete.input';
import { MemberWithBarcodeCreateInput } from './dto/member-with-barcode-create.input';
import { MomentService } from 'src/utils/MomentService';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { MemberWithBarcodeUpdateInput } from './dto/member-with-barcode-update.input';
import { MemberWithBarcodeSearchInput } from './dto/member-with-barcode-search.input';
import { MemberWithBarcodeGetAllInput } from './dto/member-with-barcode-get-all.input';
import { Member } from 'src/member/entity/member-entity.model';
import { SourcesGrant } from 'src/sources-grant/entity/sources-grant-entity.model';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
@Injectable()
export class MemberWithBarcodeService {
  constructor(
    @InjectRepository(MemberWithBarcode)
    private readonly memberWithBarcodeRepository: Repository<MemberWithBarcode>,
    private logTokenService: LogTokenService,
    private momentWrapper: MomentService,
  ) {}

  async insertMemberWithBarcode(
    input: MemberWithBarcodeCreateInput,
  ): Promise<any> {
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

    const createBy = logTokenEntity.member_id;

    // START <= END BARCODE
    if (input.barcode_start > input.barcode_end) {
      throw new HttpException(
        {
          code: 400,
          message: `Barcode เริ่มต้น ต้องน้อยกว่า Barcode สิ้นสุด`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // CHECK BARCODE NOT IN DB
    const checkBarcodeStartResult = await this.getByBarcode({
      barcode: input.barcode_start,
    } as MemberWithBarcodeGetByBarcodeInput);
    if (!input.barcode_start || checkBarcodeStartResult) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่สามารถบันทึกได้ เนื่องจาก Barcode นี้อยู่ในระบบแล้ว`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkBarcodeEndResult = await this.getByBarcode({
      barcode: input.barcode_end,
    } as MemberWithBarcodeGetByBarcodeInput);
    if (!input.barcode_end || checkBarcodeEndResult) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่สามารถบันทึกได้ เนื่องจาก Barcode นี้อยู่ในระบบแล้ว`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const memberWithBarcodeEntity = new MemberWithBarcode();
    memberWithBarcodeEntity.member_id = input.member_id;
    memberWithBarcodeEntity.barcode_start = input.barcode_start;
    memberWithBarcodeEntity.barcode_end = input.barcode_end;
    memberWithBarcodeEntity.create_at = updateAt;
    memberWithBarcodeEntity.create_by = createBy;
    const memberWithBarcodeNewEntity =
      await this.memberWithBarcodeRepository.save(memberWithBarcodeEntity);

    return {
      code: 200,
      data: {
        data: {
          log_id: memberWithBarcodeNewEntity.log_id,
        },
      },
    };
  }

  async updateMemberWithBarcode(
    input: MemberWithBarcodeUpdateInput,
  ): Promise<any> {
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

    const createBy = logTokenEntity.member_id;

    // START <= END BARCODE
    if (input.new_barcode_start > input.new_barcode_end) {
      throw new HttpException(
        {
          code: 400,
          message: `Barcode เริ่มต้น ต้องน้อยกว่า Barcode สิ้นสุด`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let isCheckBarcodeStart = false;
    let isCheckBarcodeEnd = false;

    // CHECK BARCODE NOT IN DB
    const checkBarcodeStartResult = await this.getByBarcode({
      barcode: input.new_barcode_start,
    } as MemberWithBarcodeGetByBarcodeInput);
    console.log(checkBarcodeStartResult);
    console.log(input);
    if (
      input.new_barcode_start &&
      (!checkBarcodeStartResult ||
        (checkBarcodeStartResult &&
          checkBarcodeStartResult.barcode_start == input.prev_barcode_start))
    ) {
      isCheckBarcodeStart = true;
    }

    const checkBarcodeEndResult = await this.getByBarcode({
      barcode: input.new_barcode_end,
    } as MemberWithBarcodeGetByBarcodeInput);
    if (
      input.new_barcode_end &&
      (!checkBarcodeEndResult ||
        (checkBarcodeEndResult &&
          checkBarcodeEndResult.barcode_end == input.prev_barcode_end))
    ) {
      isCheckBarcodeEnd = true;
    }

    console.log('isCheckBarcodeStart: ' + isCheckBarcodeStart);
    console.log('isCheckBarcodeEnd: ' + isCheckBarcodeEnd);

    if (isCheckBarcodeStart == false) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่สามารถบันทึกได้ เนื่องจาก Barcode เริ่มต้น มีอยู่ในระบบแล้ว`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isCheckBarcodeEnd == false) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่สามารถบันทึกได้ เนื่องจาก Barcode สื้นสุด มีอยู่ในระบบแล้ว`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isCheckBarcodeStart && isCheckBarcodeEnd) {
      const checkBarcodeStartPrev = await this.getByBarcode({
        barcode: input.prev_barcode_start,
      } as MemberWithBarcodeGetByBarcodeInput);

      // delete
      await this.deleteMember({
        member_id: checkBarcodeStartPrev.member_id,
        barcode_start: checkBarcodeStartPrev.barcode_start,
        barcode_end: checkBarcodeStartPrev.barcode_end,
      } as MemberWithBarcodeDeleteInput);

      const memberWithBarcodeNewEntity = await this.insertMemberWithBarcode({
        token: input.token,
        member_id: input.member_id,
        barcode_start: input.new_barcode_start,
        barcode_end: input.new_barcode_end,
      } as MemberWithBarcodeCreateInput);

      return {
        code: 200,
        data: {
          data: {
            log_id: memberWithBarcodeNewEntity.log_id,
          },
        },
      };
    }
  }

  async getByBarcode(input: MemberWithBarcodeGetByBarcodeInput): Promise<any> {
    const memberWithBarcodeEntity =
      await this.memberWithBarcodeRepository.findOne({
        where: {
          barcode_start: LessThanOrEqual(input.barcode),
          barcode_end: MoreThanOrEqual(input.barcode),
        },
      });
    if (memberWithBarcodeEntity) {
      return memberWithBarcodeEntity;
    } else {
      return null;
    }
  }

  async deleteMember(input: MemberWithBarcodeDeleteInput): Promise<any> {
    const r = await this.memberWithBarcodeRepository
      .createQueryBuilder()
      .where('member_id = :member_id', { member_id: input.member_id })
      .andWhere('barcode_start = :barcode_start', {
        barcode_start: input.barcode_start,
      })
      .andWhere('barcode_end = :barcode_end', {
        barcode_end: input.barcode_end,
      })
      .delete()
      .execute();
    return {
      code: 200,
    };
  }

  async searchBarcode(input: MemberWithBarcodeSearchInput): Promise<any> {
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

    const query = this.memberWithBarcodeRepository
      .createQueryBuilder('member_with_barcode')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = member_with_barcode.member_id',
      )
      .leftJoinAndSelect(SourcesGrant, 'grant', 'grant.id = member.grant_id')

      .where(
        '(:barcode BETWEEN member_with_barcode.barcode_start AND member_with_barcode.barcode_end)',
        { barcode: input.word },
      )
      .orWhere(
        'member.name LIKE :barcodePattern OR member.surname LIKE :barcodePattern',
        {
          barcodePattern: `%${input.word}%`,
        },
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
      .select([
        'member_with_barcode.log_id',
        'member_with_barcode.barcode_start',
        'member_with_barcode.barcode_end',
        'member.member_id',
        'member.username',
        'member.email',
        'member.phone',
        'member.name',
        'member.surname',
        'member.is_block',
        'grant.id',
        'grant.description',
      ])
      .orderBy('barcode_start', 'DESC')
      .getRawMany();

    const result = await query.getRawMany();
    const memberWithBarcodeEntities = result.map((row: any) => ({
      log_id: row.member_with_barcode_log_id,
      member: {
        member_id: row.member_member_id,
        username: row.member_username,
        email: row.member_email,
        phone: row.member_phone,
        name: row.member_name,
        surname: row.member_surname,
        is_block: row.member_is_block,
        grant: {
          id: row.grant_id,
          description: row.grant_description,
        },
      },
      barcode_start: row.member_with_barcode_barcode_start,
      barcode_end: row.member_with_barcode_barcode_end,
    }));
    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: memberWithBarcodeEntities,
      },
    };
  }

  async getBarcodeAll(input: MemberWithBarcodeGetAllInput): Promise<any> {
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

    const query = this.memberWithBarcodeRepository
      .createQueryBuilder('member_with_barcode')
      .leftJoinAndSelect(
        Member,
        'member',
        'member.member_id = member_with_barcode.member_id',
      )
      .leftJoinAndSelect(SourcesGrant, 'grant', 'grant.id = member.grant_id');

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
      .select([
        'member_with_barcode.log_id',
        'member_with_barcode.barcode_start',
        'member_with_barcode.barcode_end',
        'member.member_id',
        'member.username',
        'member.email',
        'member.phone',
        'member.name',
        'member.surname',
        'member.is_block',
        'grant.id',
        'grant.description',
      ])
      .orderBy('barcode_start', 'DESC')
      .getRawMany();
    const result = await query.getRawMany();
    const memberWithBarcodeEntities = result.map((row: any) => ({
      log_id: row.member_with_barcode_log_id,
      member: {
        member_id: row.member_member_id,
        username: row.member_username,
        email: row.member_email,
        phone: row.member_phone,
        name: row.member_name,
        surname: row.member_surname,
        is_block: row.member_is_block,
        grant: {
          id: row.grant_id,
          description: row.grant_description,
        },
      },
      barcode_start: row.member_with_barcode_barcode_start,
      barcode_end: row.member_with_barcode_barcode_end,
    }));
    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: memberWithBarcodeEntities,
      },
    };
  }

  getStartIndexPage = (page: number, limit_per_page: number) => {
    return (page - 1) * limit_per_page;
  };
}
