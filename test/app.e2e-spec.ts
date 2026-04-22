import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

const API = '/api/v1/admin';

describe('Splitly API 계약 (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    (app as NestExpressApplication).set('strict routing', true);
    app.setGlobalPrefix('api/v1/admin');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "teams" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /teams', () => {
    it('201과 정확한 성공 메시지를 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/teams`)
        .send({ teamName: 'A팀', teamLeader: '홍길동', teamMembers: ['철수', '영희'] })
        .expect(201);
      expect(res.body.message).toBe('팀이 성공적으로 생성되었습니다.');
      expect(typeof res.body.teamId).toBe('number');
    });

    it('필수 필드 누락 시 400', async () => {
      await request(app.getHttpServer())
        .post(`${API}/teams`)
        .send({ teamLeader: '리더', teamMembers: [] })
        .expect(400);
    });
  });

  describe('PUT /teams/:teamId', () => {
    it('200과 정확한 수정 메시지를 반환한다 (body.teamId 문자열 허용)', async () => {
      const created = await request(app.getHttpServer())
        .post(`${API}/teams`)
        .send({ teamName: 'B팀', teamLeader: '리더', teamMembers: ['a'] });
      const id = created.body.teamId as number;

      const res = await request(app.getHttpServer())
        .put(`${API}/teams/${id}`)
        .send({ teamId: String(id), teamName: 'B팀v2', teamLeader: '새리더', teamMembers: ['b'] })
        .expect(200);
      expect(res.body.message).toBe('팀이 성공적으로 수정되었습니다.');
      expect(res.body.teamId).toBe(id);
    });
  });

  describe('DELETE /teams/:teamId', () => {
    it('204 no content를 반환한다', async () => {
      const created = await request(app.getHttpServer())
        .post(`${API}/teams`)
        .send({ teamName: 'C팀', teamLeader: '리더', teamMembers: [] });
      const id = created.body.teamId as number;

      await request(app.getHttpServer()).delete(`${API}/teams/${id}`).expect(204);
    });
  });

  describe('GET /scores/ vs /scores (trailing slash 분리)', () => {
    it('/scores/ 는 teamRank가 항상 부여된다', async () => {
      await seedTeam(app, { teamName: 'T1', teamLeader: 'L1', teamMembers: [] });
      const res = await request(app.getHttpServer()).get(`${API}/scores/`).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].teamRank).toBe(1);
    });

    it('/scores 는 점수 0 팀의 teamRank가 null', async () => {
      await seedTeam(app, { teamName: 'T1', teamLeader: 'L1', teamMembers: [] });
      const res = await request(app.getHttpServer()).get(`${API}/scores`).expect(200);
      expect(res.body[0].teamRank).toBeNull();
    });
  });

  describe('POST /scores (누적)', () => {
    it('반드시 201을 반환한다 (프론트 엄격 체크)', async () => {
      const created = await seedTeam(app, { teamName: 'D팀', teamLeader: 'L', teamMembers: [] });
      await request(app.getHttpServer())
        .post(`${API}/scores`)
        .send({ teamId: created.teamId, score: 10 })
        .expect(201);
    });

    it('점수가 누적되고 전체 목록을 반환한다', async () => {
      const t1 = await seedTeam(app, { teamName: 'T1', teamLeader: 'L', teamMembers: [] });
      const t2 = await seedTeam(app, { teamName: 'T2', teamLeader: 'L', teamMembers: [] });
      await request(app.getHttpServer())
        .post(`${API}/scores`)
        .send({ teamId: t1.teamId, score: 30 });
      const res = await request(app.getHttpServer())
        .post(`${API}/scores`)
        .send({ teamId: t1.teamId, score: 5 });
      expect(res.body).toHaveLength(2);
      const t1Row = res.body.find((r: { teamId: number }) => r.teamId === t1.teamId);
      const t2Row = res.body.find((r: { teamId: number }) => r.teamId === t2.teamId);
      expect(t1Row.teamScore).toBe(35);
      expect(t1Row.teamRank).toBe(1);
      expect(t2Row.teamRank).toBeNull(); // 0점이므로 null
    });

    it('음수도 허용된다 (프론트 차감 버튼)', async () => {
      const t = await seedTeam(app, { teamName: 'T', teamLeader: 'L', teamMembers: [] });
      await request(app.getHttpServer())
        .post(`${API}/scores`)
        .send({ teamId: t.teamId, score: 10 });
      const res = await request(app.getHttpServer())
        .post(`${API}/scores`)
        .send({ teamId: t.teamId, score: -3 });
      expect(res.body[0].teamScore).toBe(7);
    });
  });

  describe('PUT /scores/:teamId (절대값 설정)', () => {
    it('200을 반환하고 절대값으로 설정된다', async () => {
      const t = await seedTeam(app, { teamName: 'T', teamLeader: 'L', teamMembers: [] });
      await request(app.getHttpServer())
        .post(`${API}/scores`)
        .send({ teamId: t.teamId, score: 100 });
      const res = await request(app.getHttpServer())
        .put(`${API}/scores/${t.teamId}`)
        .send({ score: 20 })
        .expect(200);
      expect(res.body[0].teamScore).toBe(20);
    });

    it('음수 점수는 400', async () => {
      const t = await seedTeam(app, { teamName: 'T', teamLeader: 'L', teamMembers: [] });
      await request(app.getHttpServer())
        .put(`${API}/scores/${t.teamId}`)
        .send({ score: -1 })
        .expect(400);
    });
  });

  describe('DELETE /scores (전체 초기화)', () => {
    it('200을 반환하고 모든 팀 점수가 0으로 초기화된다', async () => {
      const t1 = await seedTeam(app, { teamName: 'T1', teamLeader: 'L', teamMembers: [] });
      const t2 = await seedTeam(app, { teamName: 'T2', teamLeader: 'L', teamMembers: [] });
      await request(app.getHttpServer())
        .post(`${API}/scores`)
        .send({ teamId: t1.teamId, score: 50 });

      const res = await request(app.getHttpServer())
        .delete(`${API}/scores`)
        .expect(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.every((r: { teamScore: number }) => r.teamScore === 0)).toBe(true);
      void t2;
    });
  });

  describe('표준 경쟁 랭킹 (동점 처리)', () => {
    it('동점은 같은 rank, 다음은 건너뛴다 (1-2-2-4)', async () => {
      const t1 = await seedTeam(app, { teamName: 'T1', teamLeader: 'L', teamMembers: [] });
      const t2 = await seedTeam(app, { teamName: 'T2', teamLeader: 'L', teamMembers: [] });
      const t3 = await seedTeam(app, { teamName: 'T3', teamLeader: 'L', teamMembers: [] });
      const t4 = await seedTeam(app, { teamName: 'T4', teamLeader: 'L', teamMembers: [] });

      await request(app.getHttpServer()).post(`${API}/scores`).send({ teamId: t1.teamId, score: 100 });
      await request(app.getHttpServer()).post(`${API}/scores`).send({ teamId: t2.teamId, score: 100 });
      await request(app.getHttpServer()).post(`${API}/scores`).send({ teamId: t3.teamId, score: 90 });
      await request(app.getHttpServer()).post(`${API}/scores`).send({ teamId: t4.teamId, score: 80 });

      const res = await request(app.getHttpServer()).get(`${API}/scores/`).expect(200);
      const ranks = res.body.reduce(
        (acc: Record<string, number>, row: { teamName: string; teamRank: number }) => {
          acc[row.teamName] = row.teamRank;
          return acc;
        },
        {},
      );
      expect(ranks.T1).toBe(1);
      expect(ranks.T2).toBe(1);
      expect(ranks.T3).toBe(3);
      expect(ranks.T4).toBe(4);
    });
  });
});

async function seedTeam(
  app: INestApplication,
  payload: { teamName: string; teamLeader: string; teamMembers: string[] },
): Promise<{ teamId: number }> {
  const res = await request(app.getHttpServer()).post(`${API}/teams`).send(payload);
  return { teamId: res.body.teamId };
}
