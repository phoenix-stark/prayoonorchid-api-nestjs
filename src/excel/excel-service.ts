import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import moment from 'moment-timezone';
import { ReceiptService } from 'src/receipt/receipt.service';
import { FilterObject } from 'src/report/modal/filter';
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
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');

    const filter = this.getFilter(input.filter);
    sheet.mergeCells('A1:K1');
    sheet.getCell('A1').value = `วันที่นำออกเริ่มต้น: ${this.momentWrapper
      .momentDate(filter.filter[8].import_start_date.description)
      .format('DD/MM/YYYY')}, วันที่นำออกสิ้นสุด: ${this.momentWrapper
      .momentDate(filter.filter[9].import_end_date.description)
      .format('DD/MM/YYYY')}, รหัสพันธุ์ไม้: ${
      filter.filter[1].plant_code.description
    } ชื่อพันธุ์ไม้: ${
      filter.filter[0].plant_name.description
    }  สายพันธุ์หลัก: ${
      filter.filter[2].family_main.description
    } ประเภทงานหลัก: ${filter.filter[7].main_task.description} ชื่อคู่ค้า: ${
      filter.filter[5].customer.description
    } อาหารวุ้น: ${filter.filter[4].food.description} ชื่อ-นามสกุลพนักงาน: ${
      filter.filter[6].employee.description
    }`;

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
    for (let i = 0; i < result.data.length; i++) {
      const rowsDB = result.data[i];
      data.push({
        no: i + 1,
        employee_name: `${rowsDB.member_name} ${rowsDB.member_surname}`,
        date_import: this.formatDateToExcel(
          this.momentWrapper
            .momentDate(rowsDB.import_date)
            .format('YYYY-MM-DD'),
          'YYYY-MM-DD',
        ),
        plant_code: rowsDB.receipt_code,
        order_no: rowsDB.receipt_num_order,
        customer_name: rowsDB.customer_name,
        plant_family_main: rowsDB.plant_family_main,
        main_work: rowsDB.main_work_type,
        type_work: rowsDB.work_type,
        food: rowsDB.food,
        import_number: parseInt(rowsDB.total_import.toString()),
      });
    }
    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i < result.data.length + 1; i++) {
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

        sheet.getCell(`C${i + 1}`).numFmt = 'dd/mm/yyyy';
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
    ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2', 'K2'].map(
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

    sheet.getCell('A1').alignment = { horizontal: 'left' };

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

  async exportReportRemoveAll(input: ReportGetInput): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');
    const filter = this.getFilter(input.filter);
    sheet.mergeCells('A1:N1');
    sheet.getCell('A1').value = `วันที่นำออกเริ่มต้น: ${this.momentWrapper
      .momentDate(filter.filter[8].import_start_date.description)
      .format('DD/MM/YYYY')}, วันที่นำออกสิ้นสุด: ${this.momentWrapper
      .momentDate(filter.filter[9].import_end_date.description)
      .format('DD/MM/YYYY')}, รหัสพันธุ์ไม้: ${
      filter.filter[1].plant_code.description
    } ชื่อพันธุ์ไม้: ${
      filter.filter[0].plant_name.description
    }  สายพันธุ์หลัก: ${
      filter.filter[2].family_main.description
    } ประเภทงานหลัก: ${filter.filter[7].main_task.description} ชื่อคู่ค้า: ${
      filter.filter[5].customer.description
    } อาหารวุ้น: ${filter.filter[4].food.description} ชื่อ-นามสกุลพนักงาน: ${
      filter.filter[6].employee.description
    } สาเหตุการนำออก ${filter.filter[10].reason_remove_type.description}`;
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
    const result = await this.reportService.getReportRemoveAll(input);
    for (let i = 0; i < result.data.length; i++) {
      const rowsDB = result.data[i];
      data.push({
        no: i + 1,
        date_export: this.formatDateToExcel(
          this.momentWrapper
            .momentDate(rowsDB.remove_date)
            .format('YYYY-MM-DD'),
          'YYYY-MM-DD',
        ),
        date_import: this.formatDateToExcel(
          this.momentWrapper
            .momentDate(rowsDB.import_date)
            .format('YYYY-MM-DD'),
          'YYYY-MM-DD',
        ),
        plant_code: rowsDB.receipt_code,
        plant_name: rowsDB.receipt_name,
        plant_family_main: rowsDB.plant_family_main,
        customer_name: rowsDB.customer_name,
        send_to: '',
        employee_name: `${rowsDB.member_name} ${rowsDB.member_surname}`,
        main_work: rowsDB.main_work_type,
        type_work: rowsDB.work_type,
        export_number: parseInt(rowsDB.total.toString()),
        export_type: rowsDB.description,
        employee_export: `${rowsDB.create_member_name} ${rowsDB.create_member_surname}`,
      });
    }
    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i <= result.data.length + 1; i++) {
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

        sheet.getCell(`B${i + 1}`).numFmt = 'dd/mm/yyyy';
        sheet.getCell(`C${i + 1}`).numFmt = 'dd/mm/yyyy';
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

  async exportReportStock(input: ReportGetInput): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');
    const filter = this.getFilter(input.filter);

    sheet.mergeCells('A1:Q1');
    sheet.getCell('A1').value = `วันที่นำเข้าเริ่มต้น: ${this.momentWrapper
      .momentDate(filter.filter[8].import_start_date.description)
      .format('DD/MM/YYYY')}, วันที่นำเข้าสิ้นสุด: ${this.momentWrapper
      .momentDate(filter.filter[9].import_end_date.description)
      .format('DD/MM/YYYY')}, รหัสพันธุ์ไม้: ${
      filter.filter[1].plant_code.description
    } ชื่อพันธุ์ไม้: ${
      filter.filter[0].plant_name.description
    }  สายพันธุ์หลัก: ${
      filter.filter[2].family_main.description
    } ประเภทงานหลัก: ${filter.filter[7].main_task.description} ชื่อคู่ค้า: ${
      filter.filter[5].customer.description
    } อาหารวุ้น: ${filter.filter[4].food.description} ชื่อ-นามสกุลพนักงาน: ${
      filter.filter[6].employee.description
    }`;

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
      export_number_f: 'F',
      export_number_b: 'B',
      export_number_n: 'N',
      export_number_c: 'C',
      export_number_d: 'D',
      total_bottle: 'จำนวนคงเหลือขวด',
      total_plant: 'จำนวนคงเหลือต้น',
    });
    // Add Data Row
    const result = await this.reportService.getReportStock(input);
    for (let i = 0; i < result.data.length; i++) {
      const rowsDB = result.data[i];
      data.push({
        no: i + 1,
        date_import: this.formatDateToExcel(
          this.momentWrapper
            .momentDate(rowsDB.import_date)
            .format('YYYY-MM-DD'),
          'YYYY-MM-DD',
        ),
        plant_code: rowsDB.receipt_code,
        customer_name: rowsDB.customer_name,
        plant_family_main: rowsDB.plant_family_main,
        plant_name: rowsDB.receipt_name,
        main_work: rowsDB.main_work_type,
        type_work: rowsDB.work_type,
        food: rowsDB.food,
        import_number: parseInt(rowsDB.total_import.toString()),
        export_number_f: parseInt(rowsDB.remove_type_1.toString()),
        export_number_b: parseInt(rowsDB.remove_type_2.toString()),
        export_number_n: parseInt(rowsDB.remove_type_3.toString()),
        export_number_c: parseInt(rowsDB.remove_type_4.toString()),
        export_number_d: parseInt(rowsDB.export.toString()),
        total_bottle: parseInt(rowsDB.summary.toString()),
        total_plant: 0,
      });
    }

    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i <= result.data.length + 1; i++) {
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
        `Q${i + 1}`,
      ].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
        sheet.getCell(`B${i + 1}`).numFmt = 'mm-yyyy';
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
      { key: 'J', width: 15, align: 'center' },
      { key: 'K', width: 10, align: 'center' },
      { key: 'L', width: 10, align: 'center' },
      { key: 'M', width: 10, align: 'center' },
      { key: 'N', width: 10, align: 'center' },
      { key: 'O', width: 15, align: 'center' },
      { key: 'P', width: 20, align: 'center' },
      { key: 'Q', width: 20, align: 'center' },
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
      'Q2',
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

  async exportReportProduction(input: ReportGetInput): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');
    const filter = this.getFilter(input.filter);
    sheet.mergeCells('A1:Q1');
    sheet.getCell('A1').value = `วันที่นำเข้าเริ่มต้น: ${this.momentWrapper
      .momentDate(filter.filter[8].import_start_date.description)
      .format('DD/MM/YYYY')}, วันที่นำเข้าสิ้นสุด: ${this.momentWrapper
      .momentDate(filter.filter[9].import_end_date.description)
      .format('DD/MM/YYYY')}, รหัสพันธุ์ไม้: ${
      filter.filter[1].plant_code.description
    } ชื่อพันธุ์ไม้: ${
      filter.filter[0].plant_name.description
    }  สายพันธุ์หลัก: ${
      filter.filter[2].family_main.description
    } ประเภทงานหลัก: ${filter.filter[7].main_task.description} ชื่อคู่ค้า: ${
      filter.filter[5].customer.description
    } อาหารวุ้น: ${filter.filter[4].food.description} ชื่อ-นามสกุลพนักงาน: ${
      filter.filter[6].employee.description
    }`;

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
      export_number_f: 'F',
      export_number_b: 'B',
      export_number_n: 'N',
      export_number_c: 'C',
      export_number_d: 'D',
      total_bottle: 'จำนวนคงเหลือ',
    });

    // Add Data Row
    const result = await this.reportService.getReportProduction(input);
    for (let i = 0; i < result.data.length; i++) {
      const rowsDB = result.data[i];
      data.push({
        no: i + 1,
        employee_name: `${rowsDB.member_name} ${rowsDB.member_surname}`,
        date_import: this.formatDateToExcel(
          this.momentWrapper
            .momentDate(rowsDB.import_date)
            .format('YYYY-MM-DD'),
          'YYYY-MM-DD',
        ),
        plant_code: rowsDB.receipt_code,
        order_no: rowsDB.receipt_num_order,
        customer_name: rowsDB.customer_name,
        plant_family_main: rowsDB.plant_family_main,
        main_work: rowsDB.main_work_type,
        type_work: rowsDB.work_type,
        food: rowsDB.food,
        import_number: parseInt(rowsDB.total_import.toString()),
        export_number_f: parseInt(rowsDB.remove_type_1.toString()),
        export_number_b: parseInt(rowsDB.remove_type_2.toString()),
        export_number_n: parseInt(rowsDB.remove_type_3.toString()),
        export_number_c: parseInt(rowsDB.remove_type_4.toString()),
        export_number_d: parseInt(rowsDB.export.toString()),
        total_bottle: parseInt(rowsDB.summary.toString()),
      });
    }

    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i <= result.data.length + 1; i++) {
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
        `Q${i + 1}`,
      ].map((cell) => {
        sheet.getCell(cell).style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
        sheet.getCell(`C${i + 1}`).numFmt = 'dd/mm/yyyy';
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
      { key: 'Q', width: 15, align: 'center' },
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
      'Q2',
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

  async exportReportFail(input: ReportGetInput): Promise<any> {
    const book = new Workbook();
    const sheet = book.addWorksheet('Sheet1');
    const filter = this.getFilter(input.filter);
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `วันที่นำออกเริ่มต้น: ${this.momentWrapper
      .momentDate(filter.filter[8].import_start_date.description)
      .format('DD/MM/YYYY')}, วันที่นำออกสิ้นสุด: ${this.momentWrapper
      .momentDate(filter.filter[9].import_end_date.description)
      .format('DD/MM/YYYY')}, รหัสพันธุ์ไม้: ${
      filter.filter[1].plant_code.description
    } ชื่อพันธุ์ไม้: ${
      filter.filter[0].plant_name.description
    }  สายพันธุ์หลัก: ${
      filter.filter[2].family_main.description
    } ประเภทงานหลัก: ${filter.filter[7].main_task.description} ชื่อคู่ค้า: ${
      filter.filter[5].customer.description
    } อาหารวุ้น: ${filter.filter[4].food.description} ชื่อ-นามสกุลพนักงาน: ${
      filter.filter[6].employee.description
    }`;

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
    const result = await this.reportService.getReportPlantFail(input);
    const resultAll = await this.reportService.getReportPlantFailAll(input);
    if (resultAll) {
      data.push({
        no: 0,
        employee_name: `${resultAll.member_name}`,
        total_break: parseInt(resultAll.remove_type_1.toString()),
        total_mold: parseInt(resultAll.remove_type_2.toString()),
        total_made: parseInt(resultAll.total_import.toString()),
        percentage: parseFloat(
          parseFloat(resultAll.persentage.toString()).toFixed(2),
        ),
      });
    }
    for (let i = 0; i < result.data.length; i++) {
      const rowsDB = result.data[i];
      data.push({
        no: i + 1,
        employee_name: `${rowsDB.member_name} ${rowsDB.member_surname}`,
        total_break: parseInt(rowsDB.remove_type_1.toString()),
        total_mold: parseInt(rowsDB.remove_type_2.toString()),
        total_made: parseInt(rowsDB.total_import.toString()),
        percentage: parseFloat(
          parseFloat(rowsDB.persentage.toString()).toFixed(2),
        ),
      });
    }

    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    sheet.addRows(rows);

    // Styles Data Row
    for (let i = 2; i <= result.data.length + 1; i++) {
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

  getFilter = (jsonStr: string) => {
    const jsonObj = JSON.parse(jsonStr);
    const reportFilter = {
      filter: [
        {
          plant_name: {
            id: jsonObj[0].value.data.id,
            description: jsonObj[0].value.data.description,
            is_match_all: jsonObj[0].value.is_match_all,
          },
        },
        {
          plant_code: {
            id: jsonObj[1].value.data.id,
            description: jsonObj[1].value.data.description,
            is_match_all: jsonObj[1].value.is_match_all,
          },
        },
        {
          family_main: {
            id: jsonObj[2].value.data.id,
            description: jsonObj[2].value.data.description,
            is_match_all: jsonObj[2].value.is_match_all,
          },
        },
        {
          work_type: {
            id: jsonObj[3].value.data.id,
            description: jsonObj[3].value.data.description,
            is_match_all: jsonObj[3].value.is_match_all,
          },
        },
        {
          food: {
            id: jsonObj[4].value.data.id,
            description: jsonObj[4].value.data.description,
            is_match_all: jsonObj[4].value.is_match_all,
          },
        },
        {
          customer: {
            id: jsonObj[5].value.data.id,
            description: jsonObj[5].value.data.description,
            is_match_all: jsonObj[5].value.is_match_all,
          },
        },
        {
          employee: {
            id: jsonObj[6].value.data.id,
            description: jsonObj[6].value.data.description,
            is_match_all: jsonObj[6].value.is_match_all,
          },
        },
        {
          main_task: {
            id: jsonObj[7].value.data.id,
            description: jsonObj[7].value.data.description,
            is_match_all: jsonObj[7].value.is_match_all,
          },
        },
        {
          import_start_date: {
            id: jsonObj[8].value.data.id,
            description: jsonObj[8].value.data.description,
            is_match_all: jsonObj[8].value.is_match_all,
          },
        },
        {
          import_end_date: {
            id: jsonObj[9].value.data.id,
            description: jsonObj[9].value.data.description,
            is_match_all: jsonObj[9].value.is_match_all,
          },
        },
        {
          reason_remove_type: {
            id: jsonObj.length > 10 ? jsonObj[10].value.data.id : '',
            description:
              jsonObj.length > 10 ? jsonObj[10].value.data.description : '',
            is_match_all:
              jsonObj.length > 10 ? jsonObj[10].value.is_match_all : false,
          },
        },
      ],
    };
    return reportFilter as FilterObject;
  };

  formatDateToExcel(date: string, format: string): Date {
    return new Date(
      this.momentWrapper.momentDateFromFormat(date, format).format(format),
    );
  }
}
