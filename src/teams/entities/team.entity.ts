import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn({ name: 'team_id' })
  teamId!: number;

  @Column({ name: 'team_name', type: 'varchar', length: 100 })
  teamName!: string;

  @Column({ name: 'team_score', type: 'int', default: 0 })
  teamScore!: number;

  @Column({ name: 'team_leader', type: 'varchar', length: 50 })
  teamLeader!: string;

  @Column({ name: 'team_members', type: 'text', array: true, default: () => "'{}'" })
  teamMembers!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
