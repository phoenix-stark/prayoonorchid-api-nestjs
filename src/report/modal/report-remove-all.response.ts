import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReportRemoveAllResponse {
  total: number;
  data: ReportRemoveAllData[];
}

export class ReportRemoveAllData {
  receipt_code: string;
  receipt_name: string;
  customer_name: string;
  plant_family_main: string;
  main_work_type: string;
  work_type: string;
  member_name: string;
  member_surname: string;
  create_member_name: string;
  create_member_surname: string;
  description: string;
  import_date: string;
  remove_date: string;
  total: number;
}
