import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Member } from './entity/member-entity.model';
import { MemberAuthInput } from './dto/member-auth.input';
import { LogTokenService } from 'src/log-token/log-token.service';
import { LogTokenCreateInput } from 'src/log-token/dto/log-token-create.input';
import { SourcesGrantService } from 'src/sources-grant/sources-grant.service';
import { SourcesGrantInput } from 'src/sources-grant/dto/sources-grant.input';
import { LogTokenGetInput } from 'src/log-token/dto/log-token-get.input';
import { MemberUpdatePasswordInput } from './dto/member-update-password.input';
import { PASSWORD } from 'src/constants';
import { MomentService } from 'src/utils/MomentService';
import { MemberCreateInput } from './dto/member-create.input';
import { MemberUpdateInput } from './dto/member-update.input';
import { MemberUpdateBlockInput } from './dto/member-update-block.input';
import { MemberGetByIdInput } from './dto/member-get-by-id.input';
import { MemberGetAllInput } from './dto/member-get-all';
import { MemberSearchInput } from './dto/member-search.input';
import { MemberResetPasswordInput } from './dto/member-reset-password.input';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
import { SourcesGrant } from 'src/sources-grant/entity/sources-grant-entity.model';
import { MemberSearchWordInput } from './dto/member-search-word.input';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private logTokenService: LogTokenService,
    private sourcesGrantModule: SourcesGrantService,
    private momentWrapper: MomentService,
  ) {}

  async auth(input: MemberAuthInput): Promise<any> {
    const memberEntity = await this.memberRepository.findOne({
      where: {
        username: input.username,
      },
    });

    if (!memberEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'ไม่พบผู้ใช้งานในระบบ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(memberEntity);
    const isAuth = await bcrypt.compare(input.password, memberEntity.password);
    if (isAuth) {
      // if (true) {
      if (memberEntity.is_block == '1') {
        throw new HttpException(
          {
            code: 400,
            message: 'Username นี้ ถูก Block',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (memberEntity.grant_id == 1) {
        throw new HttpException(
          {
            code: 400,
            message: 'ผู้ใช้งานไม่มีสิทธิ์ในการเข้าใช้ระบบ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // insert token
      const token = await this.logTokenService.createLogToken({
        member_id: memberEntity.member_id,
      } as LogTokenCreateInput);

      const grantInfo = memberEntity.grant_id
        ? await this.sourcesGrantModule.getById({
            id: memberEntity.grant_id,
          } as SourcesGrantInput)
        : null;

      const info = {
        member_id: memberEntity.member_id,
        username: memberEntity.username,
        email: memberEntity.email,
        phone: memberEntity.phone,
        name: memberEntity.name,
        surname: memberEntity.surname,
        is_block: memberEntity.is_block,
        grant: grantInfo,
      };

      return {
        code: 200,
        data: {
          token: token,
          data: info,
        },
      };
    } else {
      throw new HttpException(
        {
          code: 400,
          message: 'ไม่พบผู้ใช้งานในระบบ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async resetPassword(input: MemberResetPasswordInput): Promise<any> {
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

    const memberEntity = await this.memberRepository.findOne({
      where: {
        member_id: logTokenEntity.member_id,
      },
    });

    if (!memberEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'ไม่พบผู้ใช้งานในระบบ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (memberEntity.is_block == '1') {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const memberUserEntity = await this.memberRepository.findOne({
      where: {
        member_id: input.id,
      },
    });

    const newPassword = this.generateRandomString(5);

    const hashPassword = await bcrypt.hash(newPassword, PASSWORD.SALT_ROUND);
    memberUserEntity.password = hashPassword;
    memberUserEntity.update_at = updateAt;
    const result = await this.memberRepository.save(memberUserEntity);
    console.log(hashPassword);
    console.log(result);

    return {
      code: 200,
      data: {
        member_id: input.id,
        password: newPassword,
      },
    };
  }

  async changePassword(input: MemberUpdatePasswordInput): Promise<any> {
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

    const memberEntity = await this.memberRepository.findOne({
      where: {
        member_id: logTokenEntity.member_id,
      },
    });

    if (!memberEntity) {
      throw new HttpException(
        {
          code: 400,
          message: 'ไม่พบผู้ใช้งานในระบบ',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (memberEntity.is_block == '1') {
      throw new HttpException(
        {
          code: 400,
          message: 'Username นี้ ถูก Block',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isAuth = await bcrypt.compare(
      input.old_password,
      memberEntity.password,
    );
    if (!isAuth) {
      throw new HttpException(
        {
          code: 400,
          message: 'รหัสผ่านเดิมไม่ถูกต้อง',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPassword = input.new_password;

    const hashPassword = await bcrypt.hash(newPassword, PASSWORD.SALT_ROUND);
    memberEntity.password = hashPassword;
    memberEntity.update_at = updateAt;
    const result = await this.memberRepository.save(memberEntity);

    return {
      code: 200,
      data: {
        member_id: memberEntity.member_id,
      },
    };
  }

  async createMember(input: MemberCreateInput): Promise<any> {
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

    const memberEntity = await this.memberRepository.findOne({
      where: {
        username: input.username,
      },
    });

    if (memberEntity) {
      throw new HttpException(
        {
          code: 400,
          message: `มี Username ${input.username} แล้วในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const memberId = this.generateRandomString(50);
    const hashPassword = await bcrypt.hash(input.password, PASSWORD.SALT_ROUND);

    const memberNewEntity = new Member();
    memberNewEntity.member_id = memberId;
    memberNewEntity.username = input.username;
    memberNewEntity.password = hashPassword;
    memberNewEntity.name = input.name;
    memberNewEntity.surname = input.surname;
    memberNewEntity.email = input.email;
    memberNewEntity.grant_id = input.grant_id;
    memberNewEntity.is_block = '0';
    memberNewEntity.phone = input.phone;
    memberNewEntity.create_at = updateAt;
    memberNewEntity.update_at = updateAt;
    const result = await this.memberRepository.save(memberNewEntity);
    console.log(result);
    return {
      code: 200,
      data: {
        member_id: memberId,
      },
    };
  }

  async updateMember(input: MemberUpdateInput): Promise<any> {
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

    const memberEntity = await this.memberRepository.findOne({
      where: {
        member_id: input.id,
      },
    });

    if (!memberEntity) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่มีผู้ใช้งานในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    memberEntity.name = input.name;
    memberEntity.surname = input.surname;
    memberEntity.email = input.email;
    memberEntity.grant_id = input.grant_id;
    memberEntity.phone = input.phone;
    memberEntity.update_at = updateAt;
    const result = await this.memberRepository.save(memberEntity);
    console.log(result);
    return {
      code: 200,
      data: {
        member_id: memberEntity.member_id,
      },
    };
  }

  async updateMemberBlock(input: MemberUpdateBlockInput): Promise<any> {
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

    const memberEntity = await this.memberRepository.findOne({
      where: {
        member_id: input.id,
      },
    });

    if (!memberEntity) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่มีผู้ใช้งานในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    memberEntity.is_block = input.is_block;
    memberEntity.update_at = updateAt;
    const result = await this.memberRepository.save(memberEntity);
    console.log(result);
    return {
      code: 200,
      data: {
        member_id: memberEntity.member_id,
      },
    };
  }

  async getMemberById(input: MemberGetByIdInput): Promise<any> {
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

    const memberEntity = await this.memberRepository.findOne({
      where: {
        member_id: input.id,
      },
    });

    if (!memberEntity) {
      throw new HttpException(
        {
          code: 400,
          message: `ไม่มีผู้ใช้งานในระบบ`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const grantInfo = memberEntity.grant_id
      ? await this.sourcesGrantModule.getById({
          id: memberEntity.grant_id,
        } as SourcesGrantInput)
      : null;

    const info = {
      member_id: memberEntity.member_id,
      username: memberEntity.username,
      email: memberEntity.email,
      phone: memberEntity.phone,
      name: memberEntity.name,
      surname: memberEntity.surname,
      is_block: memberEntity.is_block,
      grant: grantInfo,
    };

    return {
      code: 200,
      data: info,
    };
  }

  async getMemberAll(input: MemberGetAllInput): Promise<any> {
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

    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect(
        SourcesGrant,
        'sources_grant',
        'sources_grant.id = member.grant_id',
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
      .select(['member', 'sources_grant'])
      .orderBy('name', 'ASC')
      .addOrderBy('surname', 'ASC')
      .getRawMany();

    const memberEntities = await query.getRawMany();
    const results = [];
    for (let i = 0; i < memberEntities.length; i++) {
      const memberEntity = memberEntities[i];
      const info = {
        member_id: memberEntity.member_member_id,
        username: memberEntity.member_username,
        email: memberEntity.member_email,
        phone: memberEntity.member_phone,
        name: memberEntity.member_name,
        surname: memberEntity.member_surname,
        is_block: memberEntity.member_is_block,
        grant: memberEntity.sources_grant_id
          ? {
              id: memberEntity.sources_grant_id,
              description: memberEntity.sources_grant_description,
            }
          : null,
      };

      results.push(info);
    }

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: results,
      },
    };
  }

  async searchMember(input: MemberSearchInput): Promise<any> {
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

    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect(
        SourcesGrant,
        'sources_grant',
        'sources_grant.id = member.grant_id',
      )
      .where(
        new Brackets((qb) => {
          qb.where('member.name LIKE :name', { name: `%${input.word}%` })
            .orWhere('member.surname LIKE :surname', {
              surname: `%${input.word}%`,
            })
            .orWhere('member.username LIKE :username', {
              username: `%${input.word}%`,
            });
        }),
      )
      .andWhere('member.grant_id = :grant_id', { grant_id: input.grant });

    query
      .select(['member', 'sources_grant'])
      .orderBy('name', 'ASC')
      .addOrderBy('surname', 'ASC')
      .getRawMany();

    const memberEntities = await query.getRawMany();
    const results = [];
    for (let i = 0; i < memberEntities.length; i++) {
      const memberEntity = memberEntities[i];
      const info = {
        member_id: memberEntity.member_member_id,
        username: memberEntity.member_username,
        email: memberEntity.member_email,
        phone: memberEntity.member_phone,
        name: memberEntity.member_name,
        surname: memberEntity.member_surname,
        is_block: memberEntity.member_is_block,
        grant: memberEntity.sources_grant_id
          ? {
              id: memberEntity.sources_grant_id,
              description: memberEntity.sources_grant_description,
            }
          : null,
      };

      results.push(info);
    }

    return {
      code: 200,
      data: results,
    };
  }

  async searchMemberWord(input: MemberSearchWordInput): Promise<any> {
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

    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect(
        SourcesGrant,
        'sources_grant',
        'sources_grant.id = member.grant_id',
      )
      .where(
        new Brackets((qb) => {
          qb.where('member.name LIKE :name', { name: `%${input.word}%` })
            .orWhere('member.surname LIKE :surname', {
              surname: `%${input.word}%`,
            })
            .orWhere('member.username LIKE :username', {
              username: `%${input.word}%`,
            });
        }),
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
      .select(['member', 'sources_grant'])
      .orderBy('name', 'ASC')
      .addOrderBy('surname', 'ASC')
      .getRawMany();

    const memberEntities = await query.getRawMany();
    const results = [];
    for (let i = 0; i < memberEntities.length; i++) {
      const memberEntity = memberEntities[i];
      const info = {
        member_id: memberEntity.member_member_id,
        username: memberEntity.member_username,
        email: memberEntity.member_email,
        phone: memberEntity.member_phone,
        name: memberEntity.member_name,
        surname: memberEntity.member_surname,
        is_block: memberEntity.member_is_block,
        grant: memberEntity.sources_grant_id
          ? {
              id: memberEntity.sources_grant_id,
              description: memberEntity.sources_grant_description,
            }
          : null,
      };

      results.push(info);
    }

    return {
      code: 200,
      data: {
        start_index: startIndex,
        end_index: endIndex,
        page: parseInt(input.page.toString()),
        per_page: parseInt(input.per_page.toString()),
        total_all: parseInt(resultTotal.total.toString()),
        data: results,
      },
    };
  }

  generateRandomString(length = 10): string {
    const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let randomString = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      randomString += characters[randomIndex];
    }

    return randomString;
  }

  getStartIndexPage = (page: number, limit_per_page: number) => {
    return (page - 1) * limit_per_page;
  };

  async updatePasswordMemberAll(): Promise<any> {
    const query = this.memberRepository.createQueryBuilder('member');

    query
      .select(['member'])
      .orderBy('name', 'ASC')
      .addOrderBy('surname', 'ASC')
      .getRawMany();

    const memberEntities = await query.getRawMany();
    const results = [];
    for (let i = 0; i < memberEntities.length; i++) {
      const memberEntity = memberEntities[i];

      const member_id = memberEntity.member_member_id;
      // UPDATE PASSWORD
      const memberObj = await this.memberRepository.findOne({
        where: {
          member_id: member_id,
        },
      });
      console.log('User:' + memberObj.username);
      const hashPassword = await bcrypt.hash('1234', PASSWORD.SALT_ROUND);
      memberObj.password = hashPassword;
      await this.memberRepository.save(memberObj);
    }

    return {
      code: 200,
    };
  }
}
