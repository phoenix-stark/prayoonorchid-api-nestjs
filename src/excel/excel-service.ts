import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { ReceiptService } from 'src/receipt/receipt.service';
import { ReportService } from 'src/report/report.service';
import { MomentService } from 'src/utils/MomentService';
import * as tmp from 'tmp';
import { ExcelExportReportStockInput } from './dto/excel-export-report-stock.input';
import { ReportGetInput } from './dto/report-get.input';
@Injectable()
export class ExcelService {
  constructor(
    private readonly receiptService: ReceiptService,
    private readonly reportService: ReportService,
    private momentWrapper: MomentService,
  ) {}

  async exportReportBottle(input: ReportGetInput): Promise<any> {
    console.log('exportReportBottle:');
    console.log(input);
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');

    const data = [];
    const rows = [];
    data.push({
      no: 'No.',
      employee_name: 'ชื่อ-นามสกุลพนักงาน',
      date_import: 'วัน/เดือน/ปี ที่นำเข้า',
      plant_code: 'รหัสพันธุ์ไม้',
      order_no: 'จำนวนสั่ง',
      customer_name: 'ชื่อคู่ค้า',
      plant_family_main: 'สายพันธุ์หลัก',
      main_work: 'ประเภทงานหลัก',
      type_work: 'ประเภทงาน',
      food: 'อาหารวุ้น',
      import_number: 'จำนวนนำเข้า',
    });
    // Add Data Row
    const result = await this.reportService.getReportBottle(input);
    for (let i = 0; i < result.length; i++) {
      const rowsDB = result[i];
      data.push({
        no: i,
        employee_name: `${rowsDB.member_name} ${rowsDB.member_surname}`,
        date_import: this.momentWrapper
          .momentDate(rowsDB.import_date)
          .format('DD/MM/YYYY'),
        plant_code: rowsDB.receipt_code,
        order_no: rowsDB.receipt_num_order,
        customer_name: rowsDB.customer_name,
        plant_family_main: rowsDB.plant_family_main,
        main_work: rowsDB.main_work_type,
        type_work: rowsDB.work_type,
        food: rowsDB.food,
        import_number: rowsDB.total_import,
      });
    }
    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 0; i < result.length; i++) {
      [
        `A${i + 1}`,
        `B${i + 1}`,
        `C${i + 1}`,
        `D${i + 1}`,
        `E${i + 1}`,
        `F${i + 1}`,
        `G${i + 1}`,
        `H${i + 1}`,
        `I${i + 1}`,
        `J${i + 1}`,
        `K${i + 1}`,
      ].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      });
    }

    // Column style
    const colsStyle = [
      { key: 'A', width: 5, align: 'right' },
      { key: 'B', width: 20, align: 'center' },
      { key: 'C', width: 20, align: 'center' },
      { key: 'D', width: 15, align: 'center' },
      { key: 'E', width: 10, align: 'right' },
      { key: 'F', width: 20, align: 'left' },
      { key: 'G', width: 25, align: 'left' },
      { key: 'H', width: 15, align: 'left' },
      { key: 'I', width: 15, align: 'left' },
      { key: 'J', width: 10, align: 'left' },
      { key: 'K', width: 15, align: 'center' },
    ];

    // Column Row Data
    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      sheet.getColumn(column.key).alignment = {
        horizontal: 'center',
      };
    });

    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      if (column.align === 'center') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'center',
        };
      } else if (column.align === 'right') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'right',
        };
      } else {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'left',
        };
      }
    });

    // Header
    ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1'].map(
      (cell) => {
        sheet.getCell(cell).style = {
          font: {
            bold: true,
          },
          alignment: {
            horizontal: 'center',
          },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      },
    );

    // Write Excel
    const file = new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: '20.12-29.12.2022 ขวด',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (_err, _file) => {
          if (_err) throw _err;
          book.xlsx
            .writeFile(_file)
            .then(() => {
              resolve(_file);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
    return file;
  }

  async exportReportRemoveAll(
    input: ExcelExportReportStockInput,
  ): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');

    const params = {
      data: input.date,
    };
    const result = [];
    const data = [];
    const rows = [];
    data.push({
      no: 'No.',
      date_export: 'วัน/เดือน/ปี ที่นำออก',
      date_import: 'วัน/เดือน/ปี ที่นำเข้า',
      plant_code: 'รหัสพันธุ์ไม้',
      plant_name: 'ชื่อพันธุ์ไม้',
      plant_family_main: 'สายพันธุ์หลัก',
      customer_name: 'ชื่อคู่ค้า',
      send_to: 'ส่งให้กับ',
      employee_name: 'ชื่อ - นามสกุล พนักงาน',
      main_work: 'ประเภทงานหลัก',
      type_work: 'ประเภทงาน',
      export_number: 'จำนวนนำออก',
      export_type: 'ประเภทนำออก',
      employee_export: 'ผู้ใช้งานที่ยิงออก',
    });
    // Add Data Row
    for (let i = 0; i < 2000; i++) {
      data.push({
        no: i,
        date_export: '30/5/2022',
        date_import: '3/12/2022',
        plant_code: 'รหัสพันธุ์ไม้',
        plant_name: 'ชื่อพันธุ์ไม้',
        plant_family_main: 'สายพันธุ์หลัก',
        customer_name: 'ชื่อคู่ค้า',
        send_to: 'ส่งให้กับ',
        employee_name: 'ชื่อ - นามสกุล พนักงาน',
        main_work: 'ประเภทงานหลัก',
        type_work: 'ประเภทงาน',
        export_number: 10000,
        export_type: 'ประเภทนำออก',
        employee_export: 'ผู้ใช้งานที่ยิงออก',
      });
    }
    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 1; i <= 2000; i++) {
      [
        `A${i + 1}`,
        `B${i + 1}`,
        `C${i + 1}`,
        `D${i + 1}`,
        `E${i + 1}`,
        `F${i + 1}`,
        `G${i + 1}`,
        `H${i + 1}`,
        `I${i + 1}`,
        `J${i + 1}`,
        `K${i + 1}`,
        `L${i + 1}`,
        `M${i + 1}`,
        `N${i + 1}`,
      ].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      });
    }

    // Column style
    const colsStyle = [
      { key: 'A', width: 5, align: 'right' },
      { key: 'B', width: 20, align: 'center' },
      { key: 'C', width: 20, align: 'center' },
      { key: 'D', width: 15, align: 'left' },
      { key: 'E', width: 35, align: 'left' },
      { key: 'F', width: 35, align: 'left' },
      { key: 'G', width: 25, align: 'left' },
      { key: 'H', width: 10, align: 'left' },
      { key: 'I', width: 20, align: 'left' },
      { key: 'J', width: 15, align: 'center' },
      { key: 'K', width: 10, align: 'left' },
      { key: 'L', width: 15, align: 'center' },
      { key: 'M', width: 15, align: 'center' },
      { key: 'N', width: 15, align: 'left' },
    ];

    // Column Row Data
    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      sheet.getColumn(column.key).alignment = {
        horizontal: 'center',
      };
    });

    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      if (column.align === 'center') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'center',
        };
      } else if (column.align === 'right') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'right',
        };
      } else {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'left',
        };
      }
    });

    // Header
    [
      'A1',
      'B1',
      'C1',
      'D1',
      'E1',
      'F1',
      'G1',
      'H1',
      'I1',
      'J1',
      'K1',
      'L1',
      'M1',
      'N1',
    ].map((cell) => {
      sheet.getCell(cell).style = {
        font: {
          bold: true,
        },
        alignment: {
          horizontal: 'center',
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    });

    // Write Excel
    const file = new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: '20.12-29.12.2022 นำออก',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (_err, _file) => {
          if (_err) throw _err;
          book.xlsx
            .writeFile(_file)
            .then(() => {
              resolve(_file);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
    return file;
  }

  async exportReportStock(input: ExcelExportReportStockInput): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');

    const params = {
      data: input.date,
    };
    const result = [];

    sheet.mergeCells('A1:P1');
    sheet.getCell('A1').value =
      ' วันที่นำเข้าเริ่มต้น: 01/01/2021, วันที่นำเข้าสิ้นสุด: 02/10/2021 รหัสพันธุ์ไม้: POF-%, ชื่อพันธุ์ไม้: - สายพันธุ์หลัก: -, ประเภทงานหลัก: - ชื่อคู่ค้า: - อาหารวุ้น: -				';

    const data = [];
    const rows = [];
    data.push({
      no: 'No.',
      date_import: 'เดือน/ปี ที่นำเข้า',
      plant_code: 'รหัสพันธุ์ไม้',
      customer_name: 'ชื่อคู่ค้า',
      plant_family_main: 'สายพันธุ์หลัก',
      plant_name: 'ชื่อพันธุ์ไม้',
      main_work: 'ประเภทงานหลัก',
      type_work: 'ประเภทงาน',
      food: 'อาหารวุ้น',
      import_number: 'จำนวนนำเข้า',
      export_number_n: 'N',
      export_number_f: 'F',
      export_number_b: 'B',
      export_number_d: 'D',
      total_bottle: 'จำนวนคงเหลือขวด',
      total_plant: 'จำนวนคงเหลือต้น',
    });
    // Add Data Row
    for (let i = 0; i < 2000; i++) {
      data.push({
        no: i,
        date_import: 'Jan-22',
        plant_code: 'รหัสพันธุ์ไม้',
        customer_name: 'ชื่อคู่ค้า',
        plant_family_main: 'สายพันธุ์หลัก',
        plant_name: 'ชื่อพันธุ์ไม้',
        main_work: 'ประเภทงานหลัก',
        type_work: 'ประเภทงาน',
        food: 'อาหารวุ้น',
        import_number: 'จำนวนนำเข้า',
        export_number_n: 1000,
        export_number_f: 2000,
        export_number_b: 3000,
        export_number_d: 4000,
        total_bottle: 1000,
        total_plant: 1000,
      });
    }

    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i <= 2000 + 1; i++) {
      [
        `A${i + 1}`,
        `B${i + 1}`,
        `C${i + 1}`,
        `D${i + 1}`,
        `E${i + 1}`,
        `F${i + 1}`,
        `G${i + 1}`,
        `H${i + 1}`,
        `I${i + 1}`,
        `J${i + 1}`,
        `K${i + 1}`,
        `L${i + 1}`,
        `M${i + 1}`,
        `N${i + 1}`,
        `O${i + 1}`,
        `P${i + 1}`,
      ].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      });
    }

    // Column style
    const colsStyle = [
      { key: 'A', width: 5, align: 'right' },
      { key: 'B', width: 15, align: 'center' },
      { key: 'C', width: 15, align: 'center' },
      { key: 'D', width: 20, align: 'left' },
      { key: 'E', width: 15, align: 'left' },
      { key: 'F', width: 10, align: 'left' },
      { key: 'G', width: 15, align: 'left' },
      { key: 'H', width: 15, align: 'left' },
      { key: 'I', width: 10, align: 'left' },
      { key: 'J', width: 15, align: 'left' },
      { key: 'K', width: 10, align: 'center' },
      { key: 'L', width: 10, align: 'center' },
      { key: 'M', width: 10, align: 'center' },
      { key: 'N', width: 10, align: 'center' },
      { key: 'O', width: 15, align: 'center' },
      { key: 'P', width: 20, align: 'center' },
    ];

    // Column Row Data
    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      sheet.getColumn(column.key).alignment = {
        horizontal: 'center',
      };
    });

    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      if (column.align === 'center') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'center',
        };
      } else if (column.align === 'right') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'right',
        };
      } else {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'left',
        };
      }
    });

    // Header
    [
      'A2',
      'B2',
      'C2',
      'D2',
      'E2',
      'F2',
      'G2',
      'H2',
      'I2',
      'J2',
      'K2',
      'L2',
      'M2',
      'N2',
      'O2',
      'P2',
    ].map((cell) => {
      sheet.getCell(cell).style = {
        font: {
          bold: true,
        },
        alignment: {
          horizontal: 'center',
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    });

    sheet.getCell('A1').alignment = { horizontal: 'left' };

    // Write Excel
    const file = new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: '20.12-29.12.2022 คงคลัง',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (_err, _file) => {
          if (_err) throw _err;
          book.xlsx
            .writeFile(_file)
            .then(() => {
              resolve(_file);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
    return file;
  }

  async exportReportProduction(
    input: ExcelExportReportStockInput,
  ): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');

    const params = {
      data: input.date,
    };
    const result = [];

    sheet.mergeCells('A1:P1');
    sheet.getCell('A1').value =
      'วันที่นำเข้าเริ่มต้น: 01/01/2021, วันที่นำเข้าสิ้นสุด: 02/10/2021, รหัสพันธุ์ไม้: TBH-% ชื่อพันธุ์ไม้: - สายพันธุ์หลัก: - ประเภทงานหลัก: - ชื่อคู่ค้า: - อาหารวุ้น: - ชื่อ-นามสกุลพนักงาน: -													';

    const data = [];
    const rows = [];
    data.push({
      no: 'No.',
      employee_name: 'ชื่อ-นามสกุลพนักงาน',
      date_import: 'วัน/เดือน/ปี ที่นำเข้า',
      plant_code: 'รหัสพันธุ์ไม้',
      order_no: 'จำนวนสั่ง',
      customer_name: 'ชื่อคู่ค้า',
      plant_family_main: 'สายพันธุ์หลัก',
      main_work: 'ประเภทงานหลัก',
      type_work: 'ประเภทงาน',
      food: 'อาหารวุ้น',
      import_number: 'จำนวนนำเข้า',
      export_number_n: 'N',
      export_number_f: 'F',
      export_number_b: 'B',
      export_number_d: 'D',
      total_bottle: 'จำนวนคงเหลือ',
    });

    // Add Data Row
    for (let i = 0; i < 2000; i++) {
      data.push({
        no: i,
        employee_name: 'ชื่อ-นามสกุลพนักงาน',
        date_import: '3/12/2022',
        plant_code: 'รหัสพันธุ์ไม้',
        order_no: 100,
        customer_name: 'ชื่อคู่ค้า',
        plant_family_main: 'สายพันธุ์หลัก',
        main_work: 'ประเภทงานหลัก',
        type_work: 'ประเภทงาน',
        food: 'อาหารวุ้น',
        import_number: 'จำนวนนำเข้า',
        export_number_n: 1000,
        export_number_f: 2000,
        export_number_b: 3000,
        export_number_d: 4000,
        total_bottle: 100,
      });
    }

    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i <= 2000 + 1; i++) {
      [
        `A${i + 1}`,
        `B${i + 1}`,
        `C${i + 1}`,
        `D${i + 1}`,
        `E${i + 1}`,
        `F${i + 1}`,
        `G${i + 1}`,
        `H${i + 1}`,
        `I${i + 1}`,
        `J${i + 1}`,
        `K${i + 1}`,
        `L${i + 1}`,
        `M${i + 1}`,
        `N${i + 1}`,
        `O${i + 1}`,
        `P${i + 1}`,
      ].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      });
    }

    // Column style
    const colsStyle = [
      { key: 'A', width: 5, align: 'right' },
      { key: 'B', width: 20, align: 'center' },
      { key: 'C', width: 20, align: 'center' },
      { key: 'D', width: 15, align: 'center' },
      { key: 'E', width: 10, align: 'right' },
      { key: 'F', width: 20, align: 'left' },
      { key: 'G', width: 15, align: 'left' },
      { key: 'H', width: 15, align: 'left' },
      { key: 'I', width: 15, align: 'left' },
      { key: 'J', width: 15, align: 'left' },
      { key: 'K', width: 10, align: 'center' },
      { key: 'L', width: 10, align: 'center' },
      { key: 'M', width: 10, align: 'center' },
      { key: 'N', width: 10, align: 'center' },
      { key: 'O', width: 15, align: 'center' },
      { key: 'P', width: 15, align: 'center' },
    ];

    // Column Row Data
    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      sheet.getColumn(column.key).alignment = {
        horizontal: 'center',
      };
    });

    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      if (column.align === 'center') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'center',
        };
      } else if (column.align === 'right') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'right',
        };
      } else {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'left',
        };
      }
    });

    // Header
    [
      'A2',
      'B2',
      'C2',
      'D2',
      'E2',
      'F2',
      'G2',
      'H2',
      'I2',
      'J2',
      'K2',
      'L2',
      'M2',
      'N2',
      'O2',
      'P2',
    ].map((cell) => {
      sheet.getCell(cell).style = {
        font: {
          bold: true,
        },
        alignment: {
          horizontal: 'center',
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    });

    sheet.getCell('A1').alignment = { horizontal: 'left' };

    // Write Excel
    const file = new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: '20.12-29.12.2022 การผลิต',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (_err, _file) => {
          if (_err) throw _err;
          book.xlsx
            .writeFile(_file)
            .then(() => {
              resolve(_file);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
    return file;
  }

  async exportReportFail(input: ExcelExportReportStockInput): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');

    const params = {
      data: input.date,
    };
    const result = [];

    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value =
      'วันที่นำออกเริ่มต้น: 01/05/2022, วันที่นำออกสิ้นสุด: 05/07/2022, ชื่อ - นามสกุลพนักงาน: -';

    const data = [];
    const rows = [];
    data.push({
      no: 'No.',
      employee_name: 'ชื่อ-นามสกุลพนักงาน',
      total_break: 'จำนวนแตกหัก',
      total_mold: 'จำนวนขึ้นรา',
      total_made: 'จำนวนทำทั้งหมด',
      percentage: '% ขึ้นราเทียบกับจำนวนทำ',
    });
    // Add Data Row
    for (let i = 0; i < 2000; i++) {
      data.push({
        no: i,
        employee_name: 'ชื่อ-นามสกุลพนักงาน',
        total_break: 1000,
        total_mold: 2000,
        total_made: 3000,
        percentage: 40.33,
      });
    }

    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i <= 2000 + 1; i++) {
      [
        `A${i + 1}`,
        `B${i + 1}`,
        `C${i + 1}`,
        `D${i + 1}`,
        `E${i + 1}`,
        `F${i + 1}`,
      ].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      });
    }

    // Column style
    const colsStyle = [
      { key: 'A', width: 5, align: 'right' },
      { key: 'B', width: 20, align: 'left' },
      { key: 'C', width: 15, align: 'center' },
      { key: 'D', width: 15, align: 'center' },
      { key: 'E', width: 15, align: 'center' },
      { key: 'F', width: 25, align: 'center' },
    ];

    // Column Row Data
    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      sheet.getColumn(column.key).alignment = {
        horizontal: 'center',
      };
    });

    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      if (column.align === 'center') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'center',
        };
      } else if (column.align === 'right') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'right',
        };
      } else {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'left',
        };
      }
    });

    // Header
    ['A2', 'B2', 'C2', 'D2', 'E2', 'F2'].map((cell) => {
      sheet.getCell(cell).style = {
        font: {
          bold: true,
        },
        alignment: {
          horizontal: 'center',
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    });

    sheet.getCell('A1').alignment = { horizontal: 'left' };

    // Write Excel
    const file = new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: '20.12-29.12.2022 เสียหาย',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (_err, _file) => {
          if (_err) throw _err;
          book.xlsx
            .writeFile(_file)
            .then(() => {
              resolve(_file);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
    return file;
  }

  async exportReceipt(): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');

    const data = [];
    const rows = [];
    data.push({
      code: 'รหัสใบงาน',
      name: 'ชื่อพันธุ์ไม้',
      family_name: 'สายพันธุ์',
      customer: 'ชื่อคู่ค้า',
    });
    // Add Data Row
    const result = await this.receiptService.getReceipts(null);
    // Styles Data Row
    for (let i = 0; i < result.length; i++) {
      const rowsDB = result[i];
      data.push({
        code: rowsDB.receipt_code,
        name: rowsDB.receipt_name,
        family_name: rowsDB.plant_family_main_description,
        customer: rowsDB.customer_name,
      });
    }

    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 1; i < result.length; i++) {
      [`A${i + 1}`, `B${i + 1}`, `C${i + 1}`, `D${i + 1}`].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      });
    }

    // Column style
    const colsStyle = [
      { key: 'A', width: 20, align: 'left' },
      { key: 'B', width: 30, align: 'left' },
      { key: 'C', width: 40, align: 'left' },
      { key: 'D', width: 40, align: 'left' },
    ];

    // Column Row Data
    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      sheet.getColumn(column.key).alignment = {
        horizontal: 'center',
      };
    });

    colsStyle.forEach((column, key) => {
      sheet.getColumn(column.key).width = column.width;
      if (column.align === 'center') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'center',
        };
      } else if (column.align === 'right') {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'right',
        };
      } else {
        sheet.getColumn(column.key).alignment = {
          horizontal: 'left',
        };
      }
    });

    // Header
    ['A1', 'B1', 'C1', 'D1'].map((cell) => {
      sheet.getCell(cell).style = {
        font: {
          bold: true,
        },
        alignment: {
          horizontal: 'center',
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    });

    // Write Excel
    const file = new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'ใบงาน',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (_err, _file) => {
          if (_err) throw _err;
          book.xlsx
            .writeFile(_file)
            .then(() => {
              resolve(_file);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
    return file;
  }
}
