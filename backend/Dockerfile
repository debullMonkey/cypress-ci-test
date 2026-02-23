# Stage 1: Maven으로 WAR 빌드
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# 의존성 캐싱 (pom.xml이 바뀌지 않으면 캐시 재사용)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# 소스 복사 후 WAR 빌드
COPY src ./src
RUN mvn clean package -DskipTests -q

# Stage 2: Tomcat에 WAR 배포
FROM tomcat:10.1-jdk17-temurin

# 기본 앱 제거 후 빌드된 WAR을 ROOT.war로 배포
RUN rm -rf /usr/local/tomcat/webapps/*
COPY --from=builder /app/target/app.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]
