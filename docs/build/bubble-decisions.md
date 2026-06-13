# Bubble.io — Decisiones Técnicas de Implementación
# Habit Dating Sim · MVP

Versión: 1.0
Fecha: 2026-05-31
Autor: Agente Builder

Convenciones de este documento:
- **Acción Bubble** = tipo de step en un Bubble Workflow
- `Campo` = nombre exacto del campo en la DB
- *Elemento* = elemento en el canvas de Bubble

---

## Decisión 0: Arquitectura general de workflows

Bubble tiene dos tipos de workflows:
1. **Page Workflows** — corren cuando el usuario hace una acción en el frontend (click, page load, etc.)
2. **Backend Workflows** — corren en el servidor, pueden ser programados (API Workflows con Schedule).

Para MVP con plan gratuito o Starter de Bubble:
- Los Backend Workflows **existen en Starter**, pero el **Recurring Backend Workflow** (que corre en loop automático sin trigger del usuario) requiere plan **Growth o superior**.
- **Workaround para MVP sin plan Growth**: Usar "Schedule API Workflow on a list" disparado desde el page load del Home. Cada vez que el usuario abre la app, se corren las verificaciones de deadline y abandono. No es tiempo real — corre cuando el usuario visita la app. Para una app personal de hábitos, esto es aceptable.

Este workaround se detalla en cada workflow relevante.

---

## Workflow 1: Marcar misión completa

**Trigger:** Usuario hace click en botón "Completar" en la pantalla de misión (Pantalla 4).
**Precondición:** Mission.status = pending Y Mission.deadline > Current date/time (timestamp exacto — si el timestamp actual supera el deadline, el botón no aparece).

### Pasos:

**Step 1 — Make changes to a Thing (Mission)**
- Thing: la misión actual (Current Page Mission o la misión del repeating group)
- Cambios:
  - `status` → completed
  - `completed_date` → Current date/time
  - `hearts_awarded` → según difficulty:
    - Si difficulty = easy → 5
    - Si difficulty = medium → 10
    - Si difficulty = hard → 18
  - Usar "Set list" con condición: Bubble permite usar `:filtered` o una condición en el campo. Más simple: usar Custom States para guardar el delta antes del step.

> **Implementación recomendada para el delta:** Crear un Custom State en la página llamado `hearts_delta` (tipo number). En el step previo al workflow (o como primer step), setear este Custom State:
> - Condición: `Current Mission's difficulty = easy` → Set State hearts_delta = 5
> - Condición: `Current Mission's difficulty = medium` → Set State hearts_delta = 10
> - Condición: `Current Mission's difficulty = hard` → Set State hearts_delta = 18
> 
> Bubble no tiene un "switch/case" nativo, pero se puede lograr con workflows condicionales (Only when) en múltiples steps o usando un Custom State.

**Step 2 — Make changes to a Thing (Character)**
- Thing: Current Mission's character
- Cambios:
  - `hearts_total` → Current Mission's character's hearts_total + hearts_delta (Custom State)
  - `hearts_current` → Current Mission's character's hearts_current + hearts_delta
  - `last_mission_completed_date` → Current date/time

**Step 3 — Verificar si sube de nivel (condicional)**

Bubble permite poner condición "Only when" en cada step. Usar tres steps condicionales, uno por cada transición:

**Step 3a — Only when:** `Current Mission's character's hearts_total ≥ 20 AND Current Mission's character's level = 0`
- Make changes to Character: `level` → 1
- Luego: Navigate to Pantalla 5 (Escena de nivel) con parámetro `level=1`

**Step 3b — Only when:** `Current Mission's character's hearts_total ≥ 60 AND Current Mission's character's level = 1`
- Make changes to Character: `level` → 2
- Navigate to Pantalla 5 con parámetro `level=2`

**Step 3c — Only when:** `Current Mission's character's hearts_total ≥ 140 AND Current Mission's character's level = 2`
- Make changes to Character: `level` → 3, `status` → happy_ending
- Disparar Workflow 4 (subir a nivel 3 / boda)

**Step 4 — Si no hubo subida de nivel:** mostrar popup o element de feedback "¡+X corazones!" y regresar a pantalla de perfil del personaje.

> **Nota de orden en Bubble:** Los steps condicionales se evalúan en orden. Si el usuario llega a 140 corazones de golpe desde nivel 0 (imposible con la mecánica, pero por seguridad), el step 3c no se activaría porque primero pasaría por 3a. En la práctica esto no puede ocurrir dado que las subidas son graduales. No requiere manejo especial en MVP.

---

## Workflow 2: Detectar abandono (3 semanas de inactividad)

**Definición:** Un personaje tiene inactividad si `last_mission_completed_date` es más de 21 días antes de hoy, O si `last_mission_completed_date` está vacío y `created_date` es más de 21 días antes de hoy.

**Trigger:** Page load del Home (Pantalla 1). Esto es el workaround para MVP sin Recurring Backend Workflow.

### Implementación:

**Opción A (recomendada para MVP): Backend Workflow + Schedule desde Page Load**

1. Crear un **Backend Workflow** llamado `check_abandonment` que recibe un parámetro `character` (tipo Character).

   Pasos internos del Backend Workflow:
   
   **Step 1 — Only when:** `character's last_mission_completed_date < Current date/time - 21 days AND character's status = active`
   O cuando `character's last_mission_completed_date is empty AND character's created_date < Current date/time - 21 days AND character's status = active`

   **Step 2 — Verificar nivel actual:**
   
   **Step 2a — Only when:** `character's level > 0`
   - Make changes to Character: `level` → character's level - 1
   - Nota: esto crea una señal para mostrar la escena de abandono la próxima vez que el usuario visite el perfil. Agregar un campo `pending_abandonment_scene` (yes/no) al Character para disparar la escena.
   
   **Step 2b — Only when:** `character's level = 0`
   - Disparar Workflow 5 (abandono en nivel 0)

2. En el **Page Load del Home**, agregar un workflow:
   - Acción: "Schedule API Workflow on a list"
   - List: `Search for Characters` con filtro `created_by = Current User` AND `status = active`
   - Workflow a disparar: `check_abandonment`
   - Start date: Current date/time (inmediato)

> **Limitación:** Si el usuario no abre la app por semanas, el check no corre. Para una app de hábitos personales esto es aceptable — si no la abre, tampoco está usando los hábitos. El efecto es que la penalización aplica la próxima vez que abre la app.

> **Campo adicional necesario en Character:** `pending_abandonment_scene` (yes/no, default: no). Cuando el backend detecta inactividad y baja nivel, setea esto a `yes`. En el Home o en el Perfil del personaje, al cargar la página: "If Current Character's pending_abandonment_scene = yes → Navigate to Pantalla 6 → luego Make changes to Character: pending_abandonment_scene = no".

**Opción B (más simple pero menos robusta):** No usar Backend Workflow. En el Page Load del Home, hacer un Search for Characters directamente y mostrar estado de riesgo como visual (texto "En riesgo de abandono" en la card). El usuario ve la advertencia pero la penalización se aplica manualmente desde un botón. No recomendado — rompe la mecánica automática.

---

## Workflow 3: Deadline vencido (misión expirada)

> **Obsoleto desde 2026-06-12 (decisión P4 de Hector — derecho de réplica):** este workflow
> automático ya no existe en la app. Una misión vencida queda pendiente (visible como
> "vencida") hasta que el usuario decida en la Pantalla 4: completarla tarde con recompensa
> reducida o "Aceptar la pérdida" (que aplica los pasos de abajo de forma manual). Ver nota
> en `mecanicas-detalle.md` §4.

**Definición:** Mission.status = pending AND Mission.deadline < fecha de hoy.

**Trigger:** Igual que Workflow 2 — se detecta en Page Load del Home o en Page Load de la pantalla de Perfil del personaje.

### Implementación:

**Backend Workflow** llamado `check_expired_missions`, recibe parámetro `mission` (tipo Mission).

**Pasos internos:**

**Step 1 — Only when:** `mission's deadline < Current date/time AND mission's status = pending` (comparación por timestamp exacto)

**Step 2 — Make changes to Mission:**
- `status` → failed
- `hearts_awarded` → penalización según difficulty (negativo):
  - easy → -3
  - medium → -5
  - hard → -8

**Step 3 — Make changes to Character (mission's character):**
- `hearts_total` → character's hearts_total + hearts_awarded (el valor ya es negativo)
- Si `hearts_total` queda < 0: verificar trigger (ver Step 4)

> **Decisión de diseño (Hector, 2026-05-31):** `hearts_total` SÍ puede bajar con penalizaciones. `level` es campo separado que NUNCA baja — solo sube cuando hearts_total cruza los umbrales. Cuando hearts_total llega a negativo se disparan los triggers de abandono o cancelación.

**Step 4 — Only when:** `mission's character's hearts_total < 0`
- Disparar Workflow 2 check de abandono para este personaje (o mostrar escena de cancelación dependiendo del contexto)
- La lógica de qué trigger disparar depende de si la penalización fue por misión vencida (escena cancelación) o abandono (escena abandono)

**Step 4 — Señalizar escena de cancelación:**
- Agregar campo `pending_cancellation_scene` (yes/no) al Character (o a la Mission si quieres mostrar cuál fue).
- Make changes to Character: `pending_cancellation_scene` → yes

**En Page Load del Perfil de personaje:**
- If `Current Character's pending_cancellation_scene = yes` → Navigate to Pantalla 7 → luego reset flag.

**Schedule desde Page Load del Home:**
- "Schedule API Workflow on a list"
- List: `Search for Missions` con filtro `status = pending AND deadline < Current date/time AND character's created_by = Current User`
- Workflow: `check_expired_missions`

> **Nota:** Combinar el Schedule del Home en un solo workflow de "mantenimiento" que corra `check_abandonment` y `check_expired_missions` en secuencia reduce el número de pasos en el Page Load.

---

## Workflow 4: Subir de nivel (caso especial nivel 3 — boda)

Este workflow es llamado desde el Step 3c del Workflow 1 cuando `hearts_total ≥ 140` y `level = 2`.

### Pasos:

**Step 1 — Make changes to Character:**
- `level` → 3
- `status` → happy_ending
- `slot_number` → vacío (empty) — esto libera el slot

**Step 2 — Create a new Thing (HappyEnding):**
- `character_name` → Current Character's name
- `original_character` → Current Character
- `wedding_date` → Current date/time
- `total_missions_completed` → Search for Missions (character = Current Character, status = completed):count
- `total_hearts_earned` → Current Character's hearts_total
- `created_by` → Current User

**Step 3 — Navigate to Pantalla 5 con parámetro `scene=wedding`**
- La pantalla de escena detecta el parámetro y muestra la imagen de boda en lugar de la imagen de subida de nivel.

**Step 4 — Desde la Pantalla 5 (botón "continuar" de la escena de boda):**
- Navigate to Home
- El Home ya no muestra ese slot como activo (Character.slot_number está vacío → el slot aparece como disponible)

> **Decisión de UX:** El Character con status=happy_ending queda en la DB pero sin slot_number. La pantalla de Home filtra Characters con `status = active`. La pantalla de Happy Endings (si se implementa) filtra Characters con `status = happy_ending` o usa el tipo HappyEnding directamente.

---

## Workflow 5: Abandono en nivel 0 — reseteo completo del slot

Llamado desde el Step 2b del Workflow 2 cuando `character's level = 0`.

**Lógica:** El personaje "te corta y se va". El slot queda completamente libre.

### Pasos:

**Step 1 — Make changes to Character:**
- `status` → abandoned
- `slot_number` → vacío (empty)
- `pending_abandonment_scene` → yes (para mostrar escena la próxima visita)

> **Decisión:** El Character abandonado queda en la DB con status=abandoned para historial. No se elimina. Solo pierde su slot_number, igual que el happy_ending. Si prefieres eliminarlo, usar "Delete a Thing" en lugar de Make changes — pero perderías el historial de misiones asociadas. Recomendado: no eliminar en MVP.

**Step 2 — Las misiones pending de este personaje:**
- Opcionalmente marcarlas como cancelled o dejarlas como pending. Recomendado: hacer un "Schedule API Workflow on a list" para marcarlas como `failed` (estado final limpio).
- Lista: `Search for Missions (character = Current Character, status = pending)`
- Acción en cada una: `status → failed`

**Step 3 — La pantalla de abandono (Pantalla 6):**
- Se muestra gracias al flag `pending_abandonment_scene` al cargar el Perfil del personaje o el Home.
- Después de mostrar la escena, el Home ya no muestra ese slot como activo.

---

## Workflow 6: Cancelación de misión (usuario quiere cambiar fecha)

**Trigger:** Usuario hace click en "Cambiar fecha" o "Cancelar misión" en la pantalla de misión.

> **Decisión de diseño:** En MVP, "cancelar" y "cambiar la fecha" son el mismo evento: la misión original se marca como cancelled, se aplica la penalización, y si el usuario quiere hacer una nueva misión con nueva fecha, crea una nueva desde cero. No se edita la fecha de la misión existente.

### Pasos:

**Step 1 — Make changes to Mission:**
- `status` → cancelled
- `hearts_awarded` → penalización según difficulty (negativo: -3/-5/-8)

**Step 2 — Make changes to Character:**
- `hearts_total` → character's hearts_total + hearts_awarded (negativo)
- Si `hearts_total` queda < 0: navegar directamente a Pantalla 7 (escena de cancelación) — el trigger ya ocurrió

**Step 3 — Navigate to Pantalla 7 (escena de cancelación)**

**Step 4 — Desde Pantalla 7, botón "continuar":**
- Navigate to Pantalla 3 (Crear misión) si el usuario quiere crear la misión nueva, O
- Navigate to Perfil del personaje

---

## Condición "slot vacío" en Home (Pantalla 1)

### Estructura del Home:

El Home muestra exactamente 3 slots. Cada slot es un Group o un elemento visual que puede mostrar dos estados: "activo" o "vacío/disponible".

**Implementación recomendada: Repeating Group con slots hardcodeados**

Dado que siempre son exactamente 3 slots, la forma más simple en Bubble es:

1. Crear 3 Groups en el canvas (no un Repeating Group), uno por slot: `Group_Slot1`, `Group_Slot2`, `Group_Slot3`.

2. Dentro de cada Group, dos sub-groups:
   - `Subgroup_Active`: visible cuando hay un Character activo en ese slot
   - `Subgroup_Empty`: visible cuando no hay Character activo en ese slot

3. **Data source de cada Group:**
   - `Group_Slot1` → Type: Character → Data source: `Search for Characters (created_by = Current User, status = active, slot_number = 1):first item`
   - Ídem para slots 2 y 3.

4. **Condición de visibilidad:**
   - `Subgroup_Active` → visible when: `Parent Group's Character is not empty`
   - `Subgroup_Empty` → visible when: `Parent Group's Character is empty`

5. **Botón "Crear personaje" en Subgroup_Empty:**
   - Navigate to Pantalla de creación de personaje con parámetro `slot=1` (o 2, o 3 según el slot)
   - Al crear el personaje, setear `slot_number` = el parámetro recibido.

> **Por qué no un Repeating Group aquí:** Un RG con 3 items requeriría una lista hardcodeada de slots (1, 2, 3) que Bubble no maneja nativamente sin una tabla auxiliar. Los 3 Groups separados son más directos, más fáciles de diseñar individualmente, y no tienen overhead técnico dado que siempre son exactamente 3.

---

## Indicador de riesgo en Home

**Lógica:** Mostrar badge o texto "En riesgo" en la card de un personaje si `last_mission_completed_date < Current date/time - 14 days` (2 semanas, como advertencia antes de las 3 semanas de penalización).

**Implementación:**
- Dentro del `Subgroup_Active` de cada slot, agregar un elemento Text o Icon llamado `Risk_Badge`.
- Condición del elemento: `visible when Parent Group's Character's last_mission_completed_date < Current date/time - 14 days`
- O usar la fórmula: `Current date/time - Parent Group's Character's last_mission_completed_date > 14 days`

> Bubble permite restar fechas y obtener un número de días. La expresión exacta en el expression editor: `(Current date/time - Parent Group's Character's last_mission_completed_date) / 86400` da los días transcurridos (la resta de fechas en Bubble da segundos). Comparar ese resultado con 14 para la advertencia y 21 para la penalización.

---

## Campos adicionales requeridos en Character (no en el schema original)

Estos campos emergieron del diseño de workflows. Agregar al Data Type Character:

| Campo                       | Tipo    | Descripción                                                         |
|-----------------------------|---------|---------------------------------------------------------------------|
| pending_abandonment_scene   | yes/no  | Flag para mostrar escena de abandono la próxima vez que el usuario entre |
| pending_cancellation_scene  | yes/no  | Flag para mostrar escena de cancelación por deadline vencido        |
| pending_level_up_scene      | yes/no  | Flag alternativo si se prefiere no navegar inmediatamente al completar misión |

> Nota: `pending_level_up_scene` es opcional si la navegación a la escena de nivel ocurre inmediatamente en el Workflow 1. Se vuelve necesario solo si se usa un Backend Workflow asíncrono para el check de nivel.

---

## Limitaciones documentadas de MVP

| Limitación | Impacto | Workaround |
|------------|---------|------------|
| Sin Recurring Backend Workflow en plan Starter | Los checks de abandono y deadline no corren automáticamente | Se corren en page load del Home — aplican cuando el usuario abre la app |
| Sin notificaciones push | El usuario no sabe que una misión venció si no abre la app | Fuera de scope MVP. En el futuro: integrar con Mailchimp vía Zapier para email reminder |
| Resta de fechas en Bubble da segundos, no días | Fórmulas de inactividad requieren dividir por 86400 | Documentado arriba. Verificar en el expression editor que la unidad sea correcta |
| No hay estado "slot vacío" como objeto DB | La ausencia de Character activo en un slot_number es el estado vacío | Se maneja con condicionales en el canvas — documentado en Workflow 6 |

---

## Orden de construcción recomendado en Bubble

1. Crear todos los Option Sets
2. Crear todos los Data Types con sus campos (incluir los campos adicionales de este doc)
3. Crear las 7 pantallas en blanco con nombres claros
4. Construir el Home con la lógica de 3 slots (Workflow 6 / condición slot vacío)
5. Construir Crear personaje + Crear misión (pantallas de input, workflows de Create)
6. Construir Workflow 1 (marcar misión completa) — es el core loop
7. Construir Workflow 4 (nivel 3 / boda) — dependiente de Workflow 1
8. Construir los Backend Workflows (check_abandonment, check_expired_missions)
9. Conectar los Backend Workflows al page load del Home
10. Construir las pantallas de escenas (5, 6, 7) con sus condiciones de display
11. Construir la pantalla de Perfil del personaje (Pantalla 2)
12. QA end-to-end con casos de prueba
