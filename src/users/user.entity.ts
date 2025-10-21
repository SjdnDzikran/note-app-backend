import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'users' })
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  refreshTokenHash?: string | null;
}
