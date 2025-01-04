import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sources_grant', synchronize: false })
export class SourcesGrant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;
}
