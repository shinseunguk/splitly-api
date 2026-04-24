import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitGameState1714000001000 implements MigrationInterface {
  name = 'InitGameState1714000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "game_state" (
        "id" INT PRIMARY KEY,
        "is_ended" BOOLEAN NOT NULL DEFAULT false,
        "ended_at" TIMESTAMPTZ,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      INSERT INTO "game_state" ("id", "is_ended", "ended_at")
      VALUES (1, false, NULL)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "game_state"`);
  }
}
