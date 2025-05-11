export class LogImportCreateInput {
  token: string;
  import_date: string;
  barcode: number;
  food_description: string;
  work_type_description: string;
  reciept_id: string;
  reciept_code?: string;
  main_work_type_id: number;
  time_per_day: string;
  member_id: string;
}
