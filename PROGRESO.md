# PROGRESO — Habit Dating Sim

## Estado actual: Fase 0 — Setup ✅ completada

- [x] Proyecto creado con Vite + React + TypeScript
- [x] Tailwind CSS v4 configurado (`@tailwindcss/vite`)
- [x] Vitest instalado como dependencia de desarrollo
- [x] Docs de diseño copiados a `docs/`
- [x] `CLAUDE.md` y `PROGRESO.md` creados
- [x] Repo Git inicializado y subido a GitHub (privado)
- [ ] **Pendiente para cerrar Fase 0:** correr `npm run test` por primera vez una vez exista al
      menos un test (Vitest no tiene script `test` configurado todavía en `package.json`)

## Próximo paso

**Fase 1 — Motor del juego** (sin UI):

1. Definir tipos en `src/types.ts` (ver modelo de datos en `CLAUDE.md` / `docs/build/bubble-schema.md`)
2. Capa de persistencia en `src/storage.ts` (localStorage, export/import JSON, versión de schema)
3. Lógica pura del juego en `src/game/` (crear personaje máx 3 slots, crear misión máx 3
   pendientes, completar misión y otorgar corazones según `docs/design/mecanicas-detalle.md`,
   level-up por umbrales, cancelación por deadline, abandono por 3 semanas de inactividad,
   happy ending/boda)
4. Agregar script `"test": "vitest run"` a `package.json` y portar los 42 casos de
   `docs/testing/qa-report.md` como tests de Vitest
5. Criterio de salida: todos los tests en verde

## Backlog (post-MVP)

- Mensaje al intentar crear un 4to personaje ("las 3 habitaciones están ocupadas")
- Sincronización multi-dispositivo (Supabase)
- Sonido, más escenas, personalización de sprites
- Galería "Happy Endings"
- Notificaciones push
- Ranking semanal
- Niveles 4 y 5
- Estadísticas de racha y consistencia

## Historial de sesiones

### 2026-06-10 — Setup inicial + GitHub
- Se creó el proyecto con `npm create vite@latest -- --template react-ts`
- Se configuró Tailwind v4 vía plugin de Vite
- Se reemplazó el contenido default de `App.tsx` por "Hola Habit Dating Sim"
- Se copiaron los docs de diseño desde el vault a `docs/`
- Se creó repo privado en GitHub y se hizo push inicial
- Se configuró el repo para dispatch remoto de Claude Code (GitHub App / Actions)
