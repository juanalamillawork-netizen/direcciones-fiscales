# Guía de Despliegue — Nube Gratuita (Render + Vercel + Neon + GitHub Actions)

## Resumen de la arquitectura de despliegue

| Componente | Plataforma | Costo | Notas |
|---|---|---|---|
| PostgreSQL | **Neon** | Gratis | Ya lo tienes configurado |
| 4 microservicios Spring Boot | **Render** (Web Services) | Gratis | Se "duermen" tras 15 min sin tráfico; primera petición tarda ~30-60s en despertar |
| Frontend React/Vite | **Vercel** | Gratis | Sin "sleep", despliegue automático en cada push |
| CI (pruebas) | **GitHub Actions** | Gratis (repos públicos) | Corre pruebas antes de disparar el despliegue |

---

## Paso 1 — Prepara los Dockerfiles

Copia `Dockerfile.microservicio` (ya generado) dentro de cada uno de los
4 microservicios, renombrado simplemente `Dockerfile`:

```bash
cp Dockerfile.microservicio services/ms-direcciones-fiscales/Dockerfile
cp Dockerfile.microservicio services/ms-fideicomisos-adapter/Dockerfile
cp Dockerfile.microservicio services/ms-cif-procesamiento/Dockerfile
cp Dockerfile.microservicio services/ms-carga-masiva/Dockerfile
```

**Antes de usarlo**, revisa que cada `application.yml`/`application.properties`
lea el puerto y la URL de base de datos desde **variables de entorno**
(no hardcodeadas), por ejemplo:

```yaml
server:
  port: ${SERVER_PORT:8081}
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
```

Y que la URL de `ms-fideicomisos-adapter` (que consumen los otros 3
servicios) también venga de una variable, no de `http://localhost:8082`
fijo:

```yaml
fideicomisos:
  adapter:
    url: ${FIDEICOMISOS_ADAPTER_URL:http://localhost:8082}
```

Si algún servicio todavía tiene URLs fijas a `localhost`, es el
momento de parametrizarlas — pídele a OpenCode que lo revise si no
estás seguro.

## Paso 2 — Sube el `render.yaml` a la raíz del repo

Ya está generado (`render.yaml`). Colócalo en la raíz de tu repositorio
de GitHub y haz commit.

## Paso 3 — Crea el Blueprint en Render

1. Entra a [render.com](https://render.com) → **New** → **Blueprint**.
2. Conecta tu repositorio de GitHub.
3. Render detecta `render.yaml` y te muestra los 4 servicios a crear.
4. Para cada variable marcada `sync: false` (las de conexión a Neon y
   CORS), pégalas manualmente en el dashboard de Render — **nunca las
   subas al repo**, son secretos.
   - `SPRING_DATASOURCE_URL`: tu connection string de Neon (formato JDBC: `jdbc:postgresql://<host>/<db>?sslmode=require`)
   - `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`: credenciales de Neon
   - `CORS_ALLOWED_ORIGIN`: la URL que te va a dar Vercel en el paso 4 (puedes dejarlo pendiente y regresar a completarlo)
5. Da clic en **Apply** — Render construye y despliega los 4 servicios.

## Paso 4 — Despliega el frontend en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New Project**.
2. Conecta el mismo repositorio de GitHub.
3. En **Root Directory**, selecciona `frontend`.
4. Framework Preset: Vercel detecta Vite automáticamente.
5. Agrega las variables de entorno (con las URLs reales que Render te
   dio en el paso 3, algo como `https://ms-direcciones-fiscales.onrender.com`):
   - `VITE_API_DIRECCIONES_FISCALES_URL`
   - `VITE_API_FIDEICOMISOS_URL`
   - `VITE_API_CIF_URL`
   - `VITE_API_CARGA_MASIVA_URL`
6. Da clic en **Deploy**.
7. **Regresa a Render** y completa `CORS_ALLOWED_ORIGIN` en los 4
   servicios con la URL que Vercel te dio (ej. `https://direcciones-fiscales.vercel.app`).

## Paso 5 — Carga el esquema y datos semilla en Neon

Si no lo has hecho ya:

```bash
psql "<tu-connection-string-de-neon>" -f 04-esquema-datos-postgres.sql
psql "<tu-connection-string-de-neon>" -f 05-datos-semilla-laboratorio.sql
psql "<tu-connection-string-de-neon>" -f 06-tablas-legadas-solo.sql
# ...y el resto de los archivos de datos semilla que generamos durante el laboratorio
```

## Paso 6 — Configura GitHub Actions (CI + disparo de despliegue)

1. Copia `ci-cd.yml` a `.github/workflows/ci-cd.yml` en tu repositorio.
2. En Render, para cada uno de los 4 servicios: **Settings → Deploy Hook**
   → copia la URL.
3. En GitHub: **Settings → Secrets and variables → Actions**, agrega 4
   secretos con esas URLs:
   - `RENDER_DEPLOY_HOOK_DIRECCIONES_FISCALES`
   - `RENDER_DEPLOY_HOOK_FIDEICOMISOS_ADAPTER`
   - `RENDER_DEPLOY_HOOK_CIF_PROCESAMIENTO`
   - `RENDER_DEPLOY_HOOK_CARGA_MASIVA`
4. Desactiva el **"Auto-Deploy"** nativo de Render en cada servicio
   (Settings → Auto-Deploy → Off) — así el despliegue solo ocurre
   **después** de que las pruebas de GitHub Actions pasen, no en cada
   push directo.
5. Vercel puede quedarse con su auto-deploy nativo activado (no
   depende de las pruebas del backend).

## Resultado final

Con esto, cada `push` a `main`:
1. Dispara GitHub Actions, que corre las pruebas de los 4
   microservicios y del frontend.
2. Si todo pasa, dispara los 4 Deploy Hooks de Render (los
   microservicios se reconstruyen y despliegan).
3. Vercel despliega el frontend en paralelo, automáticamente.

## Limitaciones a tener en cuenta (nivel gratuito)

- Los servicios de Render se **duermen tras 15 min sin tráfico** — la
  primera petición después de dormir tarda ~30-60 segundos. Para una
  demo en vivo (ej. en una entrevista), abre la app unos minutos antes
  para que los 4 servicios ya estén "despiertos".
- Neon en su tier gratuito también tiene límites de cómputo — revisa
  su documentación si el proyecto crece.
- Las pruebas E2E de Playwright **no** están incluidas en el CI
  automático (requieren los 4 servicios corriendo simultáneamente con
  datos reales, lo cual complica la orquestación en GitHub Actions) —
  córrelas manualmente antes de cambios grandes.
