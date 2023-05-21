export class LogImportCreateInput {
  token: string;
  import_date: string;
  barcode: number;
  food_id: string;
  work_type_id: string;
  reciept_id: string;
  reciept_code?: string;
  main_work_type_id: number;
  time_per_day: string;
}
