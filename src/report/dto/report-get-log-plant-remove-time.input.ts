export class ReportGetLogPlantRemoveTimeInput {
  page: number;
  per_page: number;
  remove_start: string;
  remove_end: string;
  main_work_type_desc: string;
  work_type_id: string;
  employee_id: string;
  food_plant_desc: string;
  food_plant_desc_is_match_all: boolean;
  customer_id: string;
  customer_id_is_match_all: boolean;
  plant_remove_type_id: string;
}
