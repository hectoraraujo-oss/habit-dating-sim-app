# Bubble.io — Database Schema
# Habit Dating Sim · MVP

Versión: 1.0
Fecha: 2026-05-31
Autor: Agente Builder

---

## Option Sets

Option Sets son enumeraciones estáticas. Se configuran en Data → Option Sets en Bubble.

### OS-1: Difficulty

| Display | Valor interno |
|---------|--------------|
| Fácil   | easy         |
| Media   | medium       |
| Difícil | hard         |

Usado en: Mission.difficulty

---

### OS-2: CharacterStatus

| Display      | Valor interno | Descripción                                      |
|--------------|---------------|--------------------------------------------------|
| Active       | active        | Personaje con slot activo, nivel 0–2             |
| HappyEnding  | happy_ending  | Llegó a nivel 3, boda completada, ya archivado   |
| Abandoned    | abandoned     | Slot reseteado por inactividad a nivel 0         |

Nota: `abandoned` es estado transitorio — el slot se resetea y el Character queda huérfano o se elimina según el workflow (ver decisiones). En la práctica el slot vacío es la ausencia de un Character activo, no un estado persistente. Se incluye aquí para logging si se decide archivar.

Usado en: Character.status

---

### OS-3: MissionStatus

| Display    | Valor interno | Descripción                                        |
|------------|---------------|----------------------------------------------------|
| Pending    | pending       | Creada, aún no completada ni vencida               |
| Completed  | completed     | Marcada como completada por el usuario              |
| Failed     | failed        | Deadline vencido sin completar — penalización aplicada |
| Cancelled  | cancelled     | Usuario cambió la fecha (canceló) — penalización aplicada |

Usado en: Mission.status

---

## Data Types

---

### DT-1: Character

Representa un personaje/hábito activo en un slot.

| Campo              | Tipo en Bubble          | Descripción                                                                 |
|--------------------|-------------------------|-----------------------------------------------------------------------------|
| name               | text                    | Nombre del hábito/personaje. Ej: "Gym", "Leer 30 min"                      |
| slot_number        | number                  | Número de slot: 1, 2 o 3. Único entre Characters con status = active        |
| status             | OS-CharacterStatus      | Estado actual del personaje (active, happy_ending, abandoned)               |
| hearts_total       | number                  | Corazones acumulados. SÍ puede bajar por penalizaciones. Cuando llega a negativo se disparan los triggers de abandono/cancelación. |
| level              | number                  | Nivel actual: 0, 1, 2, 3. Campo independiente — solo sube, nunca baja. Se incrementa cuando hearts_total cruza el umbral. |
| last_mission_completed_date | date          | Fecha de la última misión marcada como completed. Para calcular inactividad. |
| created_date       | date                    | Fecha de creación del personaje                                             |
| created_by         | User                    | Relación al usuario (para escalabilidad, aunque sea app personal)           |

**Notas:**
- `hearts_total` es el contador principal. SÍ puede bajar con penalizaciones. Cuando baja a negativo (<0) se disparan los triggers de abandono o cancelación según el contexto.
- `level` es un campo separado e independiente. Solo sube cuando `hearts_total` cruza los umbrales (20/60/140). NUNCA baja — ni por penalizaciones ni por abandono.
- La lógica de inactividad usa `last_mission_completed_date`. Si es vacío y ya pasaron 3 semanas desde `created_date`, también cuenta como inactividad.
- Un slot "vacío" = no existe ningún Character activo con ese `slot_number`. No hay un objeto SlotEmpty — la ausencia es el estado.
- **Eliminar el campo `hearts_current`** — ya no es necesario. `hearts_total` es el único contador y es el que se muestra en pantalla.

---

### DT-2: Mission

Representa una misión asignada a un personaje.

| Campo          | Tipo en Bubble     | Descripción                                                               |
|----------------|--------------------|---------------------------------------------------------------------------|
| character      | Character          | Relación al Character al que pertenece esta misión                        |
| name           | text               | Nombre de la misión. Ej: "Ir al gym 3 veces esta semana"                  |
| difficulty     | OS-Difficulty      | Dificultad seleccionada: Fácil, Media, Difícil                            |
| deadline       | date               | Fecha límite de la misión                                                 |
| status         | OS-MissionStatus   | Estado actual: pending, completed, failed, cancelled                      |
| completed_date | date               | Fecha en que se marcó como completada (vacío si no completada)            |
| hearts_awarded | number             | Corazones otorgados al completar (positivo) o penalización aplicada (negativo). Registro histórico. |
| created_date   | date               | Fecha de creación de la misión                                            |

**Notas:**
- `hearts_awarded` guarda el delta real aplicado: +5/+10/+18 si completada, -3/-5/-8 si fallada o cancelada. Sirve para auditoría y para el perfil del personaje.
- El límite de 3 misiones pendientes simultáneas se enforcea en el frontend (deshabilitar botón "Crear misión" si count de missions con status=pending para ese Character ≥ 3) y también debe validarse en el workflow backend.
- La "cancelación" por cambio de fecha: en MVP, si el usuario quiere cambiar la fecha de una misión pending, el workflow la marca como `cancelled`, aplica penalización, y crea una nueva misión con la nueva fecha. No se edita la fecha de la misión original — se reemplaza.

---

### DT-3: HappyEnding

Archivo de personajes que llegaron a nivel 3 y completaron la boda.

| Campo          | Tipo en Bubble  | Descripción                                                          |
|----------------|-----------------|----------------------------------------------------------------------|
| character_name | text            | Nombre del personaje/hábito archivado                                |
| original_character | Character   | Relación al Character original (puede mantenerse para historial)     |
| wedding_date   | date            | Fecha en que se completó el nivel 3 y se disparó la escena de boda  |
| total_missions_completed | number | Cuántas misiones completó en total este personaje                  |
| total_hearts_earned | number   | Corazones totales acumulados (hearts_total al momento de archivar)   |
| created_by     | User            | Relación al usuario                                                  |

**Notas:**
- Este tipo es append-only. No se modifica una vez creado.
- `character_name` se copia como text independiente porque el Character original puede ser eliminado o reseteado.
- El slot se libera cuando el Character.status cambia a `happy_ending` y slot_number se setea a null (o se elimina el Character — ver decisiones técnicas).

---

### DT-4: User (nativo de Bubble)

Bubble crea este tipo automáticamente. No requiere campos adicionales para MVP de un solo usuario. Si en el futuro se abre a múltiples usuarios, agregar campos de perfil aquí.

Campos nativos usados:
- `email` — login
- Todos los Data Types tienen relación `created_by` al User para filtros.

---

## Resumen de relaciones

```
User
 └── Character (created_by)
      └── Mission (character)

User
 └── HappyEnding (created_by)
      └── Character (original_character) — referencia opcional
```

---

## Tabla de corazones quick-reference

| Evento                        | Fácil | Media | Difícil |
|-------------------------------|-------|-------|---------|
| Misión completada             | +5    | +10   | +18     |
| Misión cancelada / vencida    | -3    | -5    | -8      |

| Transición de nivel | Umbral hearts_total acumulado |
|---------------------|-------------------------------|
| 0 → 1               | 20                            |
| 1 → 2               | 60                            |
| 2 → 3               | 140 → dispara boda            |

---

## Checklist de setup en Bubble

- [ ] Crear Option Set: Difficulty (easy / medium / hard)
- [ ] Crear Option Set: CharacterStatus (active / happy_ending / abandoned)
- [ ] Crear Option Set: MissionStatus (pending / completed / failed / cancelled)
- [ ] Crear Data Type: Character con todos los campos listados
- [ ] Crear Data Type: Mission con todos los campos listados
- [ ] Crear Data Type: HappyEnding con todos los campos listados
- [ ] Verificar que User existe (nativo)
- [ ] Setear Privacy Rules: todos los tipos filtrados por `created_by = Current User`
