# PROGRESO — Habit Dating Sim

## Estado actual: Fases 0, 1 y 2 completas + fix delete-character — listo para Fase 3

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

**Estado:** PR #2 (Fase 2) y PR #3 (eliminar personaje) ya están mergeadas a `master`.
La app está publicada en GitHub Pages: https://hectoraraujo-oss.github.io/habit-dating-sim-app/.
Hector puede jugar el flujo completo desde ahí sin instalar nada.

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

**Fase 3 — Triggers de tiempo** (`docs/build/PLAN-VSCODE.md` §6): el criterio de salida
("al abrir la app se evalúan deadlines vencidos y abandonos, encolados como escenas") ya
quedó implementado desde Fase 2: `initGame` en `App.tsx` corre `checkExpiredMissions` y
`checkAbandonment` al cargar, y la lógica está cubierta por `qa-report.test.ts`. Lo que
falta para cerrar Fase 3 formalmente:

1. **Verificación manual de Hector (2026-06-11): hecha en parte.** La escena de abandono
   funciona bien (verificada por Hector con cambio de fecha del sistema). En la de
   cancelación Hector detectó que la pantalla aparecía sin la ilustración: la spec original
   de Pantalla 7 pedía solo sprite triste y el código la seguía fielmente, con
   `escena-cancelacion.png` importada pero sin usar. Decisión de Hector: la escena de
   cancelación muestra la ilustración como las demás escenas. Fix aplicado en
   `CancellationScene.tsx` y doc `flujo-pantallas.md` actualizado (repo y vault).
   **Falta:** que Hector repita la prueba de deadline vencido y confirme que ahora se ve
   la ilustración. Con eso Fase 3 queda cerrada.
2. **DECIDIDO por Hector (2026-06-11): la deuda de Fase 2 va primero.** La próxima sesión
   de código debe exponer el export/import JSON de `storage.ts` en la UI (botones de
   exportar y de importar con validación, en un lugar discreto tipo ajustes/footer).
   Después de eso viene **Fase 4 — Pulido**, que Hector elevó a parte del MVP: quiere
   mecánica y parte visual lo más pulidas posible antes de validar.
3. **Assets:** Hector va a generar las 5 escenas pixel art él mismo (paquete con prompts
   en el vault: `assets/PAQUETE-ARTE.md`). Cuando entregue los PNG, integrarlos
   reemplazando los placeholders (reescalado pixel-perfect a 320x180 si hace falta).
4. **Después del MVP pulido:** planeación del "road to v1.0" (decisión P3 de Hector,
   2026-06-11, en DECISIONS del vault).
5. Limpieza pendiente no urgente: borrar ramas mergeadas `fix/delete-mission` y
   `claude/phase-1-game-engine-5m9wys` (local y remoto).

## Backlog (post-MVP)

- Sincronización multi-dispositivo (Supabase)
- Sonido, más escenas, personalización de sprites
- Galería "Happy Endings"
- Notificaciones push
- Ranking semanal
- Niveles 4 y 5
- Estadísticas de racha y consistencia

## Historial de sesiones

### 2026-06-11 (7) — Verificación de Fase 3 por Hector + fix de ilustración en cancelación
- Hector verificó manualmente los triggers de tiempo: la escena de abandono funciona bien.
- Hallazgo de Hector: la escena de cancelación no mostraba la ilustración. Causa: la spec
  original de Pantalla 7 (`flujo-pantallas.md`) pedía solo sprite con expresión triste;
  `CANCELLATION_SCENE` estaba importada en `sprites.ts` pero ninguna pantalla la usaba.
- Fix: `CancellationScene.tsx` ahora muestra `escena-cancelacion.png` en la parte superior
  (mismo patrón que `AbandonmentScene`), reemplazando al sprite. Doc actualizado en repo
  y vault con la decisión de Hector (2026-06-11).
- También se registró en este doc la decisión de prioridad de Hector: export/import en UI
  primero, después Fase 4 (que ahora es parte del MVP), y que Hector genera las 5 escenas
  finales con el paquete de arte del vault.
- 67 tests en verde, `npm run lint` y `npm run build` limpios.

### 2026-06-11 (6) — Cierre de sesión: PRs #2 y #3 mergeadas + GitHub Pages
- PR #2 (Fase 2: las 7 pantallas) mergeada a `master`.
- GitHub Pages configurado y funcionando: la app está publicada en
  https://hectoraraujo-oss.github.io/habit-dating-sim-app/, deploy automático en cada
  push a `master`.
- PR #3 (eliminar personaje completo, con confirmación) mergeada a `master`.
- 67 tests en verde, `npm run build` y `npm run lint` limpios en `master`.
- Revisión de Fase 3: el criterio de "checks de vencimiento y abandono al abrir la app"
  ya estaba implementado desde Fase 2 (`initGame` en `App.tsx`). Próximo paso documentado
  arriba.

### 2026-06-11 (5) — PR #3: Eliminar personaje
- Se reemplazó el alcance de la PR #3 (antes "borrar misión pendiente", revertido) por
  "eliminar personaje completo": `deleteCharacter` en `engine.ts` borra al personaje y
  todas sus misiones, y libera su slot (67 tests en verde).
- UI: botón discreto "Eliminar personaje" al fondo de `ProfileScreen`, con diálogo de
  confirmación ("¿Seguro que quieres eliminar a [nombre]? Esto borrará el personaje y
  todos sus hábitos para siempre.") y botones Cancelar/Eliminar.
- `App.tsx` conecta el flujo: al confirmar, el personaje desaparece del Home, el slot
  queda libre y aparece un toast "[nombre] fue eliminado."
- Verificado en navegador: crear personaje, abrir su perfil, eliminar, vuelve a Home con
  el slot libre y el toast correcto.
- `npm run test` (67/67), `npm run build` y `npm run lint` limpios. Push a
  `fix/delete-mission` y PR #3 actualizada.

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
