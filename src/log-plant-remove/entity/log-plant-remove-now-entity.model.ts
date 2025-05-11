import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'log_plant_remove_now', synchronize: false })
export class LogPlantRemoveNow {
  @PrimaryColumn()
  log_plant_import_id: number;

  @Column()
  barcode: string;

  @Column()
  create_at: string;

  @Column()
  create_by: string;

  @Column()
  member_made: string;

  @Column()
  plant_remove_type_id: number;

  @Column()
  remove_date: string;

  @Column()
  receipt_id: string;

  @Column()
  remark: string;

  @Column()
  time_per_day: number;
}
