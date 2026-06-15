// Helpers de presentación: fechas en español, etiquetas de dificultad y nivel.

import type { Difficulty, Level } from '../types';
import { daysBetween } from '../game/dates';

function parseLocal(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const LONG_DATE = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "Jueves, 4 junio"
export function formatLongDate(isoDate: string): string {
  return capitalize(LONG_DATE.format(parseLocal(isoDate)));
}

const SHORT_DATE = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

// Fecha corta absoluta para fechas históricas o lejanas: "4 jun 2026". A diferencia de
// formatDeadline (relativo: hoy/mañana/vencida), aquí siempre se muestra la fecha completa,
// para "venció el …", "Juntos desde …" y el historial del perfil.
export function formatShortDate(isoDate: string): string {
  return SHORT_DATE.format(parseLocal(isoDate));
}

// Deadline relativo para listas: "hoy", "mañana", "vencida", o fecha corta
export function formatDeadline(deadline: string, today: string): string {
  const days = daysBetween(today, deadline);
  if (days < 0) return 'vencida';
  if (days === 0) return 'hoy';
  if (days === 1) return 'mañana';
  return capitalize(
    new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' }).format(
      parseLocal(deadline),
    ),
  );
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
};

// Leyenda de flujo-pantallas.md: ⚡ = Fácil, ★ = Media, ★★ = Difícil
export const DIFFICULTY_ICON: Record<Difficulty, string> = {
  easy: '⚡',
  medium: '★',
  hard: '★★',
};

export const DIFFICULTY_HINT: Record<Difficulty, string> = {
  easy: 'Puedo hacerlo incluso cansado',
  medium: 'Requiere esfuerzo real',
  hard: 'Me va a costar, pero vale la pena',
};

export const LEVEL_STAGE: Record<Level, string> = {
  0: 'Extraños',
  1: 'Conocidos',
  2: 'Amigos cercanos',
  3: 'Amor consolidado',
};
