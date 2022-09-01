import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plant_family_main', synchronize: false })
export class PlantFamilyMain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;
}
