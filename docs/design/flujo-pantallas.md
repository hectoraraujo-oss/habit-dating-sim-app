---
tipo: propuesta
creado: 2026-05-31
actualizado: 2026-05-31
tags: [habit-dating-sim, ux, diseño, bubble, mvp]
estado: activo
---

# Flujo de Pantallas — Habit Dating Sim MVP

Documento de referencia para el Agente de Bubble. Cada pantalla está especificada al nivel de implementación. Si algo aquí es ambiguo, no lo interpretes — revisa la sección "Decisiones pendientes para Hector" al final.

---

## Pantalla 1: Home

### Propósito
Punto de entrada principal. El usuario ve el estado actual de sus relaciones (hábitos), decide qué personaje atender hoy, y puede crear un nuevo hábito si tiene slots disponibles.

### Elementos en pantalla

**Header:**
- Título de la app (logo/nombre pixel art)
- Fecha actual (formato: Sábado, 31 mayo)

**Sección principal — Grid de personajes activos (máximo 3 slots):**

Cada slot puede estar en 3 estados:
- **Ocupado (hábito activo):** Muestra sprite del personaje + nombre del hábito + barra de corazones actual + nivel actual (1/2/3) + indicador de estado (ver estados especiales)
- **En riesgo:** Mismo contenido pero con visual de alerta (sprite triste, barra parpadeante o icono de advertencia)
- **Vacío:** Slot con símbolo "+" y texto "Crear personaje" — accionable

**Misiones pendientes (debajo del grid):**
- Lista de misiones activas con fecha límite próxima, agrupadas por personaje
- Cada ítem muestra: nombre de misión + personaje al que pertenece + fecha límite + dificultad (icono o color)
- Acción disponible: tap en misión → ir a Marcar misión completa

**Footer de navegación:**
- Icono Home (activo)
- Icono de cada personaje activo (acceso rápido a Perfil de personaje)

### Navegación

| Origen | Destino | Trigger |
|--------|---------|---------|
| — | Home | Apertura de app / botón Back desde cualquier pantalla |
| Home | Perfil de personaje | Tap en card de personaje |
| Home | Crear misión | Tap en "+" dentro de card de personaje (no el slot vacío) |
| Home | Marcar misión completa | Tap en misión pendiente |
| Home | Crear personaje (flujo) | Tap en slot vacío |
| Home | Escena de abandono | Automático si sistema detecta inactividad de 21 días al abrir app |

### Datos que necesita

```
Personajes activos del usuario:
- character_id, name, sprite_id, level (1-3), current_hearts, hearts_to_next_level
- last_activity_date (para calcular estado de riesgo)
- slot_position (1, 2, 3)

Misiones activas (estado = pending):
- mission_id, character_id, name, difficulty, due_date, created_date
- Ordenadas por due_date ASC
```

### Wireframe en texto

```
+------------------------------------------+
| [LOGO]              Sábado, 31 mayo      |
+------------------------------------------+
|                                          |
|  [ SLOT 1 ]   [ SLOT 2 ]   [ SLOT 3 ]   |
|  [sprite]     [sprite]     [  +  ]       |
|  "Ejercicio"  "Lectura"    Crear         |
|  Lv.2         Lv.1         personaje     |
|  ♥♥♥♥♥░░░░   ♥♥░░░░░░░                  |
|  [+ misión]   [+ misión]                 |
|                                          |
+------------------------------------------+
|  MISIONES PENDIENTES                     |
|  ──────────────────                      |
|  ● Correr 20 min     [Ejercicio] hoy  ⚡ |
|  ● Leer 15 págs      [Lectura]   mañana  |
|  ● Correr 30 min     [Ejercicio] jue   ★ |
+------------------------------------------+
|  [🏠]         [👤 EJ]      [👤 LE]      |
+------------------------------------------+
```

Leyenda dificultad: ⚡ = Fácil, ★ = Media, ★★ = Difícil

### Estados especiales

**Estado: Sin personajes (primera vez)**
- Los 3 slots muestran "+" con texto "Crea tu primer personaje"
- Sin sección de misiones pendientes
- Copy motivacional breve: "Tus relaciones aparecen aquí. Empieza creando una."

**Estado: Personaje en riesgo de abandono (entre 14 y 21 días de inactividad)**
- Sprite del personaje cambia a versión "triste" o con efecto visual distinto (no roto aún, pero preocupado)
- Barra de corazones con animación de pulso o color diferente (rojo/naranja)
- Badge de advertencia: "⚠ Necesita atención"
- El personaje aparece primero en el grid independientemente de su slot

**Estado: Hábito en nivel 3 (consolidado)**
- Badge especial en la card: "✓ Consolidado"
- El sprite puede tener un aura o efecto visual diferenciador

---

## Pantalla 2: Perfil de personaje

### Propósito
Vista detallada de un hábito/personaje específico. El usuario ve el historial completo de misiones, el progreso de amor, y puede crear nueva misión para ese personaje.

### Elementos en pantalla

**Header del personaje:**
- Sprite grande del personaje (o ilustración de nivel actual)
- Nombre del hábito/personaje
- Nivel actual (1 / 2 / 3) con texto de etapa: Nivel 1 = "Conocidos", Nivel 2 = "Amigos cercanos", Nivel 3 = "Amor consolidado"
- Barra de progreso de corazones: X / Y corazones para siguiente nivel (o "Máximo alcanzado" en Lv.3)
- Fecha de inicio del hábito
- "Tiempo juntos": días desde creación

**Estadísticas rápidas (fila horizontal):**
- Misiones completadas total
- Racha actual (días consecutivos con al menos 1 misión completada en la semana)
- Misiones canceladas (dato honesto, visible)

**Historial de misiones (lista scrollable):**
- Agrupado por semana
- Cada ítem: nombre de misión + dificultad + fecha completada/cancelada + corazones ganados/perdidos
- Misiones pendientes aparecen al tope con indicador visual distinto
- Estado visual por ítem: completada (verde/check), cancelada (gris/x), pendiente (amarillo/reloj)

**Botón de acción primario:**
- "Crear nueva misión" — prominente, siempre visible

### Navegación

| Origen | Destino | Trigger |
|--------|---------|---------|
| Home | Perfil de personaje | Tap en card de personaje |
| Perfil | Home | Botón Back / header |
| Perfil | Crear misión | Tap en "Crear nueva misión" |
| Perfil | Marcar misión completa | Tap en misión pendiente del historial |
| Perfil | Escena de nivel | Automático si al cargar la pantalla hay nivel pendiente de mostrar |

### Datos que necesita

```
Personaje:
- character_id, name, sprite_id, level, current_hearts, hearts_to_next_level
- created_date, last_activity_date

Misiones del personaje (todas):
- mission_id, name, difficulty, status (pending/completed/cancelled)
- created_date, due_date, completed_date, cancelled_date
- hearts_earned (positivo o negativo)
- Ordenadas: pending primero, luego completed/cancelled por fecha DESC
```

### Wireframe en texto

```
+------------------------------------------+
| ← Back                                   |
+------------------------------------------+
|          [SPRITE GRANDE]                 |
|          "Ejercicio"                     |
|          Nivel 2 — Amigos cercanos       |
|          ♥♥♥♥♥♥░░░░░░  60/100 💕         |
|          Juntos desde: 2026-04-01        |
+------------------------------------------+
|   ✓ 18    🔥 3 sem.    ✗ 2 cancel.       |
|  misiones  racha        (dato honesto)   |
+------------------------------------------+
|  HISTORIAL                               |
|  ──────────────────                      |
|  ESTA SEMANA                             |
|  ⏳ Correr 30 min      Difícil  vence hoy|
|  ✓ Correr 20 min      Fácil   28 may +5♥|
|                                          |
|  SEMANA ANTERIOR                         |
|  ✓ Correr 20 min      Fácil   21 may +5♥|
|  ✗ Correr 45 min      Difícil  cancel -3♥|
|  ✓ Estirar 10 min     Fácil   19 may +5♥|
+------------------------------------------+
|       [ + CREAR NUEVA MISIÓN ]           |
+------------------------------------------+
```

### Estados especiales

**Sin misiones aún (personaje recién creado):**
- Historial vacío con copy: "Crea tu primera misión. Las relaciones se construyen con acciones, no con intenciones."
- Botón de crear misión más prominente (centro de pantalla)

**Personaje en Nivel 3 (consolidado):**
- Barra de corazones muestra "Hábito consolidado ✓" en lugar de barra de progreso
- No hay "siguiente nivel" — el juego aquí cambia a mantener (ver Decisiones pendientes)

---

## Pantalla 3: Crear misión

### Propósito
Formulario para definir una nueva misión para un personaje específico. Simple y rápido — no debe sentirse como burocracia.

### Elementos en pantalla

**Header:**
- "Nueva misión para [nombre del personaje]"
- Sprite pequeño del personaje como recordatorio visual

**Formulario (3 campos únicamente):**

1. **Nombre de la misión** (text input)
   - Placeholder: "¿Qué vas a hacer?"
   - Límite: 60 caracteres
   - Obligatorio

2. **Dificultad** (selector de 3 opciones, no dropdown — visual prominente)
   - Fácil: ⚡ — descripción: "Puedo hacerlo incluso cansado"
   - Media: ★ — descripción: "Requiere esfuerzo real"
   - Difícil: ★★ — descripción: "Me va a costar, pero vale la pena"
   - Preseleccionado: Media (la opción intermedia)

3. **Fecha límite** (date picker)
   - Default: 3 días desde hoy
   - Rango permitido: mañana hasta 14 días desde hoy (no mismo día, no más de 2 semanas)
   - Mostrar: día de la semana + fecha (ej. "Jueves 4 junio")

**Preview de recompensa (debajo del formulario, se actualiza en tiempo real):**
- "Si completas esto ganarás: +X 💕"
- Se actualiza al cambiar dificultad

**Botón primario:**
- "Confirmar misión"

**Advertencia de contexto (siempre visible, pequeña):**
- "Cambiar la fecha límite después penaliza corazones."

### Navegación

| Origen | Destino | Trigger |
|--------|---------|---------|
| Home o Perfil | Crear misión | Tap en "+" o "Crear nueva misión" |
| Crear misión | Home | Confirmación exitosa |
| Crear misión | Origen (Home o Perfil) | Cancelar / Back sin guardar |

### Datos que necesita

```
Personaje al que pertenece:
- character_id, name, sprite_id

Para mostrar preview:
- Tabla de corazones por dificultad (constante del sistema, no BD)
```

### Wireframe en texto

```
+------------------------------------------+
| ← Cancelar                               |
| Nueva misión para [👤 Ejercicio]         |
+------------------------------------------+
|                                          |
|  ¿Qué vas a hacer?                       |
|  [________________________________]      |
|                                          |
|  Dificultad:                             |
|  +----------+----------+-----------+     |
|  |    ⚡    |    ★    |    ★★    |     |
|  |  Fácil   |  Media  |  Difícil  |     |
|  | Incluso  |Esfuerzo | Me va a   |     |
|  | cansado  | real    | costar    |     |
|  +----------+[SELECTED]+-----------+     |
|                                          |
|  Fecha límite:                           |
|  [  Jueves 4 junio  ▾  ]                |
|                                          |
|  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  |
|  Si completas esto ganarás: +10 💕       |
|  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  |
|                                          |
|  ⚠ Cambiar la fecha después penaliza    |
|  corazones                               |
|                                          |
|       [ CONFIRMAR MISIÓN ]               |
+------------------------------------------+
```

### Estados especiales

**Validación de formulario:**
- Botón "Confirmar" deshabilitado hasta que nombre no esté vacío y dificultad esté seleccionada
- Si el usuario intenta confirmar sin nombre: campo resaltado en rojo + "Dale un nombre a esta misión"

**Límite de misiones pendientes:**
- Si el personaje ya tiene 3 misiones pendientes: pantalla muestra aviso antes del formulario: "Ya tienes 3 misiones activas con [personaje]. Completa alguna antes de crear otra."
- Formulario deshabilitado en este estado (ver Decisiones pendientes)

---

## Pantalla 4: Marcar misión completa

### Propósito
Momento de mayor satisfacción del juego. El usuario confirma que cumplió una misión. La interacción debe sentirse como un pequeño ritual de reconocimiento, no un simple checkbox.

### Elementos en pantalla

**Header:**
- Nombre de la misión
- Subtítulo: "[Personaje] · [Dificultad] · vencía [fecha]"

**Zona central — el momento del check:**
- Sprite del personaje (neutral/esperanzado)
- Botón grande y prominente: "✓ Lo hice" (o símbolo de corazón grande pulsable)
- El botón NO es pequeño — ocupa espacio central significativo, invita al tap

**Debajo del botón (siempre visible antes de confirmar):**
- "Ganarás +X 💕 al confirmar"

**Acción secundaria (pequeña, no prominente):**
- "Cancelar esta misión" — texto link, no botón — con consecuencia visible: "(-Y 💕)"

### Navegación

| Origen | Destino | Trigger |
|--------|---------|---------|
| Home o Perfil | Marcar completa | Tap en misión pendiente |
| Marcar completa | Escena de nivel | Automático si completar la misión sube el nivel |
| Marcar completa | Home | Confirmación exitosa sin subida de nivel |
| Marcar completa | Escena de cancelación | Tap en "Cancelar esta misión" |

### Datos que necesita

```
Misión:
- mission_id, name, difficulty, due_date, hearts_reward

Personaje:
- character_id, name, sprite_id, level, current_hearts, hearts_to_next_level
```

### Wireframe en texto

```
+------------------------------------------+
| ← Volver                                 |
+------------------------------------------+
|                                          |
|  Correr 20 minutos                       |
|  Ejercicio · Fácil · vencía hoy         |
|                                          |
|         [SPRITE PERSONAJE]              |
|         (expresión esperanzada)         |
|                                          |
|                                          |
|         +--------------------+          |
|         |                    |          |
|         |     ✓ LO HICE      |          |
|         |                    |          |
|         +--------------------+          |
|                                          |
|            +5 💕 al confirmar           |
|                                          |
|                                          |
|      cancelar esta misión (-3 💕)        |
|                                          |
+------------------------------------------+
```

### Flujo de interacción al presionar "Lo hice"

1. Tap en botón
2. Animación breve: sprite del personaje cambia a expresión feliz / pequeña animación de corazones flotando
3. Contador de corazones en pantalla sube visualmente (animación de conteo)
4. Si no hay subida de nivel: pantalla regresa a Home con feedback toast "¡Misión completada! +X 💕"
5. Si hay subida de nivel: transición a Pantalla 5 (Escena de nivel)

### Estados especiales

**Misión vencida (fecha límite pasada, aún pendiente):**
- Header muestra "venció el [fecha]" en color de alerta
- Copy de contexto: "Llegó tarde, pero vale la pena cumplir. Ganarás menos corazones."
- La recompensa se reduce (ver mecanicas-detalle.md para el multiplicador exacto)
- El botón sigue funcionando — el usuario puede completar misiones tardías con penalización

**Solo para el Agente de Bubble:** La acción "cancelar misión" en esta pantalla debe registrar el evento de cancelación y redirigir a Pantalla 7 (Escena de cancelación), no simplemente borrar la misión.

---

## Pantalla 5: Escena de nivel

### Propósito
Momento de celebración al subir de nivel. Es una pantalla de pausa narrativa — el juego reconoce el progreso del usuario con una ilustración específica de ese personaje en ese nivel.

### Elementos en pantalla

**Pantalla completa — inmersiva:**
- Ilustración estática de pixel art que ocupa la mayor parte de la pantalla (la "escena")
  - Nivel 1→2: escena narrativa del personaje (ej. "por fin se dieron el primer abrazo")
  - Nivel 2→3: escena más íntima o significativa
- Texto narrativo breve (2-3 líneas) debajo o superpuesto a la ilustración
  - Tono: segunda persona, el personaje le habla al usuario
  - Ej. "Llevas 30 días cuidándome. No lo olvidaré."
- Indicador de nivel alcanzado: "Nivel 2 — Amigos cercanos"
- Estadística motivacional: "X días juntos · Y misiones completadas"

**Botón de salida (único):**
- "Continuar" — abajo, al centro
- No hay Back en esta pantalla — el usuario debe verla antes de salir

### Navegación

| Origen | Destino | Trigger |
|--------|---------|---------|
| Marcar misión completa | Escena de nivel | Automático al detectar nivel nuevo |
| Escena de nivel | Home | Tap en "Continuar" |

**Importante:** Esta pantalla se muestra una sola vez por subida de nivel. Si el usuario la cierra (Continuar), no se vuelve a mostrar automáticamente. El personaje en Home simplemente estará en el nuevo nivel.

### Datos que necesita

```
Personaje:
- character_id, name, sprite_id, level (el nuevo nivel alcanzado)
- days_together (calculado: today - created_date)
- total_missions_completed

Ilustración:
- scene_asset_id (combinación de sprite_id + nivel — tabla de assets)
- narrative_text (tabla de textos narrativos por personaje + nivel — puede ser predefinido o configurable)
```

### Wireframe en texto

```
+------------------------------------------+
|                                          |
|  ┌──────────────────────────────────┐   |
|  │                                  │   |
|  │     [PIXEL ART SCENE]            │   |
|  │     (ilustración nivel 2)        │   |
|  │     full-width, ~60% altura      │   |
|  │                                  │   |
|  └──────────────────────────────────┘   |
|                                          |
|       ★ Nivel 2 alcanzado               |
|       Amigos cercanos                   |
|                                          |
|  "Llevas 30 días cuidándome.            |
|   No lo olvidaré."                      |
|                                          |
|  30 días juntos · 18 misiones           |
|                                          |
|         [ CONTINUAR ]                   |
|                                          |
+------------------------------------------+
```

### Estados especiales

Esta pantalla no tiene estados alternativos — siempre aparece en el mismo formato. La variación es el asset de ilustración y el texto narrativo.

**Para el Agente de Bubble:** Cuando se registra la subida de nivel en la BD, marcar un flag `level_up_shown = false` en el registro del personaje. Cuando se muestra esta pantalla, actualizar a `true`. Así se puede detectar si hay un nivel pendiente de mostrar en otros flujos.

---

## Pantalla 6: Escena de abandono

### Propósito
Consecuencia emocional del abandono. Se activa automáticamente cuando el sistema detecta 21 días sin ninguna actividad en un personaje. Es la pantalla más crítica emocionalmente — debe tener peso, no ser casual.

### Elementos en pantalla

**Pantalla completa — inmersiva, tono oscuro:**
- Ilustración estática de pixel art: el personaje despidiéndose / yéndose
- Texto narrativo (3-4 líneas) — el personaje habla al usuario en segunda persona
  - Tono: no acusatorio, pero sí de cierre real. No es "intentémoslo de nuevo".
  - Ej. "Esperé 21 días. Creo que ambos sabemos cómo terminó esto. Cuídate."
- Dato de contexto: "Tu relación con [nombre] duró X días"

**Debajo de la ilustración:**
- Resumen de la relación: misiones completadas, nivel máximo alcanzado
- Texto: "Este slot ahora está libre"

**Un solo botón:**
- "Despedirme" o "Cerrar este capítulo"
- Al presionar: animación de cierre (ej. fade out del sprite, slot se vacía)
- Regresa a Home con slot reseteado

### Navegación

| Origen | Destino | Trigger |
|--------|---------|---------|
| Home (apertura de app) | Escena de abandono | Automático: sistema detecta 21 días de inactividad al abrir app |
| Escena de abandono | Home | Tap en "Cerrar este capítulo" (slot ya reseteado) |

**Nota de implementación para Bubble:** El sistema debe verificar la fecha de `last_activity_date` de cada personaje al cargar la app. Si `today - last_activity_date >= 21 días` Y el personaje no está ya en estado `abandoned`, se activa este flujo antes de que el usuario vea Home.

Si hay múltiples personajes en abandono simultáneo, mostrar una escena por personaje en secuencia antes de llegar a Home.

### Datos que necesita

```
Personaje en abandono:
- character_id, name, sprite_id, level (nivel máximo alcanzado)
- created_date, last_activity_date
- total_missions_completed
- days_together (today - created_date)

Ilustración:
- abandonment_scene_asset_id (asset único por personaje, o genérico por nivel)
```

### Wireframe en texto

```
+------------------------------------------+
|  (sin header, pantalla inmersiva)        |
|                                          |
|  ┌──────────────────────────────────┐   |
|  │   [PIXEL ART: personaje         │   |
|  │    dándose la vuelta /          │   |
|  │    alejándose / oscuro]         │   |
|  └──────────────────────────────────┘   |
|                                          |
|  "Esperé 21 días.                       |
|   Creo que ambos sabemos               |
|   cómo terminó esto. Cuídate."         |
|                                          |
|  ── Tu relación con Ejercicio ──        |
|  Duró 45 días · Llegaste al Nivel 2    |
|  Completaste 18 misiones               |
|                                          |
|  Este slot ahora está libre.            |
|                                          |
|      [ CERRAR ESTE CAPÍTULO ]           |
|                                          |
+------------------------------------------+
```

### Estados especiales

**Si el personaje nunca llegó al Nivel 1 completo (muy temprano):**
- Texto narrativo diferente: tono más de "nos conocimos poco"
- Estadísticas muestran pocos días y pocas misiones — no esconder, mostrar con honestidad

**Para el Agente de Bubble:** Al confirmar la escena de abandono, el registro del personaje debe actualizarse a `status: abandoned`, guardar el `abandonment_date`, y el slot queda disponible para un nuevo personaje. NO borrar el registro — mantener historial con `status: abandoned`.

---

## Pantalla 7: Escena de cancelación

### Propósito
Consecuencia emocional de cancelar una misión (cambiar su fecha límite o eliminarla). Más leve que el abandono, pero con peso real. Refuerza que las decisiones tienen costo.

### Elementos en pantalla

**Pantalla semi-inmersiva (no full-screen como abandono):**
- Ilustración de la escena de cancelación (pixel art) en la parte superior, como en las demás escenas. (Decisión de Hector 2026-06-11: reemplaza al sprite con expresión de decepción que pedía la versión original de este doc.)
- Texto narrativo breve (2 líneas) en segunda persona
  - Ej. "Okay. Lo entiendo. Pero ya sabes lo que cuesta esto."
- Misión cancelada: nombre + dificultad (para que el usuario vea qué canceló)
- Corazones perdidos: "-X 💕" en rojo, prominente

**Barra de corazones actualizada:**
- Muestra el estado actual de corazones después de la penalización
- Animación de reducción

**Un solo botón:**
- "Entendido"
- Regresa a Home o Perfil (dependiendo de dónde vino)

### Navegación

| Origen | Destino | Trigger |
|--------|---------|---------|
| Marcar misión completa | Escena de cancelación | Tap en "Cancelar esta misión" |
| Escena de cancelación | Home | Tap en "Entendido" |

### Datos que necesita

```
Misión cancelada:
- mission_id, name, difficulty, original_due_date

Personaje:
- character_id, name, sprite_id
- hearts_before_cancellation
- hearts_after_cancellation (calculado antes de mostrar)
- hearts_penalty (constante del sistema por dificultad)
```

### Wireframe en texto

```
+------------------------------------------+
| ← (sin back — deben ver la escena)      |
+------------------------------------------+
|                                          |
|       [SPRITE: expresión decepción]     |
|                                          |
|  "Okay. Lo entiendo.                    |
|   Pero ya sabes lo que cuesta esto."   |
|                                          |
|  Cancelaste: Correr 30 minutos          |
|              Dificultad: Difícil        |
|                                          |
|             -5 💕                       |
|                                          |
|  ♥♥♥♥♥░░░░░░░░░  45/100 💕             |
|  (barra actualizada post-penalización)  |
|                                          |
|            [ ENTENDIDO ]                |
+------------------------------------------+
```

### Estados especiales

**Si la cancelación lleva los corazones a 0:**
- Texto narrativo diferente: tono de "esto está en el límite"
- Aviso adicional: "Si dejas de atender a [personaje], podría irse."
- Botón cambia a: "Entendido. No lo olvidaré."

**Para el Agente de Bubble:** La penalización de corazones se registra en el mismo momento que se crea la escena de cancelación, no al presionar "Entendido". El "Entendido" solo navega de vuelta.

---

## Flujo completo — mapa de navegación

```
                    [APP ABRE]
                        │
                        ▼
              ¿Hay abandono pendiente?
               Sí ──► [P6: ABANDONO] ──► [HOME]
               No ──► [HOME]
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
    Tap personaje  Tap misión   Tap slot vacío
           │       pendiente         │
           ▼            │            ▼
    [P2: PERFIL]        │     [P3: CREAR MISIÓN]
           │            │            │
    Tap "crear          │     Confirmar ──► [HOME]
     misión"            │
           │            ▼
           └──► [P4: MARCAR COMPLETA]
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
        Sube nivel          No sube nivel
              │                    │
              ▼                    ▼
     [P5: ESCENA NIVEL]          [HOME]
              │
              ▼
           [HOME]
```

---

## Decisiones pendientes para Hector

### D1: Límite de misiones pendientes por personaje

**Ambigüedad:** No está definido si hay un límite de misiones pendientes simultáneas por personaje.

**Opciones:**
- A) Sin límite — el usuario puede apilar misiones pendientes infinitamente
- B) Límite de 3 — tiene 3 pendientes y no puede crear más hasta completar alguna
- C) Límite de 5 — más permisivo

**Impacto en UX:** Sin límite puede crear ansiedad y abandono por acumulación. Con límite muy bajo (3) puede frustrar usuarios con múltiples compromisos.

**Recomendación:** Límite de 3 pendientes por personaje. Consistente con la filosofía de "pocos pero reales".

---

### D2: ¿Qué pasa al llegar a Nivel 3?

**Ambigüedad:** El brief define Nivel 3 como "hábito consolidado (~66 días)", pero no especifica si el juego continúa, termina, o cambia.

**Opciones:**
- A) El personaje queda "completo" — slot bloqueado, el usuario puede ver su historia pero no crear más misiones
- B) El personaje entra en modo "mantenimiento" — sigue habiendo misiones, corazones no suben más, pero sí pueden bajar (penalización por inactividad sigue activa)
- C) El personaje se "gradúa" — libera el slot, el hábito pasa a otro tipo de registro (historial permanente), y el usuario puede crear un nuevo hábito en ese slot

**Impacto en UX:** Afecta el long-term loop del juego. Sin resolución, el Agente de Bubble no puede construir la lógica de Nivel 3.

**Recomendación:** Opción B (modo mantenimiento). Razón: el objetivo científico del tracker es que el hábito se sostenga, no que se "termine". El juego continúa siendo útil.

---

### D3: ¿Misiones vencidas reducen recompensa o no cuentan?

**Ambigüedad:** El brief no especifica qué pasa si el usuario marca como completa una misión cuya fecha límite ya pasó.

**Opciones:**
- A) Misión vencida = 0 corazones. Se puede marcar completa pero sin recompensa.
- B) Misión vencida = recompensa reducida (ej. 50% de los corazones normales)
- C) Misión vencida = no se puede marcar completa después de la fecha límite (se convierte en cancelada automáticamente)

**Impacto en UX:** La opción C es punitiva y puede frustrar a usuarios con vida real. La opción A parece justa pero puede incentivar procrastinación. La opción B balancea.

**Recomendación:** Opción B (50% de corazones). Permite flexibilidad pero no premia igual que cumplir a tiempo.

---

### D4: ¿El trigger de abandono se activa solo al abrir la app o también por notificación?

**Ambigüedad:** El brief dice "trigger automático por inactividad" pero no define el canal.

**Opciones:**
- A) Solo al abrir la app — el usuario ve la escena de abandono la próxima vez que entra
- B) Notificación push antes de los 21 días (ej. a los 14 días: "⚠ [Personaje] te ha estado esperando") + escena al abrir si llega a 21

**Impacto en implementación:** Las notificaciones push en Bubble.io requieren configuración adicional (plugin). Para MVP, puede quedar fuera.

**Recomendación:** Para MVP, solo al abrir la app (opción A). Notificaciones pueden ser v2. Documentar en backlog.
