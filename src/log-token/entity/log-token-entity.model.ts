import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'log_token', synchronize: false })
export class LogToken {
  @PrimaryColumn()
  log_id: number;

  @Column()
  member_id: string;

  @Column({ type: 'text' })
  token: string;

  @Column()
  create_at: string;

  @Column()
  update_at: string;
}
