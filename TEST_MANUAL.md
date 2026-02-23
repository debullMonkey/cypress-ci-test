# 테스트 실행 매뉴얼

## 목차
1. [프로젝트 구조](#1-프로젝트-구조)
2. [사전 요구사항](#2-사전-요구사항)
3. [Docker 서버 실행](#3-docker-서버-실행)
4. [Cypress 설치 및 실행](#4-cypress-설치-및-실행)
5. [GitHub Actions 연동](#5-github-actions-연동)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 프로젝트 구조

```
practice/
├── backend/                        # Spring Boot (WAR 패키징)
│   ├── src/main/java/com/example/
│   │   ├── PracticeApplication.java
│   │   ├── ServletInitializer.java     ← WAR 배포 진입점
│   │   └── controller/
│   │       ├── HealthController.java   ← GET /api/health
│   │       └── ItemController.java     ← GET /api/items
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── Dockerfile                  ← Multi-stage: Maven 빌드 → Tomcat
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── nginx.conf                  ← /api/* → Tomcat 프록시
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile                  ← Multi-stage: Node 빌드 → Nginx
│
├── docker-compose.yml              # 5개 환경 (env1 ~ env5)
│
├── cypress/
│   └── e2e/
│       ├── env1.cy.js              ← localhost:4001 테스트
│       ├── env2.cy.js              ← localhost:4002 테스트
│       ├── env3.cy.js              ← localhost:4003 테스트
│       ├── env4.cy.js              ← localhost:4004 테스트
│       └── env5.cy.js              ← localhost:4005 테스트
├── cypress.config.js
├── package.json                    # Cypress 의존성
│
└── .github/
    └── workflows/
        └── ci.yml                  # GitHub Actions 워크플로우
```

### 포트 구성

| 환경 | React (Nginx) | Tomcat (Spring WAR) | APP_ENV |
|------|:-------------:|:-------------------:|---------|
| env1 | :4001         | :8081               | env1    |
| env2 | :4002         | :8082               | env2    |
| env3 | :4003         | :8083               | env3    |
| env4 | :4004         | :8084               | env4    |
| env5 | :4005         | :8085               | env5    |

### 요청 흐름

```
브라우저 → Nginx(:4001) → /api/* 프록시 → Tomcat(:8081)
                                           Spring Boot WAR
```

---

## 2. 사전 요구사항

| 도구 | 버전 | 확인 명령어 |
|------|------|-------------|
| Docker Desktop | 20.x 이상 | `docker --version` |
| Docker Compose | v2.x 이상 | `docker compose version` |
| Node.js | 18.x 이상 | `node --version` |
| npm | 9.x 이상 | `npm --version` |

> **Java/Maven 불필요** — Docker multi-stage 빌드로 컨테이너 내부에서 처리됩니다.

---

## 3. Docker 서버 실행

### 3-1. 전체 5개 환경 한 번에 실행

```bash
cd C:/Users/HOME/Desktop/practice

# 이미지 빌드 + 컨테이너 실행 (첫 실행 시 Maven 빌드로 5~10분 소요)
docker compose up -d
```

> **첫 실행 시 시간이 걸리는 이유**
> - Stage 1: Maven이 Spring Boot 의존성 다운로드 + WAR 빌드
> - Stage 2: npm이 React 의존성 설치 + Vite 빌드
> - 이후 실행부터는 Docker 레이어 캐시로 빠르게 실행됩니다.

### 3-2. 컨테이너 상태 확인

```bash
docker compose ps
```

정상 상태 예시:
```
NAME              STATUS          PORTS
backend-env1      Up              0.0.0.0:8081->8080/tcp
frontend-env1     Up              0.0.0.0:4001->80/tcp
backend-env2      Up              0.0.0.0:8082->8080/tcp
frontend-env2     Up              0.0.0.0:4002->80/tcp
...
```

### 3-3. 서버 응답 확인

브라우저 또는 curl로 확인합니다.

```bash
# React 페이지 확인
curl -I http://localhost:4001

# Spring API 확인 (env별로 확인)
curl http://localhost:8081/api/health
# 응답: {"status":"ok","env":"env1","timestamp":"..."}

curl http://localhost:8081/api/items
# 응답: [{"id":1,"name":"노트북","price":1500000}, ...]
```

| URL | 내용 |
|-----|------|
| http://localhost:4001 | env1 React 페이지 |
| http://localhost:4002 | env2 React 페이지 |
| http://localhost:4003 | env3 React 페이지 |
| http://localhost:4004 | env4 React 페이지 |
| http://localhost:4005 | env5 React 페이지 |

### 3-4. 로그 확인

```bash
# 특정 환경 로그
docker compose logs -f backend-env1
docker compose logs -f frontend-env1

# 전체 로그
docker compose logs -f
```

### 3-5. 컨테이너 종료

```bash
# 컨테이너 중지 (이미지는 유지)
docker compose stop

# 컨테이너 + 네트워크 제거
docker compose down

# 이미지까지 전부 제거 (초기화)
docker compose down --rmi all
```

---

## 4. Cypress 설치 및 실행

### 4-1. 의존성 설치

```bash
cd C:/Users/HOME/Desktop/practice
npm install
```

> 설치 시 Cypress 바이너리(약 300MB)도 함께 다운로드됩니다.

### 4-2. 실행 방법

#### GUI 모드 (개발 시 권장)

```bash
npm run cy:open
```

1. Cypress 앱이 열리면 **E2E Testing** 선택
2. 브라우저 선택 (Chrome 권장)
3. 테스트 파일 클릭하여 개별 실행

#### CLI 모드 (자동화/CI 시 사용)

```bash
# 전체 환경 순차 실행
npm run cy:run:all

# 특정 환경만 실행
npm run cy:run:env1
npm run cy:run:env2
npm run cy:run:env3
npm run cy:run:env4
npm run cy:run:env5
```

### 4-3. 테스트 항목

각 환경(env1~env5)에서 아래 항목을 검증합니다.

**API 테스트**
- `GET /api/health` → status: ok, env 값 일치 여부
- `GET /api/items` → 배열 응답, id/name/price 필드 존재 여부

**UI 테스트**
- 페이지 타이틀 (`Practice App`) 표시 여부
- 서버 상태 `ok` 표시 여부
- 현재 환경명 표시 여부
- 상품 목록 3개 렌더링 여부
- `노트북` 상품 목록 존재 여부

### 4-4. 테스트 결과 확인

```
cypress/
├── screenshots/    # 실패 시 자동 캡처
└── videos/         # 실행 영상 녹화
```

---

## 5. GitHub Actions 연동

### 5-1. Self-hosted Runner 등록 (사내 VM)

GitHub Actions가 사내 VM에 접근하려면 VM에 Runner를 등록해야 합니다.

```
GitHub 레포지토리
→ Settings
→ Actions
→ Runners
→ New self-hosted runner
→ Linux 선택 후 안내 명령어 실행
```

VM에서 실행:
```bash
mkdir actions-runner && cd actions-runner

# GitHub에서 제공하는 명령어 그대로 실행
curl -o actions-runner-linux-x64-X.X.X.tar.gz -L [GitHub 제공 URL]
tar xzf ./actions-runner-linux-x64-X.X.X.tar.gz
./config.sh --url https://github.com/[org]/[repo] --token [TOKEN]

# 서비스로 등록 (재부팅 후에도 자동 실행)
sudo ./svc.sh install
sudo ./svc.sh start
```

### 5-2. 트리거 조건

| 이벤트 | 브랜치 | 동작 |
|--------|--------|------|
| `push` | main, develop | 빌드 → 테스트 → 실패 시 revert |
| `pull_request` | main, develop | 빌드 → 테스트 → 성공 시 auto merge / 실패 시 PR 차단 |

### 5-3. 파이프라인 흐름

```
push / PR 생성
      ↓
[build] Docker 이미지 빌드
      ↓
[cypress] 5개 환경 병렬 테스트 (matrix)
      ↓
   성공?
  ↙      ↘
[on-success]    [on-failure]
PR Auto Merge   Push → git revert
                PR  → Merge 차단 + 코멘트
```

---

## 6. 트러블슈팅

### Cypress 실행 시 `bad_message.cc reason 114` 오류

**원인**: Windows 환경에서 Chromium 렌더러 IPC 충돌 (GPU 가속, 샌드박스 제한)

**해결**: `cypress.config.js`에 Chrome 실행 플래그 추가 (기본 설정에 포함됨)
```js
launchOptions.args.push('--disable-gpu')
launchOptions.args.push('--no-sandbox')
launchOptions.args.push('--disable-dev-shm-usage')
```

---

### Docker 컨테이너가 계속 재시작됨

```bash
# 로그로 원인 확인
docker compose logs backend-env1

# WAR 배포 실패 시 → 빌드 캐시 초기화 후 재시도
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

### `curl http://localhost:8081/api/health` 응답 없음

Tomcat이 WAR 파일을 로드하는 데 시간이 걸립니다. (최대 30초)

```bash
# 로그에서 "Server startup in X ms" 메시지 확인
docker compose logs -f backend-env1

# 확인 후 재시도
curl http://localhost:8081/api/health
```

---

### Cypress에서 `cy.visit()` 타임아웃

Docker 컨테이너가 실행 중인지 먼저 확인하세요.

```bash
docker compose ps   # State가 "Up"인지 확인
curl http://localhost:4001  # 200 응답인지 확인
```

---

### Docker Hub rate limit 오류

```bash
# Docker Hub 로그인 후 재시도
docker login
docker compose build
```

---

### 포트 충돌 (포트가 이미 사용 중)

```bash
# Windows: 포트 사용 중인 프로세스 확인
netstat -ano | findstr :4001
netstat -ano | findstr :8081

# 해당 PID 종료
taskkill /PID [PID번호] /F
```
