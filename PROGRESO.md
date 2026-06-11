# PROGRESO — Habit Dating Sim

## Estado actual: Fase 1 — Motor del juego ✅ completada

- [x] Fase 0 — Setup (cerrada: `npm run test` ya existe y corre en verde)
- [x] Tipos en `src/types.ts` (Character, Mission, HappyEnding, GameState)
- [x] Persistencia en `src/storage.ts` (localStorage con clave única, versión de schema,
      export/import JSON con validación)
- [x] Lógica pura del juego en `src/game/`:
  - `constants.ts` — corazones por dificultad, penalizaciones, umbrales, límites
  - `dates.ts` — fechas ISO comparadas por día
  - `hearts.ts` — cálculo de corazones, multiplicador por retraso, nivel por umbrales, barra de progreso
  - `engine.ts` — crear personaje/misión, completar, cancelar, cambiar fecha, checks de
    vencimiento y abandono, boda/HappyEnding
- [x] Script `"test": "vitest run"` en `package.json` (y `test:watch`)
- [x] Los 42 casos de `docs/testing/qa-report.md` portados como tests (`src/game/qa-report.test.ts`,
      con su número TC-XXX) + tests del abandono escalonado + unitarios de corazones y storage
- [x] **59 tests en verde**, `npm run build` y `npm run lint` limpios

## Decisiones de diseño (confirmadas por Hector el 2026-06-11)

1. **Un solo contador de corazones (`heartsTotal`) que SÍ baja con penalizaciones** (cancelar
   o dejar vencer resta de verdad y el progreso al siguiente nivel retrocede), con mínimo 0
   (sin negativo). El nivel es campo aparte: nunca baja por penalizaciones, solo por abandono.
   Elegido por Hector entre las dos versiones contradictorias de los docs (ganó la de
   `bubble-schema.md`; se dejó nota de obsolescencia en `qa-report.md` y los tests se
   adaptaron).
2. **El reloj de abandono nunca para:** cada 21 días completos sin actividad baja un nivel,
   las bajadas se acumulan si se vuelve después de mucho tiempo, y en nivel 0 el personaje se
   va (slot liberado). Implementado con un ancla `inactivitySince` que se reinicia al
   completar misión y avanza 21 días por bajada aplicada (check idempotente). Nota agregada
   a `mecanicas-detalle.md` §6.

Decisiones menores tomadas al implementar (documentadas, sin objeción de Hector):

3. **Misión vencida no se puede completar** (TC-024/TC-040): pasa a `failed` con penalización.
   El multiplicador por retraso de `mecanicas-detalle.md` §4 quedó implementado como función
   pura (`hearts.ts`) por fidelidad al doc, pero en el flujo actual nunca aplica.
4. **Campos extra vs. el modelo original:** `createdDate` (inactividad si nunca se completó
   misión), `inactivitySince` (ancla del reloj de abandono) y `slotNumber` nullable (slot
   liberado). CLAUDE.md actualizado.
5. **Boda:** las misiones pendientes restantes del personaje se cierran como `cancelled` SIN
   penalización (TC-029 exige que no queden pendientes; el doc no especificaba).
6. **Abandono definitivo:** pendientes pasan a `failed` sin penalización extra
   (bubble-decisions Workflow 5).

## Próximo paso

**Fase 2 — Pantallas** (ver `docs/build/PLAN-VSCODE.md` y `docs/design/flujo-pantallas.md`):

1. Home: 3 slots, corazones, nivel, misiones pendientes, crear personaje
2. Perfil de personaje + crear misión + completar misión
3. Escenas: level-up, boda, abandono, cancelación (con placeholders de imagen)
4. Conectar `loadState`/`saveState` y correr `checkExpiredMissions` + `checkAbandonment`
   al cargar la app (equivalente al "page load del Home" de bubble-decisions)

## Backlog (post-MVP)

- Mensaje al intentar crear un 4to personaje ("las 3 habitaciones están ocupadas")
- Sincronización multi-dispositivo (Supabase)
- Sonido, más escenas, personalización de sprites
- Galería "Happy Endings"
- Notificaciones push
- Ranking semanal
- Niveles 4 y 5
- Estadísticas de racha y consistencia

## Historial de sesiones

### 2026-06-11 (2) — Decisiones de Hector aplicadas al motor
- Hector eligió: contador único de corazones que retrocede con penalizaciones (clamp a 0),
  y reloj de abandono que nunca para (bajadas de nivel acumulables, en nivel 0 se va)
- Motor y tests reescritos a ese modelo; campo `inactivitySince` agregado al Character
- Notas de decisión agregadas a `qa-report.md`, `mecanicas-detalle.md` y `CLAUDE.md`
- 59 tests en verde

### 2026-06-11 — Fase 1: motor del juego
- Tipos, constantes, helpers de fecha, cálculo de corazones/niveles y motor de acciones
  como funciones puras (la fecha "hoy" siempre entra como parámetro — todo testeable)
- Capa de persistencia con localStorage inyectable, versión de schema y export/import JSON
- 42 TCs del QA report portados a Vitest + tests de corazones y storage (56 en total, verdes)
- Scripts `test` y `test:watch` agregados a `package.json`
- Documentadas 7 decisiones de diseño tomadas al resolver contradicciones entre docs (arriba)

### 2026-06-10 — Setup inicial + GitHub
- Se creó el proyecto con `npm create vite@latest -- --template react-ts`
- Se configuró Tailwind v4 vía plugin de Vite
- Se reemplazó el contenido default de `App.tsx` por "Hola Habit Dating Sim"
- Se copiaron los docs de diseño desde el vault a `docs/`
- Se creó repo privado en GitHub y se hizo push inicial
- Se configuró el repo para dispatch remoto de Claude Code (GitHub App / Actions)
