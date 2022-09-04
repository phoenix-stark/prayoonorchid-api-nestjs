import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity({ name: 'member', synchronize: false })
export class Member {
  @PrimaryColumn()
  member_id: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  grant_id: number;

  @Column()
  create_at: string;

  @Column()
  update_at: string;

  @Column()
  create_by: string;

  @Column()
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column()
  is_block: string;
}
