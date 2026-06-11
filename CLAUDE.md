# CLAUDE.md — Habit Dating Sim

App personal de hábitos con mecánicas de dating sim (personajes, corazones, niveles, escenas de
abandono/boda/cancelación). Proyecto personal de Hector, no comercial.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (v4, vía `@tailwindcss/vite`)
- Vitest para tests
- Persistencia: un solo objeto JSON en `localStorage`, con versión de schema y export/import JSON

## Reglas de trabajo

1. **Leer `PROGRESO.md` al inicio de cada sesión** y actualizarlo al final (qué se hizo, qué falta,
   próximo paso concreto).
2. **Tests primero en la mecánica.** Ninguna regla del juego (corazones, niveles, abandono,
   cancelación, boda) se da por terminada sin test en Vitest.
3. **Commit por milestone** con mensaje descriptivo. Nunca dejar trabajo sin commitear al cerrar
   sesión.
4. **Los docs en `docs/` mandan.** Si el código contradice `docs/design/mecanicas-detalle.md` o
   `docs/build/bubble-schema.md`, el doc gana — o se actualiza el doc dejando explícito que fue
   decisión de Hector.
5. **Español en la UI y en los docs, inglés en el código** (nombres de variables, funciones, tipos).
6. **No agregar dependencias** sin justificarlo en `PROGRESO.md`.
7. **Hector no programa.** Explica en términos de "qué se ve/qué hace en la app", no de
   implementación, cuando le pidas que pruebe algo.

## Documentos de referencia (fuente de verdad del diseño)

- `docs/build/PLAN-VSCODE.md` — plan maestro de fases (0-5)
- `docs/design/flujo-pantallas.md` — wireframes y navegación de las 7 pantallas
- `docs/design/mecanicas-detalle.md` — sistema de corazones, umbrales de nivel, penalizaciones, abandono
- `docs/build/bubble-schema.md` — modelo de datos (Character, Mission, HappyEnding)
- `docs/build/bubble-decisions.md` — lógica exacta de cada workflow
- `docs/testing/qa-report.md` — 42 casos de prueba a portar como tests
- `docs/research/parametros-cientificos.md` — fundamentos de los parámetros de juego
- `docs/assets/placeholders/` — specs y placeholders de sprites/escenas

## Modelo de datos (referencia rápida)

```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
type CharacterStatus = 'active' | 'happy_ending' | 'abandoned';
type MissionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

interface Character {
  id: string;
  name: string;
  slotNumber: 1 | 2 | 3;
  status: CharacterStatus;
  level: 0 | 1 | 2 | 3;
  heartsTotal: number;
  lastMissionCompletedDate: string | null;
  pendingAbandonmentScene: boolean;
  pendingCancellationScene: boolean;
}

interface Mission {
  id: string;
  characterId: string;
  name: string;
  difficulty: Difficulty;
  deadline: string;
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

## Comandos

- `npm run dev` — levanta la app en http://localhost:5173
- `npm run build` — build de producción
- `npm run test` — corre los tests de Vitest
