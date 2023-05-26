import { IsNotEmpty, IsString } from 'class-validator';

export class ReceiptDeleteInput {
  @IsString()
  @IsNotEmpty()
  receipt_id: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
