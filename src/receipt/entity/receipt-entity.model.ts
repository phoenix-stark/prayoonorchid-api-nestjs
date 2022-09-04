import { PlantFamilyMain } from 'src/plant-family-main/entity/plant-family-main-entity.model';
import { Entity, Column, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'receipt', synchronize: false })
export class Receipt {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  receipt_id: string;

  @Column()
  date: string;

  @Column()
  name: string;

  @Column()
  num_order: number;

  @Column()
  create_by: string;

  @Column()
  create_at: string;

  @Column()
  family_main_id: number;

  @Column()
  family_secondary_id: number;

  @Column()
  is_del: number;

  @Column()
  customer_id: string;

  @Column()
  code: string;

  @OneToOne(() => PlantFamilyMain)
  @JoinColumn()
  plantFamilyMain: PlantFamilyMain;
}
