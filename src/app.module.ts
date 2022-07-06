import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExcelModule } from './excel/excel.module';
import { AppConfigModule } from './config/app';

@Module({
  imports: [HttpModule, AppConfigModule, ExcelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
