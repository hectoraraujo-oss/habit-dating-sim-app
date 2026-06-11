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
      con su número TC-XXX) + tests unitarios de corazones y storage
- [x] **56 tests en verde**, `npm run build` y `npm run lint` limpios

## Decisiones tomadas en esta sesión (confirmar con Hector)

1. **Dos contadores de corazones** (`heartsTotal` + `heartsCurrent`), siguiendo la convención de
   `qa-report.md`: `heartsTotal` solo sube y decide los niveles; `heartsCurrent` es el visible,
   baja con penalizaciones. **Ojo:** esto contradice `docs/build/bubble-schema.md`, que dice
   eliminar `hearts_current` y dejar que `hearts_total` baje. Se siguió el QA report porque los
   42 casos de prueba son el contrato. Si Hector prefiere lo del schema, hay que actualizar
   tests y motor juntos.
2. **TC-036 (penalización a negativo):** escenario A — `heartsCurrent` se clampea a 0, nunca
   negativo (consistente con `mecanicas-detalle.md` §3).
3. **Misión vencida no se puede completar** (TC-024/TC-040): pasa a `failed` con penalización.
   El multiplicador por retraso de `mecanicas-detalle.md` §4 quedó implementado como función
   pura (`hearts.ts`) por fidelidad al doc, pero en el flujo actual nunca aplica.
4. **Campos extra vs. el modelo de CLAUDE.md:** se agregaron `heartsCurrent` y `createdDate`
   (necesario para contar inactividad si nunca se completó misión), y `slotNumber` acepta
   `null` (slot liberado por boda o abandono en nivel 0).
5. **Boda:** las misiones pendientes restantes del personaje se cierran como `cancelled` SIN
   penalización (TC-029 exige que no queden pendientes; el doc no especificaba).
6. **Abandono en nivel 0:** pendientes pasan a `failed` sin penalización extra
   (bubble-decisions Workflow 5).
7. **Pendiente de definir:** tras un abandono que baja nivel (personaje sigue activo), el
   contador de 21 días no se reinicia; por ahora `checkAbandonment` no vuelve a penalizar
   mientras `pendingAbandonmentScene` siga en `true`. Definir cuándo arranca la siguiente
   ventana de 21 días (¿al mostrar la escena?).

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
