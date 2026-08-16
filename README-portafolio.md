# 🏦 Direcciones Fiscales — Migración a Microservicios con Spec Driven Development

> Migración de una pantalla legada (Java 8 · JSF/PrimeFaces, monolítica)
> a una arquitectura moderna de microservicios, aplicando **Spec Driven
> Development (SDD)** de principio a fin con un agente de IA
> (OpenCode) como par de desarrollo.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-brightgreen)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Tests](https://img.shields.io/badge/E2E%20tests-31%2F31%20passing-success)

---

## 📌 Contexto

Este proyecto simula un escenario muy común en la industria financiera:
**migrar una pantalla crítica de un sistema legado monolítico** (captura
de domicilios fiscales para fideicomisos) hacia una arquitectura de
microservicios, **sin poder modificar las tablas de base de datos
originales** en la mayoría de los casos — un desafío real de migración
tipo *Strangler Fig*.

El desarrollo completo se guio con **Spec Driven Development**: cada
funcionalidad partió de una especificación de negocio validada, antes
de generar una sola línea de código.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│   React 18 + TypeScript + shadcn/ui       │
│   (Storybook + Vite, puerto 5173)         │
└───────────────────┬───────────────────────┘
                     │
   ┌─────────────────┼──────────────────┬───────────────────┐
   ▼                 ▼                  ▼                    ▼
┌─────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│Fideicomi│   │ Direcciones  │   │     CIF      │   │ Carga Masiva │
│sos      │   │ Fiscales     │   │ Procesamiento│   │              │
│Adapter  │   │ (dominio)    │   │ (PDF → datos)│   │  (layout)    │
│  :8082  │   │   :8081      │   │    :8083     │   │    :8084     │
└────┬────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
     └────────────────┴──────────────────┴──────────────────┘
                              │
                     PostgreSQL 16
```

4 microservicios independientes, cada uno con su propia responsabilidad
y base de código, comunicándose vía REST.

---

## 🛠️ Stack técnico

**Backend**
- Java 17 · Spring Boot 4.1 · Spring Framework 7 · Hibernate 7
- Apache PDFBox (extracción de datos de PDF)
- JUnit 5 + Spring Test

**Frontend**
- React 18 · TypeScript · Vite
- shadcn/ui sobre Tailwind CSS v4
- TanStack Query (React Query)
- Storybook (documentación de componentes)
- Playwright (pruebas E2E)

**Datos**
- PostgreSQL 16

---

## ✨ Funcionalidades

| # | Funcionalidad | Descripción |
|---|---|---|
| 1 | 🔍 **Consulta** | Búsqueda de domicilios fiscales por Fideicomiso y/o Tipo de Participante |
| 2 | ➕ **Alta** | Captura de un nuevo domicilio, con validación en tiempo real contra el sistema de Fideicomisos |
| 3 | 🔄 **Heredar domicilio** | Reutilizar un domicilio ya registrado en otra tabla del sistema, en vez de capturarlo de cero |
| 4 | 📄 **Carga por CIF** | Extracción automática de datos desde el PDF de la Cédula de Identificación Fiscal (SAT), con validación cruzada de RFC |
| 5 | ✏️🗑️ **Modificar / Eliminar** | Edición y baja de registros existentes |
| 6 | 📥 **Importación masiva** | Carga de múltiples domicilios desde un archivo de layout, con reporte de errores línea por línea |

---

## 🧪 Calidad y pruebas

- **Pruebas de integración** en los 4 microservicios (JUnit + Spring Test).
- **Historias de Storybook** para cada componente de UI, cubriendo múltiples estados (carga, error, vacío, con datos).
- **31 pruebas End-to-End con Playwright**, ejecutadas contra los microservicios reales (sin mocks), cubriendo las 6 funcionalidades principales de punta a punta.

---

## 🧠 Sobre el proceso: Spec Driven Development

Cada funcionalidad se desarrolló siguiendo un flujo estricto:

```
Especificación de negocio → Plan técnico → Tareas → Implementación (asistida por IA) → Verificación
```

Este enfoque permitió detectar y corregir a tiempo varias
inconsistencias reales del sistema legado — por ejemplo, reglas de
negocio que parecían simples pero cambiaban al validarse con datos
reales, o suposiciones técnicas sobre el esquema de datos que resultaron
incorrectas al revisarlas contra la documentación original.

---

## 🚀 Cómo correrlo localmente

```bash
# 1. Levantar Postgres
docker compose up -d

# 2. Levantar los 4 microservicios (cada uno en su terminal)
cd services/ms-direcciones-fiscales && ./mvnw spring-boot:run
cd services/ms-fideicomisos-adapter && ./mvnw spring-boot:run
cd services/ms-cif-procesamiento && ./mvnw spring-boot:run
cd services/ms-carga-masiva && ./mvnw spring-boot:run

# 3. Levantar el frontend
cd frontend && npm install && npm run dev

# 4. (Opcional) Correr las pruebas E2E
cd frontend && npm run test:e2e
```

---

## 👤 Autor

**Juan Carlos** — Ingeniero de software especializado en sistemas
legados (Java/JSF, VB6/COM+) y arquitecturas modernas (React,
TypeScript, Spring Boot, microservicios).

---

## 📄 Licencia

Proyecto de portafolio con fines educativos/demostrativos.
