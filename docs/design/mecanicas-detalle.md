---
tipo: propuesta
creado: 2026-05-31
actualizado: 2026-05-31
tags: [habit-dating-sim, mecanicas, sistema-puntos, bubble, mvp]
estado: activo
---

# Mecánicas de Sistema — Habit Dating Sim MVP

Documento de referencia para el Agente de Bubble. Todos los números están justificados desde los parámetros científicos. Si un número aquí contradice algo en `flujo-pantallas.md`, este documento tiene precedencia para la lógica de datos.

---

## 1. Sistema de corazones por dificultad

### Derivación matemática desde parámetros científicos

El parámetro base: **Nivel 3 = ~66 días de cumplimiento consistente.**

Frecuencia mínima para no decaer: **2 misiones/semana.**

Objetivo del sistema de puntos: que un usuario que cumple el **mínimo viable** (2 misiones/semana, dificultad Fácil) alcance Nivel 3 en aproximadamente 66 días, sin que se sienta imposible ni trivial.

**Calculando:**

- 66 días = ~9.4 semanas ≈ 9 semanas completas
- 2 misiones/semana × 9 semanas = **18 misiones mínimas** para llegar al Nivel 3
- Un usuario promedio (no mínimo, no máximo) probablemente hace 3 misiones/semana con dificultad mixta

Para que el sistema tenga tensión real, el progreso con el mínimo debe sentirse lento pero posible. El progreso con esfuerzo alto debe sentirse significativamente más rápido.

### Puntos por dificultad

| Dificultad | Corazones ganados | Justificación |
|------------|-------------------|---------------|
| Fácil      | +5 💕             | Base mínima viable |
| Media      | +10 💕            | Doble de Fácil — esfuerzo real merece reconocimiento real |
| Difícil    | +18 💕            | 3.6x de Fácil — no lineal, recompensa el riesgo de proponerse algo ambicioso |

**Por qué no lineal (5/10/15):** Una progresión lineal no refleja la diferencia real de dificultad. Difícil no es "un poco más" que Media — es una categoría diferente. La diferencia 5/10/18 crea incentivo real para subir de dificultad.

**Por qué Difícil no es 20 o más:** Evitar que el usuario juegue "solo missiones difíciles" como exploit. A 18 puntos, Difícil sigue siendo mejor que Fácil, pero no tan superior como para hacer irrelevante a Media.

---

## 2. Costo en corazones por nivel

### Derivación

Nivel 3 con mínimo viable (18 misiones Fácil × 5 corazones = 90 corazones totales). El sistema de tres niveles debe distribuir esos 90 corazones de forma que cada nivel se sienta progresivamente más "caro" emocionalmente, reflejando que la relación se profundiza.

**Distribución propuesta:**

| Nivel | Corazones requeridos | Descripción del nivel | Tiempo estimado (mínimo viable) |
|-------|---------------------|----------------------|--------------------------------|
| 0 → 1 | 20 💕               | De extraños a conocidos | ~2 semanas (4 misiones Fácil) |
| 1 → 2 | 40 💕               | De conocidos a amigos cercanos | ~4 semanas (8 misiones Fácil) |
| 2 → 3 | 80 💕               | De amigos a amor consolidado | ~8 semanas (16 misiones Fácil) |
| **Total** | **140 💕**      | Hábito consolidado | ~14 semanas con mínimo Fácil |

**Revisión con mezcla realista (60% Fácil, 30% Media, 10% Difícil, 2.5 misiones/semana):**
- Corazones/misión promedio: 0.6×5 + 0.3×10 + 0.1×18 = 3 + 3 + 1.8 = **7.8 💕 por misión**
- Misiones para 140 corazones: 140 / 7.8 = ~18 misiones
- A 2.5 misiones/semana: 18 / 2.5 = **~7.2 semanas**

Con esfuerzo promedio realista, el usuario llega al Nivel 3 en ~50-55 días. Con mínimo absoluto (Fácil, 2/semana), ~70-80 días. Ambos cercanos al objetivo científico de 66 días. ✓

**Rationale para cada transición:**
- **0→1 (20):** Rápido a propósito. Las primeras 2 semanas son críticas para el enganche. Si el juego tarda en dar la primera recompensa, el usuario abandona antes de que el hábito prenda.
- **1→2 (40):** Doble del primer nivel. Ya hay compromiso establecido, el usuario puede aguantar más espera.
- **2→3 (80):** El más costoso — equivale a los dos anteriores juntos. Este nivel representa el umbral científico real de consolidación. Debe sentirse ganado.

### Visualización de progreso en pantalla

La barra de corazones siempre muestra el progreso **dentro del nivel actual**, no el total acumulado.

Ejemplo en Nivel 1:
- Usuario tiene 25 corazones totales (ya pasó el umbral de 20 para Nivel 1)
- Barra muestra: `(25-20) / 40 = 5/40` para el siguiente nivel
- Display: "5/40 💕 para Nivel 2"

Ejemplo en Nivel 2:
- Usuario tiene 75 corazones totales
- Barra muestra: `(75-60) / 80 = 15/80`
- Display: "15/80 💕 para Nivel 3"

**Formato visual de la barra:**
- Barra horizontal dividida en segmentos (no porcentaje numérico)
- Corazones llenos (♥) vs. corazones vacíos (♡)
- Número exacto mostrado al lado: "15/80 💕"
- Para pantallas pequeñas: icono de corazón + fracción: "💕 15/80"

---

## 3. Penalización por cancelación de misión

### Número y justificación

| Dificultad de la misión cancelada | Corazones perdidos |
|----------------------------------|-------------------|
| Fácil                             | -3 💕              |
| Media                             | -5 💕              |
| Difícil                           | -8 💕              |

**Principio de diseño:** La penalización es proporcional a la dificultad, pero siempre menor que la recompensa. El usuario pierde más de lo que perdería "no haciéndola", pero no tanto como para que cancelar sea catastrófico.

**Rationale por dificultad:**
- Fácil cancelada: -3 vs. +5 ganados si se cumple. El costo de cancelar = 60% del premio. Duele un poco.
- Media cancelada: -5 vs. +10 ganados. El costo = 50% del premio.
- Difícil cancelada: -8 vs. +18 ganados. El costo = 44% del premio. Proporcionalmente menos punitivo — comprometerse con algo difícil y necesitar cancelar es más comprensible.

**¿Pueden los corazones llegar a negativo?** No. El mínimo es 0. Si la penalización llevaría los corazones por debajo de 0, quedan en 0. Esto evita que el usuario sienta que está "en deuda" — el mínimo es el punto de ruptura real (ver: escena de abandono).

---

## 4. Penalización por misión vencida (completada tarde)

Cuando el usuario completa una misión después de su fecha límite:

| Tiempo de retraso | Corazones ganados |
|------------------|-------------------|
| 0 días (a tiempo) | 100% de la recompensa |
| 1-3 días tarde    | 75% de la recompensa |
| 4-7 días tarde    | 50% de la recompensa |
| Más de 7 días tarde | 25% de la recompensa |

**Redondeo:** siempre hacia arriba. Si la recompensa es 5 × 75% = 3.75, el usuario recibe 4 💕.

**Justificación:** Un sistema de todo-o-nada (tarde = 0 puntos) es demasiado punitivo para hábitos del mundo real. Un gradiente suave premia igual de completo a quien llega tarde, pero no premia igual — mantiene el incentivo de cumplir a tiempo.

---

## 5. Flujo completo: marcar misión completa (segundo a segundo)

**Condiciones de entrada:**
- Usuario está en Pantalla 4 (Marcar misión completa)
- Toca el botón "✓ Lo hice"

**Secuencia de eventos (en orden):**

```
T+0ms    Usuario toca botón "Lo hice"
         → Botón se desactiva inmediatamente (evitar double-tap)

T+100ms  Animación: sprite del personaje cambia a expresión feliz
         → Duración: 400ms

T+200ms  Se calcula la recompensa:
         → Verificar si misión está vencida (today > due_date)
         → Aplicar multiplicador de tiempo si aplica
         → Calcular hearts_earned (redondeado hacia arriba)

T+400ms  Animación: corazones flotando desde el sprite hacia arriba
         → Duración: 600ms
         → Simultáneo con la animación del sprite

T+500ms  Base de datos (escrituras en paralelo):
         → mission.status = "completed"
         → mission.completed_date = today
         → mission.hearts_earned = [calculado]
         → character.current_hearts += hearts_earned
         → character.last_activity_date = today
         → character.total_missions_completed += 1

T+600ms  Sistema evalúa si hubo subida de nivel:
         → Leer character.current_hearts
         → Comparar con umbral del siguiente nivel
         → Si current_hearts >= umbral: NIVEL SUBE

T+800ms  Animación: contador de corazones en pantalla sube
         → Animación de conteo numérico: de [valor antes] a [valor después]
         → Duración: 800ms

T+1600ms BIFURCACIÓN:
         → Si NO hubo subida de nivel:
              → Navegar a Home
              → Mostrar toast: "¡Misión completada! +X 💕"
              → Toast dura 2.5 segundos

         → Si SÍ hubo subida de nivel:
              → Actualizar character.level += 1
              → Actualizar character.level_up_shown = false
              → Transición a Pantalla 5 (Escena de nivel)
              → Transición: fade in, no instantánea (300ms)
```

**Total de tiempo percibido por el usuario:** ~2-3 segundos de animaciones antes de ver la siguiente pantalla. Suficiente para que se sienta significativo, no tanto para que se sienta lento.

---

## 6. Flujo automático: detección de abandono

> **Decisión de Hector (2026-06-11):** el reloj de abandono nunca para. Por cada 21 días
> completos de inactividad se aplica UNA bajada de nivel (con escena de abandono), y las
> bajadas se acumulan si el usuario vuelve después de mucho tiempo (ej. 45 días en nivel 2 →
> baja a nivel 0). En nivel 0, el siguiente período de 21 días hace que el personaje se vaya
> (slot liberado). El contador se reinicia al completar una misión, y avanza 21 días por cada
> bajada aplicada para no penalizar dos veces el mismo período.

**Condición de activación:**
`today - character.last_activity_date >= 21 días` Y `character.status = "active"`

**¿Cuándo se verifica?**
Al cargar la app (Page Load de la Home page en Bubble). No se verifica en background — es reactivo al abrir la app.

**Secuencia de eventos:**

```
EVENTO: Usuario abre la app

T+0ms    App inicia carga de Home

T+carga  Query a BD: todos los personajes activos del usuario
         → Filtrar: status = "active"
         → Para cada personaje: calcular days_inactive = today - last_activity_date

T+carga  Evaluación por personaje:
         → Si days_inactive >= 21:
              marcar character.abandonment_pending = true
         → Si 14 <= days_inactive < 21:
              marcar character.at_risk = true (afecta visual en Home, no flujo)

T+carga  ¿Hay algún personaje con abandonment_pending = true?
         → SÍ: NO mostrar Home todavía → ir a flujo de abandono
         → NO: mostrar Home normalmente

FLUJO DE ABANDONO (si hay pending):
T+0ms    Seleccionar el primer personaje con abandonment_pending = true
T+0ms    Navegar a Pantalla 6 (Escena de abandono) con datos de ese personaje

T+usuario presiona "Cerrar este capítulo":
         → character.status = "abandoned"
         → character.abandonment_date = today
         → character.slot liberado (slot_position queda como NULL o disponible)
         → character.level_up_shown se mantiene (dato histórico)

T+300ms  ¿Hay otro personaje con abandonment_pending = true?
         → SÍ: navegar a siguiente Escena de abandono
         → NO: navegar a Home (con slot ya libre)
```

**Registro histórico:** Los personajes abandonados NO se borran de la BD. Se mantienen con `status: "abandoned"` para historial futuro (ej. pantalla de "relaciones pasadas" en v2).

---

## 7. Estado de riesgo de abandono (14-21 días)

No es una pantalla aparte — es un estado visual en Home y Perfil.

**Condición:** `14 <= days_inactive < 21`

**Efectos visuales en Home:**
- El personaje aparece primero en el grid (reordenamiento automático)
- Sprite usa versión "triste" (requiere asset adicional por personaje)
- Barra de corazones: color cambia a naranja/rojo (en lugar del color base)
- Badge: "⚠ Necesita atención"

**Efectos en Perfil:**
- Banner en la parte superior: "Tu relación con [nombre] lleva X días sin misiones. Tiene [21-days_inactive] días antes de que se vaya."
- Color del banner: naranja si 14-17 días, rojo si 18-20 días

---

## 8. Resumen de variables en base de datos

Para referencia del Agente de Bubble al construir los Data Types.

### Data Type: Character (Personaje/Hábito)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| user | User | Propietario |
| name | text | Nombre del hábito/personaje |
| sprite_id | text | Referencia al asset de sprite |
| slot_position | number (1-3) | Slot en el grid de Home |
| status | option set | active / abandoned |
| level | number (0-3) | Nivel actual |
| current_hearts | number | Corazones acumulados (global) |
| last_activity_date | date | Última misión completada |
| created_date | date | Fecha de creación |
| total_missions_completed | number | Contador total |
| level_up_shown | yes/no | Flag para saber si se mostró escena de nivel |
| abandonment_pending | yes/no | Flag temporal para flujo de abandono |
| abandonment_date | date | Fecha en que fue abandonado (si aplica) |
| at_risk | yes/no | Flag de estado de riesgo (14-21 días) |

### Data Type: Mission (Misión)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| character | Character | Personaje al que pertenece |
| name | text | Nombre de la misión |
| difficulty | option set | easy / medium / hard |
| status | option set | pending / completed / cancelled |
| due_date | date | Fecha límite |
| created_date | date | Fecha de creación |
| completed_date | date | Fecha de completado (si aplica) |
| cancelled_date | date | Fecha de cancelación (si aplica) |
| hearts_earned | number | Corazones ganados (positivo) o penalización (negativo) |
| was_late | yes/no | Si se completó después del due_date |
| days_late | number | Cuántos días tarde se completó |

### Constantes del sistema (no BD — valores fijos en el frontend)

```
HEARTS_EASY = 5
HEARTS_MEDIUM = 10
HEARTS_HARD = 18

LEVEL_THRESHOLDS = {
  level_1: 20,   // corazones acumulados para alcanzar nivel 1
  level_2: 60,   // 20 + 40
  level_3: 140   // 20 + 40 + 80
}

CANCEL_PENALTY = {
  easy: -3,
  medium: -5,
  hard: -8
}

LATE_MULTIPLIER = {
  on_time: 1.0,
  late_1_3_days: 0.75,
  late_4_7_days: 0.50,
  late_8_plus_days: 0.25
}

ABANDONMENT_DAYS = 21
AT_RISK_DAYS = 14
MIN_MISSIONS_PER_WEEK = 2
MAX_CHARACTERS = 3
MAX_PENDING_MISSIONS_PER_CHARACTER = 3  // ver Decisión D1 en flujo-pantallas.md
```

---

## 9. Cálculo de corazones: función de referencia

Para el Agente de Bubble al construir los workflows:

```
FUNCIÓN: calcular_hearts_earned(difficulty, due_date, completed_date)

  base_hearts = HEARTS_EASY | HEARTS_MEDIUM | HEARTS_HARD  // según difficulty
  
  days_late = MAX(0, completed_date - due_date)
  
  SI days_late == 0:
    multiplier = 1.0
  SINO SI days_late <= 3:
    multiplier = 0.75
  SINO SI days_late <= 7:
    multiplier = 0.50
  SINO:
    multiplier = 0.25
  
  hearts_earned = CEILING(base_hearts × multiplier)
  
  RETURN hearts_earned


FUNCIÓN: calcular_nuevo_nivel(current_hearts)

  SI current_hearts >= 140: RETURN 3
  SI current_hearts >= 60: RETURN 2
  SI current_hearts >= 20: RETURN 1
  RETURN 0


FUNCIÓN: hearts_para_siguiente_nivel(level, current_hearts)

  thresholds = [0, 20, 60, 140]
  
  SI level >= 3: RETURN 0  // ya está en máximo
  
  proximo_umbral = thresholds[level + 1]
  corazones_en_nivel_actual = current_hearts - thresholds[level]
  costo_nivel = proximo_umbral - thresholds[level]
  
  RETURN {
    actual: corazones_en_nivel_actual,
    total: costo_nivel,
    display: corazones_en_nivel_actual + "/" + costo_nivel
  }
```

---

## Decisiones pendientes para Hector

*(Complementa las decisiones en flujo-pantallas.md — estas son específicas de mecánicas)*

### M1: ¿Los corazones pueden bajar por inactividad semanal?

**Ambigüedad:** El brief menciona "estado de decaimiento" si hay menos de 2 misiones/semana. No está definido si este decaimiento es solo visual (personaje triste) o también numérico (pérdida de corazones).

**Opciones:**
- A) Solo visual: el personaje cambia de estado pero los corazones no bajan. El "abandono" a los 21 días es el único reset real.
- B) Decaimiento numérico: por cada semana sin cumplir las 2 misiones mínimas, el personaje pierde X corazones automáticamente.

**Impacto:** La opción B es más fiel a la ciencia (los hábitos sí se debilitan sin práctica), pero agrega complejidad técnica (job programado en Bubble para correr semanalmente) y puede frustrar usuarios que regresan después de un break y encuentran su progreso reducido.

**Recomendación:** Para MVP, opción A (solo visual). El abandono a los 21 días ya es consecuencia suficiente. Decaimiento numérico puede ser v2 con mejor comunicación al usuario.

---

### M2: ¿Qué pasa con los corazones en Nivel 3 (consolidado)?

Si el personaje está en Nivel 3 y el usuario sigue haciendo misiones, los corazones siguen acumulando pero no hay siguiente nivel. ¿Qué muestra la barra?

**Opciones:**
- A) La barra desaparece — se muestra solo "✓ Consolidado" sin contador
- B) La barra sigue llenándose pero muestra "Mantenimiento" — el usuario acumula corazones sin propósito mecánico pero como ritual
- C) Los corazones en Nivel 3 forman un "fondo de reserva" — si el usuario falla, primero pierde del fondo antes de bajar de nivel

**Recomendación:** Opción C. Añade profundidad estratégica al largo plazo sin complicar el MVP. El "fondo de reserva" es fácil de implementar en Bubble y da sentido a seguir haciendo misiones en Nivel 3.

---

### M3: ¿Existe algún mecanismo de recuperación de corazones no ligado a misiones?

**Ambigüedad:** El sistema actual solo gana corazones por completar misiones. No hay otra forma de recuperarlos.

**Opciones:**
- A) Ninguna — las misiones son el único input. Simple y limpio.
- B) Racha semanal bonus: si el usuario completa las 2 misiones mínimas 3 semanas seguidas, recibe un bonus de corazones.
- C) Misión especial (difícil modo "apuesta"): el usuario puede crear una misión con recompensa amplificada, pero si la cancela la penalización es mayor.

**Recomendación:** Para MVP, opción A. Los bonuses de racha (B) son deseables como motivador, pero agregan un contador adicional en la BD y lógica de tracking semanal. Para v2.
