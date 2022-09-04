import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sources_work_type', synchronize: false })
export class SourcesWorkType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;
}
