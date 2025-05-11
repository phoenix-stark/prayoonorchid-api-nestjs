export class LogImportUpdateAllInput {
  token: string;
  update_import_date: string;
  update_food_id: string;
  update_work_type_id: number;
  update_receipt_id: string;
  update_main_work_type_id: number;
  barcodes?: any[];

  import_start: string;
  import_end: string;
  main_work_type_desc: string;
  work_type_id: string;
  employee_id: string;
  receipt_code: string;
  receipt_code_is_match_all: boolean;
  receipt_name: string;
  receipt_name_is_match_all: boolean;
  food_plant_desc: string;
  food_plant_desc_is_match_all: boolean;
  family_main_desc: string;
  family_main_desc_is_match_all: boolean;
  customer_id: string;
  customer_id_is_match_all: boolean;
  time_per_day: string;
}
