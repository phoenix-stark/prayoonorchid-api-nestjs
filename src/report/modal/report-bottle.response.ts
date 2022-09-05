import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReportBottleResponse {
  receipt_name: string;
  receipt_num_order: number;
  receipt_code: string;
  customer_name: string;
  plant_family_main: string;
  main_work_type: string;
  work_type: string;
  food: string;
  member_name: string;
  member_surname: string;
  total_import: number;
  import_date: string;
}
