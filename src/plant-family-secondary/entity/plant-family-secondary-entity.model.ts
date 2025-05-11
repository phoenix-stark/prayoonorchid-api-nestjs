import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plant_family_secondary', synchronize: false })
export class PlantFamilySecondary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;
}
