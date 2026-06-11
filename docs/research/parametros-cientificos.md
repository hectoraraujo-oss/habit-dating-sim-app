---
tipo: research
creado: 2026-05-31
actualizado: 2026-05-31
confianza: media
estado: activo
tags: [habit-dating-sim, ciencia, parametros, diseño-de-juego, habits]
---

# Parámetros Científicos — Habit Dating Sim

Documento de referencia para calibrar las mecánicas centrales del juego con base en evidencia publicada. Cada parámetro incluye fuente, nivel de confianza y traducción directa a decisión de diseño.

---

## 1. Máximo de hábitos simultáneos

**Dato:** 3 hábitos simultáneos como límite práctico recomendado; hasta 5 con degradación progresiva de adherencia.

**Fuente:**
- BJ Fogg, Behavior Design Lab, Stanford University. Recomendación documentada en su metodología Tiny Habits (libro publicado 2019, investigación base 2007-2019). Fogg recomienda explícitamente no intentar cambiar más de 3 hábitos al mismo tiempo.
- Soporte indirecto: Investigación sobre implementation intentions (McGill University, referenciada en múltiples revisiones) muestra que enfocar el planning en un solo objetivo produce mayor compromiso que planificar múltiples metas simultáneas.
- Evidencia de apps de habit-tracking (revisión 2023, habit-streak.com): tracking de más de 5-6 hábitos correlaciona fuertemente con abandono total.

**Confianza:** media

La recomendación de 3 hábitos de Fogg está documentada en su metodología publicada pero no en un RCT específico con ese número exacto. Es el consenso práctico más citado en la literatura aplicada. El límite de 5-6 para abandono total es observacional (apps), no experimental.

**Nota crítica:** La literatura sobre ego depletion (Baumeister et al., 1998), que daría sustento neurológico al límite de recursos simultáneos, tiene replicabilidad en disputa (Vohs et al., 2021, multi-site: resultados inconcluyentes). El límite de 3 hábitos sigue siendo el más defendible en la práctica, pero su base teórica no es tan sólida como suele presentarse.

**Traducción a mecánica:**
- El MVP con 3 slots es científicamente defendible como el techo óptimo recomendado.
- 3 personajes/slots es el número correcto. No reducir a 2 (por debajo del umbral de utilidad) ni escalar a 5+ en MVP (zona de abandono masivo).
- Si en el futuro se diseña un modo avanzado, máximo 5 slots, con advertencia in-game explícita.

---

## 2. Tiempo de formación de un hábito

**Dato:** Mediana de 59-66 días para alcanzar automaticidad. Rango real: 18-254 días. Media (promedio aritmético): 106-154 días según meta-análisis reciente.

**Fuentes:**
- **Estudio base:** Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). "How are habits formed: Modelling habit formation in the real world." *European Journal of Social Psychology, 40*(6), 998-1009. DOI: 10.1002/ejsp.674. N=96 participantes, 12 semanas, hábitos de alimentación, bebida y actividad física.
- **Meta-análisis reciente (más robusto):** Estudios identificados en revisión sistemática publicada en *Healthcare* (MDPI), 2024 (búsqueda hasta octubre 2023). Cuatro estudios con mediana/media reportada: mediana 59-66 días, medias 106-154 días, rango total 4-335 días. Referencia: PMC11641623.

**Confianza:** alta

El dato de 66 días de Lally es el más citado y está replicado en dirección por el meta-análisis de 2024. La divergencia entre mediana (~66 días) y media (~106-154 días) es importante: indica distribución sesgada por hábitos complejos que tardan mucho más.

**Traducción a mecánica:**
- Nivel 3 (hábito consolidado) debe alcanzarse en aproximadamente 66 días de juego en uso consistente diario. Esto es el target de diseño.
- El rango de 18-254 días justifica que el juego no sea lineal: algunos personajes (hábitos simples como "tomar agua al despertar") pueden consolidarse antes; otros (ejercicio intenso, meditación profunda) deben tardar más.
- Si el juego tiene sesiones diarias de ~5 minutos como engagement mínimo, el arco narrativo de un personaje debe diseñarse para 66 sesiones/días como eje central.
- El rango ancho (18-254) es un feature, no un bug: permite variedad en la duración de arcos por personaje.

---

## 3. Tiempo de pérdida sin refuerzo

**Dato:** El decaimiento de un hábito sin refuerzo es altamente idiosincrático. El rango documentado es 1-65 días para estabilización del decaimiento. Un hábito más fuerte (mayor automaticidad previa) decae más lentamente. No existe un umbral universal único.

**Fuente:**
- **Estudio directo:** Edgren, R., Baretta, D., & Inauen, J. (2025). "The temporal trajectories of habit decay in daily life: An intensive longitudinal study on four health-risk behaviors." *Applied Psychology: Health and Well-Being*. PMC11635905. N=194, 91 días de seguimiento, 4 comportamientos (sedentarismo, snacking, alcohol, tabaco), 11,805 observaciones. Modelos asintóticos y logísticos como mejores fits (54% de la muestra).
- **Evidencia complementaria:** Investigación sobre cambio de commuting habits (referenciada en múltiples revisiones): un hábito antiguo puede decrecer gradualmente en 4 semanas tras cambio de contexto, mientras emerge uno nuevo.

**Confianza:** media

El estudio de Edgren et al. (2025) es el más riguroso encontrado sobre decaimiento específico. Sin embargo, estudia hábitos que el participante intenta activamente romper (no abandono pasivo). El decaimiento por inactividad pasiva (como en el juego, donde el usuario simplemente desaparece) puede ser diferente. Extrapolar con precaución.

**Traducción a mecánica:**
- No existe un número único respaldado científicamente como "X semanas = hábito perdido". Pero el rango 1-65 días para estabilización del decaimiento sugiere una ventana de 2-9 semanas como zona de riesgo real.
- **Recomendación de diseño:** Trigger de abandono a las 3 semanas (21 días) de inactividad total. Justificación: está dentro del rango documentado, es suficientemente generoso para no castigar breaks cortos (vacaciones, enfermedad), y es suficientemente corto para que el usuario no regrese a un personaje completamente "muerto" sin consecuencias narrativas.
- Diseñar decaimiento progresivo, no binario: semana 1 sin actividad = personaje distante; semana 2 = relación en tensión visible; semana 3 = escena de abandono.
- Un personaje con nivel 3 (hábito consolidado) debería tener mayor resistencia al abandono que uno en nivel 1. Esto está respaldado: mayor automaticidad = decaimiento más lento.

---

## 4. Frecuencia mínima de mantenimiento

**Dato:** No existe un umbral universal de "X veces por semana" publicado en estudios experimentales controlados. La literatura identifica que la frecuencia y la estabilidad de contexto son los predictores centrales de automaticidad, pero sin un número mínimo universal.

**Evidencia disponible:**
- **Ouellette & Wood (1998).** Meta-análisis de 64 estudios. Hallazgo clave: comportamientos realizados frecuentemente en contextos estables se vuelven automáticos (habituales); comportamientos realizados ocasionalmente permanecen dependientes de intención consciente. No fija un número exacto de veces por semana, pero distingue "daily/near-daily" vs "occasional" como la frontera crítica.
- **Lally et al. (2010):** Los participantes realizaban el comportamiento objetivo diariamente durante 12 semanas. El diseño asume práctica diaria como condición base para formación de hábito.
- **Hallazgo práctico de Lally et al. (2010):** Perder un día aislado no afecta significativamente la trayectoria de formación del hábito. "Never miss twice" (no fallar dos días seguidos) emerge como heurística respaldada por el patrón de los datos.
- **Dato no encontrado con fuente verificable:** No existe un estudio que fije experimentalmente "mínimo 2 veces por semana" o "mínimo 3 veces por semana" como umbral de mantenimiento para hábito ya formado. Cualquier número específico en este rango sería estimado, no medido.

**Confianza:** baja (para número exacto) / media (para principio general)

**Estimado de diseño (con etiqueta de estimado, no dato medido):**
Dado el patrón de la literatura, la frontera práctica entre "mantenimiento activo" e "inactividad que dispara decaimiento" puede aproximarse en 2 veces por semana como mínimo. Por debajo de esto, el comportamiento probablemente no se mantiene como hábito automático sino como acción consciente ocasional, con mayor riesgo de abandono.

**Traducción a mecánica:**
- **Actividad suficiente = mínimo 2 registros por semana.** Este número es una decisión de diseño informada por los principios de la literatura, no un dato medido exacto. Debe comunicarse así internamente.
- 1 vez por semana cuenta como actividad pero debería generar un indicador visual de "relación en riesgo" para el personaje correspondiente.
- 0 veces en una semana = primer warning narrativo; 0 veces en 2-3 semanas consecutivas = trigger de abandono (ver Parámetro 3).
- Si el usuario registra el hábito todos los días de una semana: bonus narrativo / momento de intimidad con el personaje. Frecuencia alta recompensada, no solo frecuencia mínima.

---

## Resumen ejecutivo para diseño de juego

| Parámetro | Número de diseño | Base científica | Confianza |
|---|---|---|---|
| Slots simultáneos (personajes) | **3** | Fogg (Stanford, Tiny Habits); literatura de implementation intentions | Media |
| Días para nivel 3 (consolidado) | **66 días** de uso consistente | Lally et al. (2010, EJSP); confirmado por meta-análisis 2024 (PMC11641623) | Alta |
| Semanas sin actividad → abandono | **3 semanas (21 días)** | Edgren et al. (2025, Applied Psychology); rango documentado 1-65 días | Media |
| Mínimo de registros por semana para no degradar | **2 veces/semana** | Principio general de Ouellette & Wood (1998); Lally et al. (2010). Número exacto es estimado de diseño. | Baja |

### Notas de uso para el equipo

- El **66 días** es mediana, no promedio. Personajes con hábitos simples pueden diseñarse con arcos más cortos (18-30 días). Personajes con hábitos complejos, arcos más largos (90-120 días). Esto da variedad narrativa respaldada por datos reales.
- El **número de 3 slots** es el más defendible pero no tiene un RCT que lo pruebe exactamente. Si alguien pregunta, la respuesta correcta es: "es la recomendación más citada en el campo, de BJ Fogg (Stanford), y está respaldada por evidencia sobre límites de self-control simultáneo."
- El **trigger de 3 semanas** y el **mínimo de 2 veces/semana** son decisiones de diseño informadas por la ciencia, no datos medidos directamente. En ambos casos hay margen para ajustar según el playtest sin traicionar la evidencia base.
- El dato más débil de los cuatro es el de frecuencia mínima de mantenimiento: si en futuras versiones del juego este número necesita ajuste fino, hacerlo con base en datos de retención propios del juego es más confiable que buscar un estudio que no existe con ese nivel de precisión.

---

## Conexiones
- [[habit-dating-sim]]
- [[design]]
