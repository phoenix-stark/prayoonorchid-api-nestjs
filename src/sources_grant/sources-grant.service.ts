import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourcesGrantInput } from './dto/sources-grant.input';
import { SourcesGrant } from './entity/sources-grant-entity.model';

@Injectable()
export class SourcesGrantService {
  constructor(
    @InjectRepository(SourcesGrant)
    private readonly sourcesGrantRepository: Repository<SourcesGrant>,
  ) {}

  async getById(input: SourcesGrantInput): Promise<any> {
    const grantEntity = await this.sourcesGrantRepository.findOne({
      where: {
        id: input.id,
      },
    });

    return grantEntity;
  }
}
