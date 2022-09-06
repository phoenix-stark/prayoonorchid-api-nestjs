import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReportPlantFailResponse {
  total: number;
  data: ReportPlantFailData[];
}

export class ReportPlantFailData {
  member_name: string;
  member_surname: string;
  total_import: number;
  remove_type_1: number;
  remove_type_2: number;
  persentage: number;
}
