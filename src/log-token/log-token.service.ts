import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogToken } from './entity/log-token-entity.model';
import { LogTokenCreateInput } from './dto/log-token-create.input';
import * as crypto from 'crypto';
import { MomentService } from 'src/utils/MomentService';
import { LogTokenGetInput } from './dto/log-token-get.input';

@Injectable()
export class LogTokenService {
  constructor(
    @InjectRepository(LogToken)
    private readonly logTokenRepository: Repository<LogToken>,
    private momentWrapper: MomentService,
  ) {}

  async createLogToken(input: LogTokenCreateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const token = this.generateToken();
    const logTokenEntity = new LogToken();
    logTokenEntity.member_id = input.member_id;
    logTokenEntity.token = token;
    logTokenEntity.update_at = updateAt;
    logTokenEntity.create_at = updateAt;
    await this.logTokenRepository.save(logTokenEntity);
    return token;
  }

  async getLogToken(input: LogTokenGetInput): Promise<any> {
    const logTokenEntity = await this.logTokenRepository.findOne({
      where: {
        token: input.token,
      },
    });
    if (!logTokenEntity || !input || !input.token) {
      return null;
    }
    return logTokenEntity;
  }

  generateToken(): string {
    return crypto.randomBytes(100).toString('hex');
  }
}
