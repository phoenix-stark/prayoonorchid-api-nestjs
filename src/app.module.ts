import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExcelModule } from './excel/excel.module';
import { AppConfigModule } from './config/app';
import { DbConfigModule, DbConfigService } from './config/database';
import { ReceiptModule } from './receipt/receipt.module';
import { CustomerModule } from './customer/customer.module';
import { PlantFamilyMainModule } from './plant-family-main/plant-family-main.module';

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
    AppConfigModule,
    ExcelModule,
    ReceiptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
