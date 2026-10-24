# Curso FSckDy · de v0 a full stack

FSckDy v0 guarda todo en IndexedDB del teléfono. Funciona, pero no es full stack: no hay servidor, no hay base de datos, no hay cuentas.
Estas misiones convierten la app en el proyecto donde aprendes lo que te falta.

**Regla del curso:** el código de las misiones lo escribes tú. Yo reviso, explico y señalo errores. Si lo genero yo, no aprendes nada y el proyecto deja de servir.

---

## Cómo trabajamos

1. Eliges la misión.
2. Escribes el código en una rama `mision-XX-nombre`.
3. Abres PR.
4. Yo reviso: qué está bien, qué rompe y por qué.
5. Mergeas tú.

Cada misión enlaza con un nivel de `~/projects/fullstack-theory/INDICE.md`.

---

## Misiones

### M1 · Entender qué pasa en la red
**Nivel:** 4 · Internet y HTTP
**Antes de programar backend, entiende tu propia app.**

- Abre https://fsckdy.web.app en el navegador con DevTools → Network.
- Recarga en frío, con caché desactivada y con el Service Worker activo.
- Documenta en `docs/http.md`: cada petición, sus status codes, headers de cache, y por qué el segundo arranque es instantáneo.
- Repite con `curl -v` y compara.
- Busca el `manifest.webmanifest` y explica cada campo.

**Aceptación:** puedes explicar por qué la app carga sin internet y qué archivo lo hace posible.
**Yo reviso:** que el documento no tenga afirmaciones inventadas.

---

### M2 · Modelar la base de datos en SQL
**Nivel:** 6 · Bases de datos y SQL
**La misión más importante. No la aceleres.**

- Escribe a mano `api/db/schema.sql` para: usuarios, materias, preguntas, opciones, intentos, tarjetas SM-2.
- Incluye PK, FK, índices y restricciones (`CHECK` en la respuesta correcta, `UNIQUE` donde corresponda).
- Escribe 8 consultas: precisión por materia, racha de días, tarjetas vencidas hoy, pregunta más fallada, etc.
- Instala Postgres local (o `docker run postgres`), carga el schema y ejecuta las consultas.
- Añade un índice y demuestra con `EXPLAIN ANALYZE` que la consulta pasa de `Seq Scan` a `Index Scan`.

**Aceptación:** las 8 consultas devuelven resultados correctos y tienes una captura del `EXPLAIN` antes/después.
**Yo reviso:** el modelo (normalización, tipos, índices que faltan).

---

### M3 · Primera API propia
**Nivel:** 5 · Backend con Node

- Crea `api/` con Fastify + TypeScript.
- Endpoints: `GET /preguntas`, `GET /preguntas/:id`, `POST /intentos`.
- Validación con Zod. Errores tipados. Logs con request-id.
- Sin ORM todavía: `pg` con consultas parametrizadas.
- Pruébalo con `curl` y guarda los comandos en `docs/api.http`.

**Aceptación:** un `curl` inválido devuelve 400 con mensaje claro, no un stack trace.
**Yo reviso:** estructura por capas y manejo de errores.

---

### M4 · Cuentas de verdad
**Nivel:** 5 + 7 · Backend y seguridad

- `POST /auth/registro` y `POST /auth/login` con `argon2`.
- Sesión en cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
- Middleware que exige sesión en las rutas privadas.
- Rate limit en login.
- `GET /yo` debe devolver **solo** los datos del usuario autenticado.

**Aceptación:** intentar leer los datos de otro usuario cambiando un ID devuelve 403, y sabes explicar por qué.
**Yo reviso:** el threat model de este flujo.

---

### M5 · Conectar la app a tu API
**Nivel:** 12 · Frontend avanzado

- Sustituye Dexie como fuente de verdad por la API, manteniendo IndexedDB como caché de lectura.
- Estados de carga, error y vacío en cada pantalla.
- Nada de `fetch` suelto en componentes: un cliente HTTP central.

**Aceptación:** con el wifi apagado la app sigue mostrando el contenido cacheado y avisa de que está offline.
**Yo reviso:** manejo de estados y fugas de memoria.

---

### M6 · Tests que sirven
**Nivel:** 9 · Testing

- Integración contra Postgres real (contenedor efímero) para los endpoints.
- Unitarios para SM-2, incluido el caso de fallo que reinicia `reps`.
- Un e2e con Playwright: registrarse, responder 3 tarjetas, ver progreso.

**Aceptación:** rompes el SM-2 a propósito y el test falla antes del fix.
**Yo reviso:** que los tests prueben comportamiento y no implementación.

---

### M7 · Poner la API en producción
**Nivel:** 10 · DevOps

- `Dockerfile` multi-stage para la API y `docker compose` con Postgres.
- CI: migraciones + tests en cada PR.
- Deploy en Fly.io o Render + Postgres gestionado.
- Logs, healthcheck y un rollback documentado.

**Aceptación:** `git push` a main deja la API en producción en menos de 5 minutos y sabes volver a la versión anterior.
**Yo reviso:** el pipeline y las variables de entorno.

---

### M8 · Sincronización offline
**Nivel:** 11 · Arquitectura
**La misión difícil, para el final.**

- Cola de escrituras pendientes cuando no hay red.
- Reintento con idempotencia (una respuesta no puede contarse dos veces).
- Resolución de conflictos: ¿qué gana si el mismo intento existe en dos dispositivos?

**Aceptación:** respondes 5 tarjetas en modo avión, recuperas red y las 5 llegan exactamente una vez.
**Yo reviso:** el diseño de idempotencia y conflictos.

---

## Qué NO hago yo

- No escribo el código de M1 a M6.
- No te doy la solución cuando falles: te doy la pregunta que te lleva a ella.
- No mergeo nada sin que pase CI.

## Qué sí hago yo

- Revisar tus PRs con detalle.
- Explicar cualquier concepto del currículo.
- Arreglar infraestructura que no es el objetivo de aprendizaje (CI, deploy, configuración).
- Señalar cuándo estás sobreingeniería.

---

## Estado

| Misión | Estado | Rama | PR |
|---|---|---|---|
| M1 · Red | ⬜ | | |
| M2 · SQL | ⬜ | | |
| M3 · API | ⬜ | | |
| M4 · Auth | ⬜ | | |
| M5 · Conectar | ⬜ | | |
| M6 · Tests | ⬜ | | |
| M7 · Producción | ⬜ | | |
| M8 · Offline | ⬜ | | |
