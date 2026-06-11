# Habit Dating Sim — Plan de proyecto en código (VS Code + Claude Code)

**Creado:** 2026-06-10
**Estado:** APROBACIÓN PENDIENTE de Hector
**Reemplaza a:** la construcción en Bubble.io (ver `STATUS-BUBBLE.md`, queda archivada como referencia de decisiones)

---

## 1. Decisión técnica

**Stack elegido: Vite + React + TypeScript, persistencia en localStorage.**

Por qué:
- **Cero infraestructura.** No hay servidor, ni base de datos externa, ni cuentas que pagar. La app corre en tu navegador y los datos viven ahí.
- **Velocidad de construcción.** Es el stack donde Claude Code trabaja más rápido y con menos errores: todo es código local, verificable con tests.
- **Gratis de principio a fin.** Desarrollo local gratis; publicación gratis en Vercel o GitHub Pages cuando quieras acceder desde el celular.
- **Escalable después.** Si algún día quieres sincronización entre dispositivos, se agrega Supabase sin rehacer la app (Fase post-MVP).

Alternativas descartadas:
- *Next.js + Supabase*: agrega backend y cuentas externas que un tracker personal de un usuario no necesita.
- *React Native/Expo*: app nativa es overkill; la web app responsive se usa perfectamente desde el navegador del celular.

Riesgo aceptado: los datos viven en el navegador. Mitigación: botón de **exportar/importar JSON** desde el MVP (es parte del alcance, no un extra).

---

## 2. Roles

- **Claude Code (constructor):** escribe todo el código, los tests, corrige bugs, hace commits. Tú nunca tocas código.
- **Hector (product owner):** decide mecánicas y diseño, prueba cada milestone en el navegador, reporta lo que se siente mal. Tus pruebas son el control de calidad real.
- **Claude (director, este vault):** mantiene este plan al día, traduce tu feedback en instrucciones para las sesiones de Claude Code.

---

## 3. Cómo funciona el flujo de trabajo (para Hector, que no programa)

1. **Instalar una sola vez:** VS Code, Node.js (LTS), Git, y Claude Code (extensión de VS Code o CLI). Claude Code te guía en esto en la primera sesión.
2. **El proyecto es una carpeta** (ej. `C:\Users\hecto\Desktop\habit-dating-sim-app`). Dentro habrá un `CLAUDE.md` propio del repo con las reglas del juego (mecánicas, fases, convenciones) para que cada sesión de Claude Code arranque con contexto completo.
3. **Cada sesión de trabajo:** abres VS Code en esa carpeta, abres Claude Code y le dices qué fase toca (el `PROGRESO.md` del repo le dice exactamente dónde quedó). Claude Code programa, tú solo observas.
4. **Probar:** Claude Code levanta la app con `npm run dev` y te da una URL local (http://localhost:5173). La abres en el navegador y juegas. Lo que no te guste, se lo dices con palabras normales.
5. **Guardar avance:** Claude Code hace commit en Git al final de cada milestone. Nada se pierde entre sesiones.

---

## 4. Fuentes de verdad (ya existen en este vault)

El diseño YA está hecho — eso fue lo valioso del trabajo previo. Estos documentos se copian al repo nuevo:

- `design/flujo-pantallas.md` → wireframes y navegación de las 7 pantallas
- `design/mecanicas-detalle.md` → sistema de corazones, umbrales de nivel, penalizaciones, abandono
- `build/bubble-schema.md` → modelo de datos (Character, Mission, HappyEnding) — se traduce a tipos TypeScript
- `build/bubble-decisions.md` → lógica exacta de cada workflow — se traduce a funciones
- `testing/qa-report.md` → 42 casos de prueba — se convierten en tests automatizados

---

## 5. Modelo de datos (traducción directa del schema de Bubble)

```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
type CharacterStatus = 'active' | 'happy_ending' | 'abandoned';
type MissionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

interface Character {
  id: string;
  name: string;
  slotNumber: 1 | 2 | 3;
  status: CharacterStatus;
  level: 0 | 1 | 2 | 3;        // solo sube, nunca baja
  heartsTotal: number;          // puede bajar por penalizaciones
  lastMissionCompletedDate: string | null;  // ISO
  pendingAbandonmentScene: boolean;
  pendingCancellationScene: boolean;
}

interface Mission {
  id: string;
  characterId: string;
  name: string;
  difficulty: Difficulty;
  deadline: string;             // ISO timestamp exacto
  status: MissionStatus;
  completedDate: string | null;
  heartsAwarded: number | null;
}

interface HappyEnding {
  id: string;
  characterName: string;
  originalCharacterId: string;
  weddingDate: string;
}
```

Todo se guarda como un solo objeto JSON en localStorage, con versión de schema para migraciones futuras.

---

## 6. Fases del proyecto

### Fase 0 — Setup (1 sesión)
- [ ] Instalar VS Code, Node, Git, Claude Code (guiado)
- [ ] Crear repo con Vite + React + TS + Vitest (tests) + Tailwind (estilos)
- [ ] Copiar los docs de diseño al repo + escribir `CLAUDE.md` y `PROGRESO.md` del repo
- ✅ **Criterio de salida:** `npm run dev` muestra "Hola Habit Dating Sim" en el navegador.

### Fase 1 — Motor del juego (1-2 sesiones) ← el corazón, sin UI
- [ ] Tipos + capa de persistencia (localStorage con export/import JSON)
- [ ] Lógica pura: crear personaje (máx 3 slots), crear misión (máx 3 pendientes), completar misión (corazones según dificultad), level-up por umbrales, cancelación por deadline (penalización), abandono por 3 semanas de inactividad (reset a nivel 0), boda/happy ending
- [ ] Tests automatizados portando los 42 casos del `qa-report.md`
- ✅ **Criterio de salida:** todos los tests en verde. Aquí se valida TODA la mecánica antes de ver un solo pixel.

### Fase 2 — Pantallas (2-3 sesiones)
- [ ] Home: 3 slots, corazones, nivel, misiones pendientes, crear personaje
- [ ] Perfil de personaje + crear misión + completar misión
- [ ] Escenas: level-up, boda, abandono, cancelación (con placeholders de imagen)
- ✅ **Criterio de salida:** Hector juega el loop completo en el navegador y lo aprueba.

### Fase 3 — Triggers de tiempo (1 sesión)
- [ ] Al abrir la app se evalúan deadlines vencidos y abandonos (no necesita servidor: se chequea on-load, igual que decidimos en Bubble)
- ✅ **Criterio:** dejar pasar un deadline y ver la escena de cancelación al volver a abrir.

### Fase 4 — Pulido (1-2 sesiones)
- [ ] Estética dating-sim (paleta, tipografía, animaciones de corazones)
- [ ] Sprites/imágenes que Hector consiga (assets/placeholders mientras)
- [ ] Responsive para celular

### Fase 5 — Publicación (1 sesión, opcional)
- [ ] Deploy gratis a Vercel → URL para usarla desde el celular
- [ ] Verificar export/import de datos entre dispositivos

**Total estimado: 6-9 sesiones de trabajo.**

### Post-MVP (backlog)
- Mensaje al intentar crear 4to personaje ("las 3 habitaciones están ocupadas") — feedback de Hector del 2026-06-10
- Sincronización multi-dispositivo (Supabase)
- Sonido, más escenas, personalización de sprites

---

## 7. Reglas para las sesiones de Claude Code

Estas reglas van también en el `CLAUDE.md` del repo:

1. **Leer `PROGRESO.md` al inicio de cada sesión** y actualizarlo al final (mismo patrón que `STATUS-BUBBLE.md`).
2. **Tests primero en la mecánica.** Ninguna regla del juego se da por terminada sin test.
3. **Commit por milestone** con mensaje descriptivo. Nunca dejar trabajo sin commitear al cerrar sesión.
4. **Los docs de diseño mandan.** Si el código contradice `mecanicas-detalle.md`, el doc gana (o se actualiza el doc con decisión explícita de Hector).
5. **Español en la UI, inglés en el código.**
6. **No agregar dependencias** sin justificarlo en `PROGRESO.md`.

---

## 8. Qué necesita Hector para arrancar (Fase 0)

1. Instalar **VS Code**: https://code.visualstudio.com
2. Instalar **Node.js LTS**: https://nodejs.org
3. Instalar **Git**: https://git-scm.com
4. Instalar **Claude Code**: extensión "Claude Code" en VS Code (o `npm install -g @anthropic-ai/claude-code` en terminal) e iniciar sesión con tu cuenta de Anthropic.
5. Abrir VS Code → abrir Claude Code → primer prompt:

> "Lee C:\Users\hecto\Desktop\DirhectorCreativvo\DirhectorCreativo\projects\habit-dating-sim\build\PLAN-VSCODE.md y ejecuta la Fase 0: crea el proyecto en una carpeta nueva habit-dating-sim-app en mi Desktop, copia los documentos de diseño listados en la sección 4, y genera el CLAUDE.md y PROGRESO.md del repo."

Con eso la primera sesión queda encaminada sola.

---

## Conexiones
- [[STATUS-BUBBLE]] — historial del intento en Bubble y decisiones tomadas ahí
- [[flujo-pantallas]] / [[mecanicas-detalle]] / [[bubble-schema]] / [[bubble-decisions]] / [[qa-report]]
