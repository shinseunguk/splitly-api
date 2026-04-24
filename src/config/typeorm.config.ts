import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadDotenv } from 'dotenv';
import { Team } from '../teams/entities/team.entity';
import { GameState } from '../game-state/entities/game-state.entity';
import { InitTeams1714000000000 } from '../database/migrations/1714000000000-InitTeams';
import { InitGameState1714000001000 } from '../database/migrations/1714000001000-InitGameState';

loadDotenv();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'splitly',
  password: process.env.DB_PASSWORD ?? 'splitly',
  database: process.env.DB_NAME ?? 'splitly',
  entities: [Team, GameState],
  migrations: [InitTeams1714000000000, InitGameState1714000001000],
  synchronize: false,
});
