# Stage 1: Build (utiliza Maven preinstalado)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copia de dependencias y código fuente del servicio
COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Render asigna el puerto mediante la variable PORT
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]