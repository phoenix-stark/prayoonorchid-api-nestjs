import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReceiptGetInput {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  per_page: number;
}
