import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'tags' })
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // prevent duplicate tag names
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
