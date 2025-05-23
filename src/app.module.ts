import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExcelModule } from './excel/excel.module';
import { AppConfigModule } from './config/app';
import { DbConfigModule, DbConfigService } from './config/database';
import { ReceiptModule } from './receipt/receipt.module';
import { PlantFamilyMainModule } from './plant-family-main/plant-family-main.module';
import { CustomerModule } from './customer/customer.module';
import { LogPlantImportModule } from './log-plant-import/log-plant-import.module';
import { ReportModule } from './report/report.module';
import { LogPlantRemoveModule } from './log-plant-remove/log-plant-remove.module';
import { FoodPlantModule } from './food-plant/food-plant.module';
import { SourcesWorkMainTypeModule } from './sources-work-main-type/sources-work-main-type.module';
import { MemberModule } from './member/member.module';
import { SourcesWorkTypeModule } from './sources-work-type/sources-work-type.module';
import { SourcesPlantRemoveTypeModule } from './sources-plant-remove-type/sources-plant-remove-type.module';
import { MomentService } from './utils/MomentService';
import { LogTokenModule } from './log-token/log-token.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './task/task.module';
import { SourcesGrantModule } from './sources-grant/sources-grant.module';
import { PlantFamilySecondaryModule } from './plant-family-secondary/plant-family-secondary.module';
import { MemberWithBarcodeModule } from './member-with-barcode/member-with-barcode.module';
import { LogPlantRemoveEditModule } from './log-plant-remove-edit/log-plant-remove-edit.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DbConfigModule],
      useFactory: (dbConfigService: DbConfigService) => ({
        type: 'mysql',
        host: dbConfigService.host,
        port: dbConfigService.port,
        username: dbConfigService.username,
        password: dbConfigService.password,
        database: dbConfigService.database,
        synchronize: dbConfigService.synchronize,
        logging: dbConfigService.logging,
        autoLoadEntities: true,
        // Bug typeorm synchronize resolve path with Typescript
        // ref1: https://github.com/typeorm/typeorm/issues/420
        // ref2: https://stackoverflow.com/questions/59435293/typeorm-entity-in-nestjs-cannot-use-import-statement-outside-a-module
        entities: ['dist/**/*.model.js'],
      }),
      inject: [DbConfigService],
    }),
    HttpModule,
    MomentService,
    AppConfigModule,
    ExcelModule,
    ReceiptModule,
    PlantFamilyMainModule,
    CustomerModule,
    LogPlantImportModule,
    ReportModule,
    LogPlantRemoveModule,
    FoodPlantModule,
    SourcesWorkMainTypeModule,
    SourcesWorkTypeModule,
    MemberModule,
    SourcesPlantRemoveTypeModule,
    MemberWithBarcodeModule,
    LogTokenModule,
    ScheduleModule.forRoot(),
    TasksModule,
    SourcesGrantModule,
    PlantFamilySecondaryModule,
    LogPlantRemoveEditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
