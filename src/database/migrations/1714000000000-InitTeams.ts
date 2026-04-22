import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTeams1714000000000 implements MigrationInterface {
  name = 'InitTeams1714000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "team_id" SERIAL PRIMARY KEY,
        "team_name" VARCHAR(100) NOT NULL,
        "team_score" INT NOT NULL DEFAULT 0,
        "team_leader" VARCHAR(50) NOT NULL,
        "team_members" TEXT[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "teams"`);
  }
}
