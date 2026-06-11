# QA Report — Habit Dating Sim
**Fecha:** 2026-05-31
**Versión del sistema:** v1 (pre-build verification)
**Ejecutor:** Hector Araujo (pruebas manuales en Bubble.io)

---

## Convenciones

> **Actualización 2026-06-11 (decisión de Hector):** se eliminó `hearts_current`. Existe un
> ÚNICO contador `heartsTotal` que sube al completar misiones y BAJA con penalizaciones
> (mínimo 0 — escenario A de TC-036). El progreso hacia el siguiente nivel sí retrocede al
> cancelar. El `nivel` es un campo aparte: nunca baja por penalizaciones, solo por abandono.
> Donde los TCs digan `hearts_current`, leer `heartsTotal`; donde digan "hearts_total no
> cambia" por una penalización, ya no aplica (TC-007 se redefinió como "la penalización no
> baja el nivel"). Además el reloj de abandono nunca para: cada 21 días completos de
> inactividad baja un nivel adicional (acumulable), y en nivel 0 el personaje se va.
> Los tests de Vitest (`src/game/qa-report.test.ts`) reflejan esta versión.

- `hearts_total` = acumulador de nivel (nunca baja) — **obsoleto, ver nota de arriba**
- `hearts_current` = display (sí baja con penalizaciones) — **obsoleto, ver nota de arriba**
- Dificultades: Fácil / Media / Difícil
- Umbrales de nivel: 0→1 = 20 | 1→2 = 60 | 2→3 = 140
- Estado de caso: ⬜ Pendiente | ✅ Pasa | ❌ Falla | ⚠️ Comportamiento inesperado

---

## Área 1: Sistema de Corazones

### TC-001: Suma correcta al completar misión Fácil
**Precondición:** Personaje con hearts_total = 0, hearts_current = 0. Misión activa de dificultad Fácil.
**Acción:** Usuario marca la misión como completada.
**Resultado esperado:** hearts_total = 5, hearts_current = 5. No aparece escena de nivel.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-002: Suma correcta al completar misión Media
**Precondición:** Personaje con hearts_total = 0, hearts_current = 0. Misión activa de dificultad Media.
**Acción:** Usuario marca la misión como completada.
**Resultado esperado:** hearts_total = 10, hearts_current = 10. No aparece escena de nivel.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-003: Suma correcta al completar misión Difícil
**Precondición:** Personaje con hearts_total = 0, hearts_current = 0. Misión activa de dificultad Difícil.
**Acción:** Usuario marca la misión como completada.
**Resultado esperado:** hearts_total = 18, hearts_current = 18. No aparece escena de nivel.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-004: Penalización correcta por cancelar misión Fácil
**Precondición:** Personaje con hearts_current = 10. Misión activa de dificultad Fácil.
**Acción:** Usuario cancela la misión.
**Resultado esperado:** hearts_current = 7 (10 - 3). hearts_total NO cambia.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-005: Penalización correcta por cancelar misión Media
**Precondición:** Personaje con hearts_current = 10. Misión activa de dificultad Media.
**Acción:** Usuario cancela la misión.
**Resultado esperado:** hearts_current = 5 (10 - 5). hearts_total NO cambia.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-006: Penalización correcta por cancelar misión Difícil
**Precondición:** Personaje con hearts_current = 15. Misión activa de dificultad Difícil.
**Acción:** Usuario cancela la misión.
**Resultado esperado:** hearts_current = 7 (15 - 8). hearts_total NO cambia.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-007: hearts_total nunca baja con penalización
**Precondición:** Personaje con hearts_total = 50, hearts_current = 8. Misión activa de dificultad Difícil.
**Acción:** Usuario cancela la misión.
**Resultado esperado:** hearts_current = 0 (8 - 8 = 0, o clamp a 0 si la resta daría negativo). hearts_total = 50, sin cambio. Nivel = 1 (basado en hearts_total = 50, por encima del umbral 20).
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-008: hearts_current no puede bajar el nivel del personaje
**Precondición:** Personaje en nivel 1 (hearts_total = 25, hearts_current = 25). Misión Difícil cancelada.
**Acción:** Cancelar misión Difícil.
**Resultado esperado:** hearts_current = 17. Nivel = 1. hearts_total = 25, sin cambio. No hay downgrade de nivel.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Área 2: Progresión de Niveles

### TC-009: Subida de nivel 0 → 1 en el umbral exacto (20)
**Precondición:** Personaje con hearts_total = 15, nivel = 0. Misión de dificultad Media pendiente (+10).
**Acción:** Usuario completa la misión Media.
**Resultado esperado:** hearts_total = 25. Nivel sube a 1. Aparece escena de subida de nivel. hearts_current también aumenta en 10.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-010: No sube nivel con hearts_total = 19 (un punto antes del umbral)
**Precondición:** Personaje con hearts_total = 14, nivel = 0. Misión de dificultad Fácil pendiente (+5).
**Acción:** Usuario completa la misión Fácil.
**Resultado esperado:** hearts_total = 19. Nivel = 0 (no sube). No aparece escena de nivel.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-011: Subida de nivel 1 → 2 en el umbral exacto (60)
**Precondición:** Personaje con hearts_total = 55, nivel = 1. Misión de dificultad Difícil pendiente (+18).
**Acción:** Usuario completa la misión Difícil.
**Resultado esperado:** hearts_total = 73. Nivel sube a 2. Aparece escena de subida de nivel correspondiente a nivel 2.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-012: No sube dos niveles de golpe (de nivel 0 a nivel 2 directamente)
**Precondición:** Personaje con hearts_total = 18, nivel = 0. Misión de dificultad Difícil pendiente (+18).
**Acción:** Usuario completa la misión Difícil.
**Resultado esperado:** hearts_total = 36. El sistema sube solo a nivel 1 (umbral 20 cruzado), NO salta a nivel 2. Solo aparece escena de nivel 1.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-013: Subida de nivel 2 → 3 en el umbral exacto (140)
**Precondición:** Personaje con hearts_total = 135, nivel = 2. Misión de dificultad Difícil pendiente (+18).
**Acción:** Usuario completa la misión Difícil.
**Resultado esperado:** hearts_total = 153. Nivel sube a 3. Aparece ESCENA DE BODA (no escena genérica de nivel). Ver TC del Área 6.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Área 3: Escenas

### TC-014: Escena de subida de nivel aparece solo al cruzar umbral
**Precondición:** Personaje con hearts_total = 10, nivel = 0.
**Acción:** Completar misión Fácil (+5). hearts_total = 15. No se cruza el umbral 20.
**Resultado esperado:** NO aparece escena de nivel. Solo confirmación de misión completada.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-015: Escena de cancelación aparece al cancelar una misión activa
**Precondición:** Personaje con misión activa, fecha límite vigente.
**Acción:** Usuario cancela la misión manualmente.
**Resultado esperado:** Aparece escena de cancelación específica del personaje. Se aplica penalización de corazones correspondiente a la dificultad.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-016: Escena de cancelación automática al vencer fecha límite de misión
**Precondición:** Personaje con misión activa cuya fecha límite es hoy o ya pasó.
**Acción:** El sistema detecta la misión vencida (trigger automático o el usuario intenta marcarla como completada después del vencimiento).
**Resultado esperado:** Aparece escena de cancelación automática. No se puede marcar como completada. Se aplica penalización de corazones de la dificultad correspondiente.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-017: Escena de abandono aparece exactamente a las 3 semanas sin actividad
**Precondición:** Personaje con nivel 1. Última misión completada hace exactamente 21 días (3 semanas).
**Acción:** Trigger automático del sistema al cumplirse el plazo.
**Resultado esperado:** Aparece escena de abandono específica del personaje. Nivel baja de 1 a 0. hearts_total NO se modifica (el nivel es lo que baja, no el acumulador).
**Nota para verificar:** ¿El nivel se guarda en un campo separado `nivel` calculado en base a hearts_total, o es un campo editable directamente? Si es calculado, la "bajada de nivel" debe ajustar hearts_total también. Confirmar arquitectura en Bubble antes de ejecutar este TC.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-018: No aparece escena de abandono si hay actividad reciente (menos de 3 semanas)
**Precondición:** Personaje con última misión completada hace 20 días.
**Acción:** Pasa el tiempo hasta el día 20 (o se simula manualmente). Se verifica que el trigger NO disparó.
**Resultado esperado:** No aparece escena de abandono. Personaje mantiene nivel y estado.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Área 4: Abandono

### TC-019: 3 semanas sin actividad — baja de nivel 1 a 0
**Precondición:** Personaje en nivel 1 (hearts_total entre 20 y 59). Sin misiones completadas en 21 días.
**Acción:** Trigger automático de abandono.
**Resultado esperado:** Escena de abandono. Nivel baja a 0. El personaje permanece activo en su slot (no se libera el slot).
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-020: 3 semanas sin actividad — baja de nivel 2 a 1
**Precondición:** Personaje en nivel 2. Sin misiones completadas en 21 días.
**Acción:** Trigger automático de abandono.
**Resultado esperado:** Escena de abandono. Nivel baja de 2 a 1. Slot no se libera.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-021: 3 semanas sin actividad en nivel 0 — reseteo y slot liberado
**Precondición:** Personaje en nivel 0. Sin actividad en 21 días.
**Acción:** Trigger automático de abandono.
**Resultado esperado:** Escena de abandono. El slot del personaje se libera (queda disponible para un nuevo personaje). El personaje no queda en estado activo.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-022: El contador de inactividad se reinicia al completar una misión
**Precondición:** Personaje con 18 días sin actividad. Se completa una misión.
**Acción:** Completar misión.
**Resultado esperado:** El contador de inactividad vuelve a 0. Los 21 días para abandono se cuentan desde la fecha de esta misión completada.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Área 5: Cancelación

### TC-023: Cambiar fecha límite de misión = cancelación automática
**Precondición:** Personaje con misión activa con fecha límite en 5 días.
**Acción:** Usuario edita la fecha límite de la misión.
**Resultado esperado:** El sistema interpreta el cambio como cancelación. Aparece escena de cancelación. Se aplica penalización correspondiente a la dificultad. La misión queda en estado cancelado (no activo).
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-024: Misión vencida no puede marcarse como completada
**Precondición:** Personaje con misión cuya fecha límite ya pasó.
**Acción:** Usuario intenta marcar la misión como completada.
**Resultado esperado:** El sistema bloquea la acción. Aparece escena de cancelación automática. Se aplica penalización. No se suman corazones.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-025: Penalización correcta en cancelación automática por vencimiento
**Precondición:** Personaje con hearts_current = 20. Misión vencida de dificultad Media.
**Acción:** Trigger automático de cancelación por vencimiento.
**Resultado esperado:** hearts_current = 15 (20 - 5). hearts_total sin cambio.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Área 6: Nivel 3 / Boda

### TC-026: Al llegar a nivel 3 aparece escena de boda (no escena genérica de nivel)
**Precondición:** Personaje con hearts_total = 139, nivel = 2. Misión Fácil pendiente (+5).
**Acción:** Completar misión Fácil.
**Resultado esperado:** hearts_total = 144. Nivel = 3. Aparece escena de BODA, no la escena genérica de subida de nivel. No aparece ninguna otra escena.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-027: Personaje archivado en HappyEnding después de boda
**Precondición:** Personaje en nivel 2, a punto de cruzar umbral 140.
**Acción:** Completar misión que cruza el umbral 140.
**Resultado esperado:** Después de la escena de boda, el personaje aparece en la sección HappyEnding del sistema (o equivalente en Bubble). No aparece en la lista de personajes activos.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-028: Slot liberado correctamente después de boda
**Precondición:** 3 personajes activos. Uno de ellos completa la boda.
**Acción:** Completar la misión que lleva al personaje al nivel 3.
**Resultado esperado:** El personaje se archiva en HappyEnding. El conteo de personajes activos baja de 3 a 2. Ahora es posible agregar un nuevo personaje activo (slot disponible).
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-029: Personaje en HappyEnding no tiene misiones activas ni genera triggers
**Precondición:** Personaje recién archivado en HappyEnding.
**Acción:** Verificar estado del personaje en el sistema.
**Resultado esperado:** El personaje no tiene misiones pendientes. No puede recibir nuevas misiones. No genera trigger de abandono. Su historial de corazones y nivel se conserva como registro.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Área 7: Límites

### TC-030: No se puede agregar una 4ta misión pendiente al mismo personaje
**Precondición:** Personaje con exactamente 3 misiones en estado pendiente/activo.
**Acción:** Usuario intenta crear una 4ta misión para ese personaje.
**Resultado esperado:** El sistema bloquea la acción. Aparece mensaje de error o el botón de agregar misión está deshabilitado. Las 3 misiones existentes no se ven afectadas.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-031: Sí se puede agregar misión si hay menos de 3 pendientes
**Precondición:** Personaje con 2 misiones activas.
**Acción:** Usuario crea una 3ra misión para ese personaje.
**Resultado esperado:** La misión se crea correctamente. El personaje queda con 3 misiones activas. El límite no bloquea.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-032: No se puede activar un 4to personaje simultáneo
**Precondición:** 3 personajes activos en el sistema.
**Acción:** Usuario intenta agregar o activar un 4to personaje.
**Resultado esperado:** El sistema bloquea la acción. Aparece mensaje indicando que el límite de 3 personajes activos está alcanzado. Los 3 personajes existentes no se ven afectados.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-033: Sí se puede activar personaje si hay menos de 3 activos
**Precondición:** 2 personajes activos.
**Acción:** Usuario activa un 3er personaje.
**Resultado esperado:** El 3er personaje queda activo correctamente. El conteo de activos = 3. El sistema no bloquea.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-034: Completar o cancelar una misión libera el slot y permite agregar una nueva
**Precondición:** Personaje con 3 misiones activas.
**Acción:** Usuario completa una de las 3 misiones.
**Resultado esperado:** El personaje queda con 2 misiones activas. Ahora es posible agregar una nueva misión (límite no bloqueado).
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Área 8: Edge Cases

### TC-035: Personaje con exactamente hearts_total = 19 no sube de nivel
**Precondición:** Personaje con hearts_total = 19, nivel = 0.
**Acción:** Verificar nivel en pantalla sin completar misión.
**Resultado esperado:** Nivel = 0. El sistema NO sube a nivel 1. El umbral es 20, no 19.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-036: Penalización que llevaría hearts_current a negativo — comportamiento esperado
**Precondición:** Personaje con hearts_current = 4. Misión Difícil cancelada (penalización -8).
**Acción:** Cancelar misión Difícil.
**Resultado esperado (dos escenarios posibles — definir cuál implementa Bubble):**
- **Escenario A (clamp a 0):** hearts_current = 0. No se va a negativo. hearts_total no cambia.
- **Escenario B (permite negativo):** hearts_current = -4. Sistema acepta valores negativos en display.
**Decisión arquitectónica:** _____ (Hector decide antes de probar cuál es el comportamiento correcto)
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-037: Slot recién liberado por boda disponible para nuevo personaje
**Precondición:** El sistema tenía 3 personajes activos. Uno completó el proceso de boda y fue archivado en HappyEnding.
**Acción:** Usuario intenta activar un nuevo personaje.
**Resultado esperado:** El sistema permite agregar el nuevo personaje. Conteo de activos = 3 nuevamente (2 anteriores + 1 nuevo). El personaje archivado permanece en HappyEnding sin interferir.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-038: Slot recién liberado por abandono en nivel 0 disponible para nuevo personaje
**Precondición:** Personaje en nivel 0 sufre trigger de abandono y el slot se libera.
**Acción:** Usuario intenta activar un nuevo personaje en ese slot.
**Resultado esperado:** El sistema permite agregar el nuevo personaje. El personaje abandonado no aparece como activo ni interfiere.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-039: Misión completada el día exacto de la fecha límite (no vencida)
**Precondición:** Misión con fecha límite = hoy.
**Acción:** Usuario marca la misión como completada el mismo día del vencimiento.
**Resultado esperado:** La misión se acepta como completada (no vencida). Se suman los corazones correspondientes. No aparece escena de cancelación.
**Nota:** Verificar si Bubble compara fechas por día completo o por timestamp exacto (hora).
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-040: Misión completada un día después de la fecha límite (vencida)
**Precondición:** Misión con fecha límite = ayer.
**Acción:** Usuario intenta marcar la misión como completada.
**Resultado esperado:** El sistema bloquea la acción. Activa cancelación automática con penalización. No se suman corazones.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-041: Acumulación de penalizaciones en la misma sesión no rompe el estado
**Precondición:** Personaje con hearts_current = 30, hearts_total = 60 (nivel 2). 3 misiones activas de distintas dificultades.
**Acción:** Cancelar las 3 misiones en secuencia: Fácil (-3), Media (-5), Difícil (-8).
**Resultado esperado:** hearts_current = 14 (30 - 3 - 5 - 8). hearts_total = 60, sin cambio. Nivel = 2, sin cambio. Cada cancelación dispara su propia escena de cancelación. El sistema no se rompe con múltiples penalizaciones consecutivas.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

### TC-042: Personaje que sube y luego baja de nivel por abandono — hearts_total se mantiene
**Precondición:** Personaje con hearts_total = 25, nivel = 1. Sufre trigger de abandono (nivel baja de 1 a 0).
**Acción:** Trigger de abandono.
**Resultado esperado:** Nivel = 0. hearts_total = 25 (sin cambio). Si el nivel es calculado dinámicamente desde hearts_total, este TC no es posible — el sistema necesita un campo de "nivel actual" editable separado del acumulador. Confirmar arquitectura antes de ejecutar.
**Resultado real:** _______________
**Estado:** ⬜ Pendiente

---

## Resumen de Estado

| Área | Total TCs | Pendientes | Pasan | Fallan | Bugs |
|---|---|---|---|---|---|
| 1. Sistema de Corazones | 8 | 8 | - | - | - |
| 2. Progresión de Niveles | 5 | 5 | - | - | - |
| 3. Escenas | 5 | 5 | - | - | - |
| 4. Abandono | 4 | 4 | - | - | - |
| 5. Cancelación | 3 | 3 | - | - | - |
| 6. Nivel 3 / Boda | 4 | 4 | - | - | - |
| 7. Límites | 5 | 5 | - | - | - |
| 8. Edge Cases | 8 | 8 | - | - | - |
| **TOTAL** | **42** | **42** | **-** | **-** | **-** |

---

## Orden Recomendado de Prueba

La secuencia está diseñada para construir estado progresivamente y no tener que resetear la app entre áreas. Seguirla en orden evita contaminación entre casos.

### Fase 1 — Fundamentos (sin estado previo)
Empezar con personaje nuevo, nivel 0, corazones en 0.

1. **TC-001** → TC-002 → TC-003 (verificar suma por dificultad)
2. **TC-014** (verificar que no aparece escena de nivel sin cruzar umbral)
3. **TC-010** → **TC-035** (verificar el umbral exacto de 19 — no sube todavía)

### Fase 2 — Primera subida de nivel
Continuar con el mismo personaje del paso anterior o crear uno nuevo en hearts_total = 15.

4. **TC-009** (cruzar umbral 20, subir a nivel 1)
5. **TC-004** → TC-005 → TC-006 (penalizaciones por dificultad)
6. **TC-007** (hearts_total no baja con penalización)
7. **TC-008** (hearts_current no provoca downgrade de nivel)
8. **TC-036** (edge case: penalización que llevaría a negativo — requiere decisión previa de Hector)

### Fase 3 — Cancelación y escenas
Crear misiones específicas para probar triggers.

9. **TC-015** (escena de cancelación manual)
10. **TC-023** (cambio de fecha = cancelación)
11. **TC-039** → **TC-040** (completar en fecha límite vs. después)
12. **TC-016** → **TC-024** → **TC-025** (cancelación automática por vencimiento)
13. **TC-041** (múltiples penalizaciones en secuencia)

### Fase 4 — Límites
Crear el escenario de saturación.

14. **TC-030** → **TC-031** (límite de 3 misiones pendientes)
15. **TC-034** (liberar slot al completar misión)
16. **TC-032** → **TC-033** (límite de 3 personajes activos)

### Fase 5 — Progresión avanzada
Llevar un personaje a nivel 2 para probar el siguiente umbral.

17. **TC-011** (cruzar umbral 60, subir a nivel 2)
18. **TC-012** (verificar que no salta dos niveles de golpe — preparar caso desde nivel 0 en hearts_total = 18 con misión Difícil)

### Fase 6 — Abandono
Requiere manipular fechas o esperar el trigger. Probar en personaje separado para no contaminar el progreso del personaje principal.

19. **TC-018** (20 días — no dispara abandono)
20. **TC-017** → **TC-019** (21 días, nivel 1 — baja a 0)
21. **TC-020** (21 días, nivel 2 — baja a 1)
22. **TC-022** (reinicio del contador al completar misión)
23. **TC-021** (21 días, nivel 0 — reseteo y slot liberado)
24. **TC-038** (slot liberado disponible para nuevo personaje)
25. **TC-042** (hearts_total no cambia con abandono — confirmar arquitectura primero)

### Fase 7 — Nivel 3 y Boda
El caso más complejo. Llevar un personaje específicamente a hearts_total = 139.

26. **TC-013** (cruzar umbral 140, subir a nivel 3)
27. **TC-026** (escena de boda, no escena genérica)
28. **TC-027** (personaje archivado en HappyEnding)
29. **TC-028** (slot liberado después de boda)
30. **TC-029** (personaje en HappyEnding sin triggers activos)
31. **TC-037** (slot recién liberado disponible para nuevo personaje)

---

## Decisiones Arquitectónicas a Confirmar Antes de Probar

Antes de ejecutar los TCs, Hector debe confirmar en Bubble cómo está implementado lo siguiente:

1. **¿El nivel se calcula dinámicamente desde hearts_total o es un campo editable?**
   - Si es dinámico (calculado): el "bajar nivel" por abandono requiere ajustar hearts_total, lo cual entra en conflicto con la regla de que hearts_total nunca baja. Esto puede ser una contradicción arquitectónica que requiere decisión.
   - Si es campo editable: hearts_total y nivel son independientes. La bajada de nivel por abandono solo toca el campo `nivel`, no `hearts_total`. Más limpio.

2. **¿hearts_current puede ser negativo o se clampea a 0?**
   - Definir antes de TC-036. Determina cómo Bubble valida el campo.

3. **¿El trigger de abandono se basa en fecha de última misión completada, o en cualquier actividad del usuario sobre el personaje?**
   - Afecta TC-022 y cómo se cuentan los 21 días exactamente.

4. **¿El vencimiento de misión se detecta por fecha (sin hora) o por timestamp?**
   - Afecta TC-039 y TC-040. Si es timestamp, completar a las 23:59 del día de vencimiento puede dar diferente resultado que a las 00:01 del día siguiente.
