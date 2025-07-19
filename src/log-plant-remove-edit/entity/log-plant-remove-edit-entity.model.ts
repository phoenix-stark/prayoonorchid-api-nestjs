import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'log_plant_remove_edit', synchronize: true })
export class LogPlantRemoveEdit {
  @PrimaryGeneratedColumn()
  log_plant_import_edit_id: number;

  @Index()
  @Column()
  barcode: string;

  @Column()
  edit_at: string;

  @Column()
  edit_by: string;

  @Column({ type: 'text' })
  message: string;
}
