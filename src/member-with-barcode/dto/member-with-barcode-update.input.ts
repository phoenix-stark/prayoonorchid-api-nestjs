export class MemberWithBarcodeUpdateInput {
  token: string;
  member_id: string;
  prev_barcode_start: number;
  prev_barcode_end: number;
  new_barcode_start: number;
  new_barcode_end: number;
}
