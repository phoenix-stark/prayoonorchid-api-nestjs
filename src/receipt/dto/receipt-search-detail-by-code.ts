export class ReceiptSearchDetailByCodeInput {
  token: string;
  code: string;
  is_match_all_code: string;
  name: string;
  is_match_all_name: string;
  family_main: string;
  is_match_all_family_main: string;
  customer: string;
  is_match_all_customer: string;
  page: number;
  per_page: number;
}
