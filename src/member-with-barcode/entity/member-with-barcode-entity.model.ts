import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'member_with_barcode', synchronize: false })
export class MemberWithBarcode {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column()
  member_id: string;

  @Column()
  barcode_start: number;

  @Column()
  barcode_end: number;

  @Column()
  create_at: string;

  @Column()
  create_by: string;
}
