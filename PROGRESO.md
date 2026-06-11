# PROGRESO — Habit Dating Sim

## Estado actual: Fase 2 ✅ en master + borrar misión pendiente (PR `fix/delete-mission`)

- [x] PR #2 (Fase 2) ya fusionada a `master`, junto con el deploy automático a GitHub Pages
- [x] Nuevo: opción para borrar una misión pendiente sin penalización (no es lo mismo que
      cancelar) — ver sesión (5) abajo, pendiente de revisión/merge en `fix/delete-mission`

## Estado anterior: Fase 2 — Pantallas ✅ completada

- [x] Pantalla 1 — Home: 3 slots (ocupado/en riesgo/vacío), barra de corazones, nivel,
      lista de misiones pendientes ordenada por fecha, footer con acceso rápido
- [x] Pantalla 2 — Perfil: sprite, nivel con etapa, barra, estadísticas (completadas,
      corazones, canceladas), historial con pendientes al tope, botón crear misión
- [x] Pantalla 3 — Crear misión: 3 campos, selector visual de dificultad, preview de
      recompensa, deadline de mañana a 14 días (default +3), bloqueo con 3 pendientes
- [x] Pantalla 4 — Marcar completa: botón grande "✓ Lo hice", preview +X 💕, link de
      cancelar con su costo; variante de misión vencida ("Aceptar la pérdida")
- [x] Pantalla 5 — Escena de nivel (con placeholder de imagen) + variante de BODA
- [x] Pantalla 6 — Escena de abandono (variantes: se fue / bajó de nivel)
- [x] Pantalla 7 — Escena de cancelación (manual y automática; aviso si corazones = 0)
- [x] Crear personaje (formulario mínimo de nombre)
- [x] Checks de vencimiento y abandono al abrir la app, con escenas encoladas en secuencia
- [x] Persistencia automática en localStorage en cada cambio
- [x] Placeholders de sprites/escenas copiados de docs/assets a src/assets
- [x] Verificado en navegador real (Playwright): flujo completo crear personaje → crear
      misión → completar → subir de nivel, sin errores de consola
- [x] 64 tests en verde, build y lint limpios

**Le toca a Hector:** correr `npm run dev`, abrir http://localhost:5173 y jugar el flujo
completo. Qué mirar: crear personaje, crear misión, completarla (debería ver el toast de
corazones), cancelar una (escena de decepción), y llegar a 20 💕 (escena de nivel).

Simplificaciones de Fase 2 (deuda consciente):
- El historial del perfil no agrupa por semana (lista simple con pendientes al tope)
- Sin racha en estadísticas (está en backlog post-MVP)
- Sin animaciones de corazones flotando ni conteo animado (la secuencia de
  mecanicas-detalle §5 quedó como transiciones instantáneas)
- Export/import JSON existe en `storage.ts` pero aún no tiene botón en la UI
- El sprite se asigna por hash del id (no hay selector de sprite)

## Estado anterior: Fase 1 — Motor del juego ✅ completada

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

1. **Revisar y fusionar la PR `fix/delete-mission`** — agrega la opción de borrar una
   misión pendiente sin penalización (sesión (5) abajo). Probar el flujo y darle Merge.
2. **Hector prueba la app.** Ya no hace falta instalar nada: el deploy automático a
   GitHub Pages quedó configurado sobre `master`, así que basta abrir el link publicado
   y jugar el flujo completo ahí (crear personaje, crear misión, completarla, cancelar
   una, llegar a 20 💕).
3. **Fase 3** según `docs/build/PLAN-VSCODE.md` + deuda de Fase 2 (export/import JSON en
   la UI, ajustes que salgan de la prueba de Hector)

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

### 2026-06-11 (5) — Borrar misión pendiente sin penalización
- Problema de Hector: no había forma de quitarse de encima una misión pendiente que ya
  no se quería, salvo esperar a que venza o cancelarla (con penalización de corazones).
  Eso dejaba "espacio muerto" — el cupo de 3 misiones pendientes por personaje quedaba
  ocupado por algo que el usuario no iba a hacer.
- Solución: nueva opción "🗑 borrar esta misión (sin penalización)" en la pantalla de
  "Marcar misión completa" (se llega tocando cualquier misión pendiente desde Home o
  Perfil), debajo del link existente "cancelar esta misión". Pide confirmación porque
  no se puede deshacer. Al borrar, la misión desaparece de la lista y libera el cupo
  para crear una nueva.
- Diferencia con "cancelar": cancelar es narrativo (penaliza corazones, dispara la
  escena de decepción); borrar es administrativo (sin penalización, sin escena, no
  toca al personaje).
- Motor: nueva función pura `deleteMission` en `engine.ts` (solo permite borrar
  misiones `pending`). 4 tests nuevos — 68 en total, todos en verde. Build y lint limpios.
- Decisión documentada en `mecanicas-detalle.md` §10.
- PR `fix/delete-mission` → `master`, pendiente de revisión de Hector.

### 2026-06-11 (4) — Cierre de sesión
- PR #1 (Fase 1) creada y fusionada a master por Hector ✅
- Fase 2 terminada y subida a la rama, SIN PR todavía
- Hector empezó a probar la app localmente: descargó el ZIP y se quedó en el paso de
  navegar con `cd` hasta la carpeta del proyecto en cmd (Windows). Instrucciones ya dadas
- Pendiente de decidir: GitHub Pages para probar desde un link sin instalar nada

### 2026-06-11 (3) — Fase 2: las 7 pantallas
- UI completa en React + Tailwind: Home, Perfil, Crear personaje, Crear misión,
  Marcar completa, y las 3 escenas (nivel/boda, abandono, cancelación)
- `App.tsx` orquesta navegación, corre los checks al abrir y persiste cada cambio
- Helpers de motor para la UI: `acknowledge*Scene`, `completedMissionsCount`,
  `daysTogether` (con tests — 64 en total)
- Placeholders de pixel art conectados (sprites por hash de id, escenas por nivel)
- Verificación visual con Playwright: flujo completo sin errores de consola

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
