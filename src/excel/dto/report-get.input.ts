import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReportGetInput {
  filter: string;
  token: string;
  page: number;
  per_page: number;
}
