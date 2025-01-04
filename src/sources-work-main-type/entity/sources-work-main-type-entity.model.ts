import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sources_work_main_type', synchronize: false })
export class SourcesWorkMainType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;
}
