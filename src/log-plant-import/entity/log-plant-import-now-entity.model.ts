import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'log_plant_import_now', synchronize: false })
export class LogPlantImportNow {
  @PrimaryColumn()
  log_plant_import_id: number;

  @Index()
  @Column()
  barcode: string;

  @Column()
  create_at: string;

  @Column()
  create_by: string;

  @Column()
  member_made: string;

  @Column()
  food_plant_id: string;

  @Column()
  work_type_id: number;

  @Column()
  import_date: string;

  @Column()
  receipt_id: string;

  @Column()
  main_work_type_id: number;

  @Column()
  time_per_day: number;
}
