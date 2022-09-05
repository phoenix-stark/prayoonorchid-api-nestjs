import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReportProductionResponse {
  member_name: string;
  member_surname: string;
  receipt_num_order: string;
  receipt_code: string;
  receipt_name: string;
  customer_name: string;
  plant_family_main: string;
  main_work_type: string;
  work_type: string;
  food: string;
  import_date: string;
  total_import: number;
  remove_type_1: number;
  remove_type_2: number;
  remove_type_3: number;
  remove_type_4: number;
  export: number;
  summary: number;
}
