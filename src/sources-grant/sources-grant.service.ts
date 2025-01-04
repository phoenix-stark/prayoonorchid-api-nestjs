import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourcesGrantInput } from './dto/sources-grant.input';
import { SourcesGrant } from './entity/sources-grant-entity.model';
import { SourcesGrantGetAllInput } from './dto/sources-grant-get-all.input';
import { LogTokenService } from 'src/log_token/log-token.service';
import { LogTokenGetInput } from 'src/log_token/dto/log-token-get.input';

@Injectable()
export class SourcesGrantService {
  constructor(
    @InjectRepository(SourcesGrant)
    private readonly sourcesGrantRepository: Repository<SourcesGrant>,
    private logTokenService: LogTokenService,
  ) {}

  async getById(input: SourcesGrantInput): Promise<any> {
    const grantEntity = await this.sourcesGrantRepository.findOne({
      where: {
        id: input.id,
      },
    });

    return grantEntity;
  }

  async getAll(input: SourcesGrantGetAllInput): Promise<any> {
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

    const grantEntity = await this.sourcesGrantRepository.find({
      order: {
        description: 'ASC',
      },
    });

    return grantEntity;
  }
}
