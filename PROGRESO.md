# PROGRESO — Habit Dating Sim

## Estado actual: Fase 4 Ola 1.5 — juice en CADA complete con auto-advance (el juice ya no depende de que el motor dispare celebración/hito grande; todo complete sin subida de nivel pasa por MissionResultScreen y auto-avanza cuando no hay copy que leer) — siguiente: verificación manual del Director en navegador (complete normal con juice+auto-advance, complete con celebración que espera Continuar, hito menor con juice+toast, prefers-reduced-motion) + Olas 2-3 del pulido visual (at-risk, penalización sobria, level-scene/boda)

**Motor de reactividad (2026-06-14, decisión P8-a; spec del vault en
`projects/habit-dating-sim/equipo/mecanicas/motor-reactividad-spec.md`):** construidas las tres
mecánicas como UNA pieza (R2 diálogo reactivo, R3 celebración de frecuencia, A1 hitos). Es CAPA
DE LECTURA: NO toca corazones, niveles ni el reloj de 21 días. La única memoria persistente es
el array `milestonesShown` de A1. Motor puro y determinista (`reactionFor`, la variante se
inyecta por `opts`, sin `Math.random`), copy en módulo aparte (`reactionCopy.ts`, texto exacto
de las tablas del spec), surfacing sobre las pantallas existentes (Perfil, Home, resultado de
completar). **147 tests en verde** (114 + 33 nuevos), lint y build limpios. NO se tocó git.

## Estado anterior: Onboarding con Cupido (Bloques 1-3) listo

**Onboarding con presentador "Cupido" (2026-06-13, spec/guion del vault en
`projects/habit-dating-sim/equipo/onboarding/`):** MVP de los Bloques 1-3 construido. La app
ya no abre directo al Home para un jugador nuevo: primero pasa por pantalla de inicio +
intro narrada (voz Dr. Hakim, 6 cuadros) + tutorial guiado (crear personaje → su primera
misión, sobre las pantallas REALES con franja de Cupido y spotlight) + handoff al Home con 1
personaje y 1 misión. Campo nuevo `onboarded` en `GameState` con migración suave (NO se subió
SCHEMA_VERSION: un respaldo viejo sin el campo se carga como `onboarded:true`, no se
re-onboardea). Todo el arte es placeholder (recuadro con emoji por pose + fondo en gradiente
rosa); el swap por los PNG reales es un solo punto (`src/ui/components/Cupido.tsx`). **114 tests
en verde, lint y build limpios.** NO construido (follow-up): Bloque 4 (recap de regreso), que
toca la máquina de escenas de `buildStartup`. Pendiente: revisión/commit/PR del Director y
prueba manual de Hector + generación del arte real (6 poses de Cupido + 1 fondo).

## Estado anterior: Fases 0-3 completas + fixes QA (C1, M1) + decisiones P4/P5 implementadas

**Decisiones P4 y P5 de Hector (2026-06-12, registradas en DECISIONS.md del vault) implementadas:**
P4 (derecho de réplica): una misión vencida ya no se auto-falla al abrir la app; queda
pendiente como "vencida" hasta que el usuario elija en la Pantalla 4 entre "Sí lo hice
(tarde)" (recompensa reducida por el multiplicador de retraso de mecanicas-detalle §4) o
"Aceptar la pérdida" (failed + penalización + escena, el flujo anterior). **Las vencidas
pendientes SIGUEN contando para el tope de 3 misiones por personaje: la deuda ocupa
espacio** (decisión de diseño documentada también en mecanicas-detalle §4). P5: el deadline
mínimo de una misión es HOY (antes mañana); ojo, las fechas se comparan por día, así que
una misión con deadline hoy vence mañana al abrir. 108 tests en verde. Pendiente: commit/PR
del Director.

**Fixes de auditoría QA (2026-06-12, rama `fix/qa-c1-m1-import-validation-pending-scenes`):**
los dos bloqueantes del reporte del QA Auditor quedaron corregidos: C1 (importar un
respaldo corrupto ya no puede brickear la app: validación profunda en `storage.ts`) y
M1 (las escenas de abandono/cancelación que quedaron sin reconocer al cerrar la app
vuelven a aparecer en la siguiente apertura: `buildStartup` en `src/game/startup.ts`).
93 tests en verde. Pendiente: revisión y merge de la PR por el Director.

**Fase 3 cerrada el 2026-06-11:** Hector verificó manualmente con cambio de fecha del
sistema que al reabrir la app aparecen la escena de cancelación (deadline vencido, con su
ilustración tras PR #4) y la de abandono (21+ días). Sin trabajo de código adicional.

**Respaldo de datos (deuda de Fase 2, decisión P1 de Hector):** pantalla nueva "Respaldo"
(`DataScreen.tsx`) accesible desde el botón 💾 del footer del Home: exportar descarga
`habit-dating-sim-respaldo-AAAA-MM-DD.json` y importar valida el archivo y pide
confirmación antes de reemplazar el estado. Pendiente: prueba manual de Hector.

- [x] Pantalla 1 — Home: 3 slots (ocupado/en riesgo/vacío), barra de corazones, nivel,
      lista de misiones pendientes ordenada por fecha, footer con acceso rápido
- [x] Pantalla 2 — Perfil: sprite, nivel con etapa, barra, estadísticas (completadas,
      corazones, canceladas), historial con pendientes al tope, botón crear misión
- [x] Pantalla 3 — Crear misión: 3 campos, selector visual de dificultad, preview de
      recompensa, deadline de HOY a 14 días (default +3, mínimo hoy por decisión P5),
      bloqueo con 3 pendientes
- [x] Pantalla 4 — Marcar completa: botón grande "✓ Lo hice", preview +X 💕, link de
      cancelar con su costo; variante de misión vencida con dos opciones (P4): "Sí lo
      hice (tarde)" con preview de recompensa reducida, y "Aceptar la pérdida"
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
- ~~Export/import JSON existe en `storage.ts` pero aún no tiene botón en la UI~~
  Resuelto el 2026-06-11: pantalla "Respaldo" con botón 💾 en el footer del Home
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

3. ~~**Misión vencida no se puede completar** (TC-024/TC-040): pasa a `failed` con penalización.
   El multiplicador por retraso de `mecanicas-detalle.md` §4 quedó implementado como función
   pura (`hearts.ts`) por fidelidad al doc, pero en el flujo actual nunca aplica.~~
   **Superseded el 2026-06-12 por la decisión P4 de Hector (derecho de réplica):** la vencida
   queda pendiente y el usuario elige entre completarla tarde (el multiplicador de `hearts.ts`
   por fin aplica en el flujo real) o aceptar la pérdida (el flujo anterior, ahora manual).
4. **Campos extra vs. el modelo original:** `createdDate` (inactividad si nunca se completó
   misión), `inactivitySince` (ancla del reloj de abandono) y `slotNumber` nullable (slot
   liberado). CLAUDE.md actualizado.
5. **Boda:** las misiones pendientes restantes del personaje se cierran como `cancelled` SIN
   penalización (TC-029 exige que no queden pendientes; el doc no especificaba).
6. **Abandono definitivo:** pendientes pasan a `failed` sin penalización extra
   (bubble-decisions Workflow 5).

## Próximo paso

1. **Prueba manual de Hector del respaldo:** abrir la app publicada, tocar 💾 en el footer
   del Home, descargar el respaldo, y probar importarlo de vuelta (debe pedir
   confirmación antes de reemplazar). Con eso la deuda de Fase 2 queda cerrada de verdad.
2. **Fase 4 — Pulido** (parte del MVP por decisión P3 de Hector): estética dating-sim,
   animaciones de corazones (secuencia de mecanicas-detalle §5), responsive, y el resto
   de la deuda visual de Fase 2 (historial por semana si Hector lo quiere).
3. **Assets:** Hector va a generar las 5 escenas pixel art él mismo (paquete con prompts
   en el vault: `assets/PAQUETE-ARTE.md`, entregables en `assets/finales/`). Cuando
   entregue los PNG, integrarlos reemplazando los placeholders.
4. **Después del MVP pulido:** planeación del "road to v1.0" (decisión P3 de Hector,
   2026-06-11, en DECISIONS del vault).

## Backlog (post-MVP)

- Sincronización multi-dispositivo (Supabase)
- Sonido, más escenas, personalización de sprites
- Galería "Happy Endings"
- Notificaciones push
- Ranking semanal
- Niveles 4 y 5
- Estadísticas de racha y consistencia

## Historial de sesiones

### 2026-06-14: Fase 4 Ola 1.5 — juice en cada complete con auto-advance
- Se cerró el gap de la Ola 1: la secuencia de juice (sprite pop, corazones flotantes, conteo
  del +X, llenado de barra con shimmer) ahora corre en CADA complete que no sea subida de nivel,
  no solo cuando el motor dispara celebración (R3) o hito grande. El blueprint visual quería el
  juice en la micro-interacción más frecuente. Sin fricción: cuando no hay nada que leer, la
  pantalla auto-avanza sola. **165 tests en verde** (160 + 5 nuevos de `resultNeedsContinue`),
  lint y build limpios. NO se tocó git.
- **`App.tsx` `handleCompleteMission`:** se eliminaron las ramas que mandaban a Home+toast (el
  complete normal y el hito-menor-solo). Ahora TODO complete sin subida de nivel navega a
  `mission-result`, pasando `celebration` y `milestone` tal cual los calcula `reactionFor`
  (pueden ser ambos null). La rama de subida de nivel (LevelScene) quedó intacta. El reconocimiento
  del hito (`acknowledgeMilestone`) ya no se hace en App sino dentro de la pantalla, en el momento
  de avanzar (la pantalla recibe el callback). El `Screen` de `mission-result` ganó un campo
  `returnTo: 'home' | 'profile'`: 'home' cuando vino de completar misión, 'profile' cuando es un
  hito grande cruzado al abrir el Perfil (ese path conserva su comportamiento: vuelve al Perfil,
  sin toast de +💕).
- **Decisión del toast (caso por caso):** la pantalla NO muestra el toast; lo decide App al
  cerrarse (`finish`). (a) Hito MENOR (returnTo 'home'): Home + toast `✦ <línea del hito>`
  (se conserva ese reconocimiento ligero que ya existía). (b) Complete NORMAL sin hito, y también
  celebración / hito grande (returnTo 'home'): Home + el toast `¡Misión completada! +X 💕` que
  existía antes (elegido por consistencia con el flujo previo y para dar cierre al evento). (c)
  returnTo 'profile' (hito grande desde el Perfil): vuelve al Perfil sin toast (no hubo misión que
  sumara corazones).
- **`MissionResultScreen` (modificado):** el juice corre SIEMPRE (sin cambio). Nueva decisión pura
  `resultNeedsContinue(celebration, milestone)` en `reaction.ts`: true si hay celebración O hito
  GRANDE (algo que leer → copy + botón "Continuar", como antes); false si complete normal (ambos
  null) o hito MENOR (nada que leer → auto-avance). En el caso de auto-avance NO se renderiza caja
  de copy ni botón ni la pill del hito menor (ese reconocimiento sale como toast en el Home). El
  cuadro grande de Cupido sigue siendo SOLO para hitos `big`.
- **Auto-advance:** `setTimeout` de 2000ms (~la secuencia de juice) con `clearTimeout` en el
  cleanup del efecto. Con `prefers-reduced-motion` baja a 300ms (no hay juice que ver). El efecto
  depende solo de `needsContinue` (estable tras montar): los callbacks y el milestone viven en UN
  `latestRef` actualizado en un efecto aparte (no en render: la regla `react-hooks/refs` del
  plugin estricto prohíbe escribir refs durante el render), así el timer no se re-arma en cada
  render. Guard `advanced` en el mismo ref para una sola salida (evita doble avance si timer y tap
  caen juntos).
- **Escape:** en el caso de auto-advance, un tap en cualquier parte de la pantalla llama `advance`
  ya (sin esperar el timer). Cuando hay botón "Continuar", el tap del fondo no hace nada (el botón
  es la acción explícita). No bloquea.
- **Tests:** 5 nuevos `it` de `resultNeedsContinue` (complete normal → auto-advance; hito menor →
  auto-advance; celebración → Continuar; hito grande → Continuar; celebración+hito menor →
  Continuar). El ruteo de App con DOM no se testeó (sin entorno DOM en Vitest, que corre en node).
- **Revisar en navegador (verificación del Director):** (1) complete NORMAL (sin nada especial):
  debe correr el juice — sprite pop + partículas + conteo + llenado de barra — y auto-avanzar al
  Home en ~2s con el toast "+X 💕"; (2) complete con CELEBRACIÓN (completar varias misiones hasta
  que el motor dispare R3): debe quedarse esperando "Continuar" (el usuario lee la línea del
  personaje y avanza); (3) hito MENOR (ej. week1 a los 7 días): juice + auto-advance + toast
  "✦ …" en el Home; (4) `prefers-reduced-motion` activado: el juice colapsa (sin pop/float, conteo
  directo) y el auto-advance es casi inmediato (~300ms); (5) tap durante el auto-advance: salta el
  timer y va al Home ya.

### 2026-06-14: Fase 4 Ola 1 visual — tokens + secuencia de completar misión
- Ola 1 del pulido visual (fuente de verdad: `equipo/fase4/direccion-visual.md` §1 y la
  subsección "Secuencia completar misión" de §3). SOLO tokens + la celebración al completar.
  NO se construyó at-risk, penalización sobria, level-scene ni boda (Olas 2-3). **160 tests en
  verde** (154 + 6 nuevos de `useCountUp`), lint y build limpios. NO se agregó ninguna
  dependencia (decisión del Director: CSS puro + Web Animations/rAF). NO se tocó git.
- **Tokens (`src/index.css`, antes solo importaba Tailwind):** bloque `@theme` con los valores
  EXACTOS del doc — roles de color (bg, surface, surface-soft, border, primary, primary-press,
  love, love-soft, risk, risk-strong, danger, milestone, ink/soft/faint, scene-dark,
  scene-abandon), fuentes display(mono)/body(sans), radios (card/cta/pill), sombras
  (card/cta/celebrate) y easings (--ease-spring, --ease-out-soft, --ease-in-quiet). Generan
  utilities (`bg-love`, `text-milestone`, `shadow-cta`, `rounded-cta`, etc.; verificado en el
  CSS compilado). `@keyframes` happy-pop, float-heart, bar-shimmer + sus clases
  `.animate-*`. Guard global `@media (prefers-reduced-motion: reduce)` que colapsa animaciones
  y transiciones a 1ms.
- **Hook `useCountUp(from, to, durationMs=800)` (`src/ui/hooks/useCountUp.ts`):** conteo con
  requestAnimationFrame. En prefers-reduced-motion, duración 0, sin cambio o sin rAF setea el
  valor final directo (el estado nace en `to` vía initializer perezoso, sin setState en efecto).
  La matemática vive en `countUpValue` (pura, testeable sin DOM): redondea a entero y el último
  frame cae EXACTO en `to`. Tests del hook en `useCountUp.test.ts` (6 `it`: progress 0 = from,
  progress >=1 = to exacto, rango/monotonía dentro de [from,to], clamp de negativos, count-DOWN,
  enteros).
- **Partículas `FloatingHearts` (`src/ui/components/FloatingHearts.tsx`):** CSS puro, 5-7 💕 que
  nacen del sprite y suben (keyframe float-heart, stagger 60ms, deriva-X aleatoria ±20px vía
  `--drift`). La aleatoriedad se congela en un initializer perezoso de useState (no re-aleatoriza
  en re-render; cumple la regla de pureza del nuevo plugin react-hooks).
- **`HeartsBar` (modificado):** corazón/relleno SIEMPRE `--color-love`, vacío `--color-love-soft`,
  borde `--color-border` (cohesión del doc). Nueva prop opcional `animateFromHearts`: la barra
  se llena con transition-[width] 800ms `--ease-out-soft` desde el progreso "antes", el número
  cuenta con useCountUp y dispara `bar-shimmer` una vez al terminar (~820ms). Sin la prop, el
  comportamiento es idéntico al anterior (pinta el ancho directo).
- **`MissionResultScreen` (modificado):** corre la secuencia de juice — sprite con
  `animate-happy-pop`, FloatingHearts saliendo del sprite, "+X 💕" con conteo animado
  (display mono, `--color-love`) y HeartsBar con `animateFromHearts = heartsTotal - heartsEarned`.
  Migrado a tokens (bg-bg, text-ink-soft, border/surface, primary/shadow-cta).
- **`CompleteMissionScreen` (modificado):** anti double-tap — el CTA "LO HICE"/"SÍ LO HICE (TARDE)"
  y "Aceptar la pérdida" se desactivan al instante en el primer toque (estado `acting`, guardas
  `guardedComplete`/`guardedAcceptLoss`); press-in `active:scale-95` con `--ease-spring` 120ms;
  radio unificado al token `rounded-cta` y shadow `shadow-cta`. La penalización (cancelar) NO se
  tocó en su lógica; solo el radio/disabled de bajo riesgo.
- Decisiones donde el doc no especificaba: (1) el valor "antes" de la barra/conteo se deriva como
  `heartsTotal - heartsEarned` (el character que llega a MissionResultScreen ya trae el total
  DESPUÉS de la misión); (2) el hook expone su matemática como función pura `countUpValue` para
  poder testearla sin DOM/rAF (el entorno de Vitest es `node`, sin window); (3) el "ease-out-soft"
  del conteo se aproxima con un ease-out cúbico en JS (el bezier exacto vive en CSS para width);
  (4) la barra usa un flag `moved` + ratios derivados en vez de un estado de ratio, para no
  llamar setState síncrono dentro del efecto (regla nueva del plugin react-hooks); (5) el shimmer
  se dispara a ~820ms (apenas después de la transición de 800ms del width).
- **Revisar en navegador con cuidado (verificación manual del Director):** la secuencia de
  completar (sprite pop + partículas + conteo + llenado de barra ocurre en
  `MissionResultScreen`, que solo aparece cuando hay celebración R3 o hito grande — para verla en
  un caso simple, completar misiones hasta que el motor de reactividad dispare una celebración);
  que el "+X 💕" cuente y la barra se llene y haga shimmer; que las partículas naden del sprite y
  suban con deriva; y que con prefers-reduced-motion activado todo colapse (sin pop, sin float,
  conteo en valor final directo). Nota: el sprite "feliz" hoy es el placeholder (no hay sprite
  feliz dedicado aún); el "pop" sí corre sobre el sprite actual.

### 2026-06-14 — Pulido Fase 4 ola A — clamp M2, fechas es-MX, hito menor toast, nudge de respaldo
- Cuatro arreglos de pulido de bajo riesgo. NO se tocó la economía de corazones, niveles ni
  el reloj de 21 días. **154 tests en verde** (147 + 7 nuevos `it`), lint y build limpios. NO se tocó git.
- **Clamp de la barra de corazones (bug QA M2):** `heartsToNextLevel` (`src/game/hearts.ts`)
  ahora acota `current` a `[0, total]` SOLO para presentación. heartsTotal puede caer bajo el
  piso del nivel (deuda por penalizaciones, nivel no baja: M-2026-06-11-A) o quedar por encima
  del techo (bajó de nivel con corazones intactos, TC-042); sin clamp la barra mostraba
  "-20/40" o "55/40". No cambia heartsTotal real ni la lógica de niveles. `HeartsBar` ya
  clampaba el ANCHO; ahora el TEXTO también es coherente. Test del clamp agregado (nivel 1 con
  0 → "0/40"; nivel 1 con 75 → "40/40").
- **Fechas en es-MX:** nuevo `formatShortDate` ("4 jun 2026", `Intl` es-MX) en `src/ui/format.ts`
  para fechas absolutas. Reemplazadas las 3 interpolaciones de fecha ISO cruda: "venció el …"
  (`CompleteMissionScreen`), "Juntos desde …" (`ProfileScreen`) y la fecha del historial del
  perfil (`ProfileScreen` HistoryRow). El resto ya usaba `formatDeadline`/`formatLongDate`; el
  `value={deadline}` del date picker se deja ISO (lo exige el input).
- **Hito menor como toast:** el hito con `big === false` (`week1`, `firstHard`) ya NO abre la
  pantalla de resultado. En AMBOS paths (completar misión y abrir el Perfil) se reconoce
  (`acknowledgeMilestone`) y se muestra como Toast ligero de App ("✦ …"); se agregó render del
  Toast al case `profile`. El hito GRANDE sigue como cuadro de Cupido. Excepción: si un hito
  menor coexiste con una celebración (R3) al completar, la pantalla de resultado se queda (por
  el +💕 y la celebración) y el hito menor viaja adentro como la pill ligera que ya existía
  (para no perderlo ni abrir doble surface).
- **Nudge de respaldo (ICE 504, mitiga el riesgo #1):** campo `lastExportDate: string | null`
  en `GameState` (raíz). `createEmptyState` → null. Migración EXACTA como onboarded/milestonesShown:
  `normalizeLoaded` inyecta null si ausente; `isValidState` acepta ausente o (null | fecha ISO
  real) y rechaza otro tipo (number, "ayer", etc.); NO sube SCHEMA_VERSION. Al exportar
  (`DataScreen handleExport` → callback `onExported` → App `handleExported`) se setea a today.
  En `HomeScreen`, banner discreto y descartable (en memoria, no persistente) que invita a
  respaldar si hay ≥1 personaje Y (lastExportDate es null O pasaron >14 días). Enlaza a Respaldo
  (`onOpenData`). Tono gentil. Tests de migración del campo nuevo (ausente → null; tipo inválido
  y fecha no-real → rechaza) y de createEmptyState; los 18 tests de C1 siguen pasando.

### 2026-06-14 — Motor de reactividad (R2+R3+A1)
- Construido el motor de reactividad aprobado en P8-a (spec del vault como fuente de verdad).
  Decisión del Director respetada: R3 (celebración de frecuencia) es SOLO texto + expresión,
  NO toca corazones. El motor no toca corazones, niveles ni el reloj de 21 días: capa de lectura.
  Única excepción de estado: el array `milestonesShown` de A1.
- **Motor puro** (`src/game/reaction.ts`): `reactionFor(character, missions, today, opts?)`
  determinista. Separa derivación de señales (`deriveSignals`, sección 1 del spec) de la
  selección (`selectState`, prioridad exacta: overdueDebt > atRisk > cameBack > nearLevelUp >
  firstDone > brandNew > firstHardDone > goodStreak > default). Variantes inyectadas por
  `opts.variantIndex` (sin Math.random). `cameBackAfterGap` se deriva del HUECO entre las dos
  últimas completedDate (no de inactivitySince, que se reinicia al completar — nota del spec).
- **Copy** (`src/game/reactionCopy.ts`): tablas de R2/R3/A1 con el texto EXACTO del spec,
  separadas de la lógica (agregar frases no toca el motor).
- **Modelo de datos (A1):** campo `milestonesShown: string[]` en `Character` (default []).
  `createCharacter` lo inicializa. `normalizeLoaded` (storage.ts) lo inyecta a respaldos viejos
  per-character, igual que `onboarded`, SIN subir SCHEMA_VERSION. `isValidCharacter` acepta el
  campo ausente (no rechaza respaldos viejos) pero SÍ rechaza si está presente con tipo inválido
  (coherente con C1). `acknowledgeMilestone(state, characterId, milestoneId)` en engine.ts
  (idempotente, estilo acknowledge*Scene).
- **Surfacing (sin rediseñar pantallas):** R2 idle en la cabecera del Perfil (línea del personaje
  + Cupido) y versión corta de una línea en el Home SOLO para el personaje en riesgo (Cupido no
  en el Home). R3 + A1 en una pantalla de resultado al completar (`MissionResultScreen`): +💕 →
  celebración del personaje → cuadro de Cupido (hito grande, reusa PresenterDialog) o toast ligero
  (hito menor). El hito también se evalúa al abrir el Perfil (por si se cruzó por el paso del
  tiempo). Convivencia P7-b respetada: un solo Cupido por evento; la subida de nivel mantiene su
  LevelScene sola (no se mezcla con R3/A1).
- **Tests:** un fixture por estado R2, por disparador R3, por hito A1 (incluyendo "ya mostrado ->
  no repite"), prioridad (overdueDebt gana sobre atRisk), variante determinista,
  acknowledgeMilestone (idempotente), y migración de milestonesShown en storage (respaldo viejo
  sin el campo se carga con [], tipo inválido se rechaza). Los 18 tests de C1 siguen pasando.
- Decisiones de implementación donde el spec no especificaba: (1) `cameBackAfterGap` usa umbral
  14 días (AT_RISK_DAYS) para el hueco; (2) R3 tiene su propio orden de prioridad de disparadores
  (perfectWeek > consecutiveDays > threeInWeek); (3) `perfectWeek` exige además cero penalizaciones
  en la ventana de 7 días (failed/cancelled, referenciadas por su deadline, ya que no tienen fecha
  propia); (4) el surfacing de R3/A1 se hizo en una pantalla de resultado nueva en vez de inyectar
  en CompleteMissionScreen, porque hoy el "+X 💕" es un toast, no una confirmación persistente;
  (5) la subida de nivel NO dispara la pantalla de resultado (la LevelScene ya es la celebración).
- **147 tests en verde** (114 + 33), `npm run lint` y `npm run build` limpios. NO se tocó git.

### 2026-06-13 — Onboarding con Cupido (Bloques 1-3)
- Construido el MVP del onboarding con presentador (spec-y-recurrencia.md + flujo-y-guion.md
  del vault). Tres bloques, tests primero en el más sensible (Bloque 1).
- **Bloque 1 (modelo de datos):** campo `onboarded: boolean` en `GameState`.
  `createEmptyState` lo pone en `false`. NO se subió SCHEMA_VERSION (subirlo borraría
  partidas). `normalizeLoaded(state)` (`onboarded = state.onboarded === false ? false : true`)
  se aplica en `loadState` e `importStateJson` DESPUÉS de validar: un respaldo viejo sin el
  campo se carga como `true` (no re-onboardea), `false` explícito se conserva, basura → `true`.
  `isValidState` NO usa `onboarded` como criterio de rechazo, así que los 18 tests de C1
  (campos corruptos) siguen cayendo a estado vacío sin cambios. 6 tests nuevos de migración.
- **Bloque 2 (gate de inicio):** `App.tsx` se partió en el gate (`App`) y el flujo normal
  (`Game`). Si `onboarded === false` se renderiza `StartScreen` ANTES de construir
  `buildStartup` (Riesgo R1: la máquina de escenas nunca evalúa un estado nuevo). "Iniciar
  partida" marca `onboarded:true` y persiste AL INICIAR (no al terminar, §2: un abandono a
  media intro cae a Home vacío, no a un loop). "Cargar partida" reusa el file picker (extraído
  a `ImportFileButton`, compartido con `DataScreen`) y fuerza `onboarded:true` (cargar archivo
  SIEMPRE omite el onboarding); archivo inválido muestra el error y se queda en la pantalla.
- **Bloque 3 (flujo del presentador):** `OnboardingFlow` orquesta intro (6 cuadros, texto
  exacto §2) → tutorial crear personaje → cuadro puente → tutorial crear primera misión →
  handoff. `PresenterDialog` (pantalla completa, click para avanzar, "saltar intro ›") y
  `CoachStrip` (franja inferior con Cupido en miniatura, no bloquea el resto). El tutorial
  envuelve las pantallas REALES `CreateCharacterScreen` y `CreateMissionScreen` con dos props
  nuevas opcionales (`tutorial` oculta Cancelar + spotlight con ring; callbacks para que
  Cupido reaccione al campo); sin esas props el comportamiento es idéntico al anterior.
  Encadena personaje → misión sin pasar por Home; "Empezar" cae al Home con 1 personaje + 1
  misión. Copy paso a paso exacto de §3.
- **Arte:** todo placeholder. Cupido es un recuadro con emoji por pose + etiqueta
  (`src/ui/components/Cupido.tsx`, punto único de import: swap por los 6 PNG trivial). Fondo:
  gradiente rosa sólido. Sin dependencias nuevas.
- Decisiones donde los docs no especificaban: (1) el spotlight del tutorial se hizo con props
  opcionales en las pantallas reales (ring + ocultar Cancelar) en vez de un overlay que
  adivine posiciones; (2) `App` se partió en `App`/`Game` para que `buildStartup` no corra
  nunca sobre un estado no onboardeado (R1); (3) la pantalla de inicio carga el respaldo SIN
  modal de confirmación (no hay nada que pisar, a diferencia de `DataScreen`); (4) el paso
  "recompensa" del tutorial de misión se dispara cuando el formulario queda válido.
- **114 tests en verde** (108 + 6 de `onboarded`), `npm run lint` y `npm run build` limpios.
  NO se tocó git. Bloque 4 (recap de regreso) queda como follow-up.

### 2026-06-12 — P4 derecho de réplica + P5 deadline hoy
- Implementadas las decisiones P4 y P5 de Hector (DECISIONS.md del vault, 2026-06-12).
- **P5 (deadline hoy):** `createMission` ahora recibe `today` y valida que el deadline no
  sea anterior a hoy (`deadline_in_past`); el date picker de `CreateMissionScreen` tiene
  `min = hoy`. `rescheduleMission` valida la fecha nueva ANTES de cancelar para no penalizar
  un cambio que no va a suceder. Nota: antes el motor no validaba el deadline (solo la UI);
  ahora la regla vive en ambos lados.
- **P4 (derecho de réplica):** `checkExpiredMissions` se eliminó del motor (era el auto-fallo
  al abrir); `buildStartup` ya solo corre el check de abandono + re-hidratación de flags.
  `completeMission` acepta misiones vencidas y aplica el multiplicador por retraso
  (`calcHeartsEarned`, hasta hoy sin uso real). Acción nueva `acceptMissionLoss` = el flujo
  anterior (failed + penalización + escena de cancelación), ahora como decisión del usuario.
  `CompleteMissionScreen` muestra las dos opciones con preview de la recompensa reducida.
  `checkAbandonment` no cambió: el reloj de abandono sigue corriendo igual.
- **Tope de 3 pendientes:** las vencidas SIGUEN contando para el tope (la deuda ocupa
  espacio). Resolver la vencida (completar tarde o aceptar la pérdida) libera el cupo.
- Decisiones de implementación donde el doc no especificaba: sin ventana límite para
  completar tarde (piso 25% para siempre, hasta que el abandono se lleve al personaje);
  `acceptMissionLoss` solo exige que la misión esté pendiente (la UI es la que la ofrece
  únicamente para vencidas); el máximo de 14 días sigue siendo validación solo de UI.
- Docs actualizados con notas de decisión: `mecanicas-detalle.md` §4 (repo y vault),
  `flujo-pantallas.md` (rango del deadline y Pantalla 4, repo y vault), `qa-report.md`
  (nota de obsolescencia de TC-016/TC-024/TC-025/TC-040, mismo precedente que heartsTotal).
- Tests adaptados (TC-016/024/025/040 al contrato nuevo) + 15 nuevos (multiplicador con
  1/3/5/30 días de retraso, aceptar pérdida, tope con vencidas, buildStartup sin auto-fallo,
  deadline hoy/ayer): **108 tests en verde**, lint y build limpios.

### 2026-06-12 — Fixes de auditoría QA (C1, M1)
- Reporte del QA Auditor (auditoria-qa.md en el vault): 1 crítico, 2 mayores. Se
  corrigieron los dos marcados como bloqueantes antes de Fase 4.
- **C1 (crítico):** `isValidState` solo validaba schemaVersion y que los 3 campos fueran
  arrays; un respaldo con campos internos corruptos (fecha "ayer", heartsTotal string,
  status inventado) se importaba, se persistía, y brickeaba la app en la siguiente
  apertura (RangeError en los checks). Fix: validación profunda campo por campo de cada
  character/mission/happyEnding en `storage.ts` (tipos, enums, fechas ISO reales:
  rechaza también "2026-02-31"). `importStateJson` ahora devuelve `invalid_schema` para
  esos archivos y `loadState` cae a estado vacío en vez de explotar.
- **M1 (mayor):** los flags `pendingAbandonmentScene`/`pendingCancellationScene` eran
  write-only: si la app se cerraba durante una escena (o se importaba un respaldo con
  flags en true), la consecuencia narrativa se perdía para siempre. Fix: la construcción
  de escenas de apertura se extrajo de `App.tsx` a una función pura `buildStartup`
  (`src/game/startup.ts`) que además re-hidrata los flags que siguen en true sin
  duplicar las escenas de los checks de hoy. Para cancelaciones re-hidratadas usa la
  misión failed/cancelled más reciente del personaje como referencia; si no existe
  ninguna, limpia el flag sin escena (sin crash).
- 26 tests nuevos (16 de respaldos corruptos en `storage.test.ts`, 10 de `buildStartup`
  en `src/game/startup.test.ts`): **93 tests en verde**, lint y build limpios.

### 2026-06-11 (8) — Fase 3 cerrada + respaldo de datos en la UI
- Hector confirmó que la escena de cancelación ya se ve con su ilustración: **Fase 3
  completada** (abandono y cancelación verificados con paso de tiempo real).
- Respaldo de datos (deuda de Fase 2): nueva `DataScreen.tsx` ("Respaldo") con exportar
  (descarga JSON con fecha en el nombre) e importar (valida con `importStateJson`,
  distingue JSON inválido de schema incorrecto, y pide confirmación con el conteo de lo
  que se va a cargar antes de reemplazar el estado).
- Acceso: botón 💾 discreto en el footer del Home (`onOpenData`), pantalla nueva en el
  router de `App.tsx` (`handleImportState` reemplaza el estado completo y muestra toast).
- Limpieza de ramas mergeadas hecha: el repo queda solo con `master`.
- `.claude/launch.json` agregado para verificación visual con el preview de Claude Code.
- Verificado en navegador real: Home con botón 💾, pantalla Respaldo renderiza, volver
  funciona, sin errores de consola. 67 tests, lint y build limpios.

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
