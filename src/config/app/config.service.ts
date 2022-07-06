import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get env(): string {
    return this.configService.get<string>('app.env');
  }

  get debug(): boolean {
    return this.configService.get<boolean>('app.debug');
  }

  get port(): number {
    return Number(this.configService.get<number>('app.port'));
  }
}
