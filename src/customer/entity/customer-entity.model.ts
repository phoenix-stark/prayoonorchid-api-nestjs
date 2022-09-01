import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'customer', synchronize: false })
export class Customer {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  customer_id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  is_del: number;

  @Column()
  update_at: string;

  @Column()
  create_at: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;
}
