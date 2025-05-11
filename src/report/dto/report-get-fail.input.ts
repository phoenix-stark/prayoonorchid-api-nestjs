export class ReportGetFailInput {
  page: number;
  per_page: number;
  receipt_code_desc: string;
  receipt_code_is_match_all: boolean;
  receipt_name_desc: string;
  receipt_name_is_match_all: boolean;
  import_start_date: string;
  import_end_date: string;
  work_main_types: any;
  work_type_id: string;
  food_plant_desc: string;
  food_plant_is_match_all: boolean;
  employee_id: string;
  family_main_desc: string;
  family_main_is_match_all: boolean;
  customer_id_desc: string;
  customer_id_is_match_all: boolean;
  customer_name_desc: string;
  employee_name?: string;
  employee_surname?: string;
}
