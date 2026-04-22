# Splitly API

Splitly 점수판 Flutter 앱의 백엔드. NestJS + TypeORM + PostgreSQL로 단순 CRUD와 랭킹 계산을 제공합니다.

- 프론트엔드 레포: [shinseunguk/Splitly](https://github.com/shinseunguk/Splitly)
- API 프리픽스: `/api/v1/admin`

## 요구 사항

- Node.js 20+
- Docker / Docker Compose v2
- (선택) PostgreSQL 16 — 로컬에 직접 설치할 경우

## 빠른 시작 (Docker)

```bash
# 1. 환경변수 준비
cp .env.example .env

# 2. 컨테이너 기동 (app + postgres)
docker compose up -d --build

# 3. 헬스체크
curl -sS http://localhost:3000/api/v1/admin/health
```

## 로컬 개발 (app은 호스트에서, DB만 Docker)

```bash
cp .env.example .env
# .env에서 DB_HOST=localhost 로 수정

docker compose up -d postgres   # DB만 컨테이너로
npm install
npm run start:dev
```

## 환경 변수 (.env)

| 변수 | 기본값 | 설명 |
|---|---|---|
| `APP_PORT` | `3000` | NestJS 서버 포트 |
| `NODE_ENV` | `development` | `production`이면 synchronize 강제 OFF |
| `DB_HOST` | `postgres` | Docker Compose 내부에서는 `postgres`, 호스트 개발 시 `localhost` |
| `DB_PORT` | `5432` | |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `splitly` / `splitly` / `splitly` | |
| `TYPEORM_SYNC` | `true` | 개발용. non-prod에서만 적용 |
| `CORS_ORIGINS` | `http://localhost:8080,http://127.0.0.1:8080` | 콤마 구분. `*` 포함 시 모든 origin 허용 |

## API 엔드포인트

Base: `http://localhost:3000/api/v1/admin`

| Method | Path | 설명 | Status |
|---|---|---|---|
| GET | `/health` | 헬스체크 (DB ping) | 200 |
| GET | `/scores/` (trailing slash) | 팀 목록 — `teamRank`는 항상 값이 있음 | 200 |
| GET | `/scores` | 점수 목록 — 점수 0인 팀의 `teamRank`는 `null` | 200 |
| POST | `/teams` | 팀 생성 | 201 |
| PUT | `/teams/:teamId` | 팀 수정 | 200 |
| DELETE | `/teams/:teamId` | 팀 삭제 | 204 |
| POST | `/scores` | 점수 누적 (`score` 음수 허용) | **201** |
| PUT | `/scores/:teamId` | 점수 절대값 설정 (`score` ≥ 0) | 200 |
| DELETE | `/scores` | 모든 팀 점수 0 초기화 | 200 |

### curl 예시

```bash
# 팀 생성
curl -sS -X POST http://localhost:3000/api/v1/admin/teams \
  -H 'Content-Type: application/json' \
  -d '{"teamName":"A팀","teamLeader":"홍길동","teamMembers":["철수","영희"]}' -i

# 팀 목록 (trailing slash)
curl -sS http://localhost:3000/api/v1/admin/scores/

# 점수 목록
curl -sS http://localhost:3000/api/v1/admin/scores

# 점수 누적
curl -sS -X POST http://localhost:3000/api/v1/admin/scores \
  -H 'Content-Type: application/json' -d '{"teamId":1,"score":10}' -i

# 점수 절대값 설정
curl -sS -X PUT http://localhost:3000/api/v1/admin/scores/1 \
  -H 'Content-Type: application/json' -d '{"score":50}'

# 전체 초기화
curl -sS -X DELETE http://localhost:3000/api/v1/admin/scores

# 팀 수정/삭제
curl -sS -X PUT http://localhost:3000/api/v1/admin/teams/1 \
  -H 'Content-Type: application/json' \
  -d '{"teamId":"1","teamName":"A팀v2","teamLeader":"김","teamMembers":["철수"]}'
curl -sS -X DELETE http://localhost:3000/api/v1/admin/teams/1 -i
```

## 프론트엔드 연동 (로컬 테스트)

프론트 데이터 소스의 baseURL이 Cloud Run(`https://incross-workshop-337441565570.asia-northeast3.run.app`)에 하드코딩되어 있습니다. 로컬 서버로 전환하려면 다음 8곳을 교체:

- `lib/dataSource/team_data_source.dart` (L11, L34, L59, L80)
- `lib/dataSource/team_score_data_source.dart` (L9, L23, L41, L60)

플랫폼별 baseURL:

| 플랫폼 | URL |
|---|---|
| iOS 시뮬레이터 | `http://localhost:3000` |
| Android 에뮬레이터 | `http://10.0.2.2:3000` |
| Flutter Web | `http://localhost:3000` + 서버 `CORS_ORIGINS`에 해당 dev 포트 추가 |
| 실기기 | `http://<호스트 IP>:3000` + 같은 네트워크 |

Flutter Web은 CORS가 중요하므로 `CORS_ORIGINS=*`를 개발 중에만 사용해도 무방합니다.

## 테스트

e2e 테스트는 실제 PostgreSQL 연결이 필요합니다.

```bash
docker compose up -d postgres
cp .env.example .env
npm install
npm run test:e2e
```

테스트는 `TRUNCATE teams` 로 매 케이스마다 초기화하므로, 개발 데이터를 보호하고 싶다면 `.env`의 `DB_NAME`을 `splitly_test` 등 별도 이름으로 설정하세요.

## 랭킹 규칙

표준 경쟁 랭킹(Standard Competition Ranking, "1-2-2-4"):
- 점수 내림차순
- 동점 → 같은 rank
- 동점 인원만큼 다음 rank는 건너뜀
- `/scores` (no slash) 엔드포인트에서는 점수 0인 팀은 `teamRank = null`

## 배포

현재 저장소에는 배포 설정이 포함되어 있지 않습니다. 기존 운영 엔드포인트(`incross-workshop-337441565570.asia-northeast3.run.app`)는 별도로 배포된 인스턴스이며, 로컬 검증 후 필요 시 Cloud Run 등으로 전환 예정.
