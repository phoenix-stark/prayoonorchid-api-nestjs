import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sources_plant_remove_type', synchronize: false })
export class SourcesPlantRemoveType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  code: string;
}
