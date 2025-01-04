import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'food_plant', synchronize: false })
export class FoodPlant {
  @PrimaryGeneratedColumn()
  food_id: number;

  @Column()
  description: string;

  @Column()
  create_at: string;

  @Column()
  create_by: string;
}
