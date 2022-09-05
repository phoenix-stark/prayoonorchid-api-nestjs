import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReportGetInput {
  filter: string;
  token: string;
  page: number;
  per_page: number;
}

export class ReportGetFilter {
  value: ReportGetFilterValue;
}

export class ReportGetFilterValue {
  data: ReportGetFilterData;
}

export class ReportGetFilterData {
  id: string;
  description: string;
}
