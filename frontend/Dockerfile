# Stage 1: React 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Nginx로 정적 파일 서빙 + API 프록시
FROM nginx:alpine

# 빌드된 React 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx.conf를 template으로 복사 (envsubst로 환경변수 치환됨)
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
