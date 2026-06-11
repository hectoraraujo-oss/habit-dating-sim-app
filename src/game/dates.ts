// Fechas como strings ISO (YYYY-MM-DD), comparadas con granularidad de día.
// Decisión de TC-039: una misión completada el mismo día del deadline NO está vencida.

const MS_PER_DAY = 86_400_000;

function toUtcMs(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

// Días completos entre dos fechas. Positivo si `to` es posterior a `from`.
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

export function addDays(isoDate: string, days: number): string {
  return new Date(toUtcMs(isoDate) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function todayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
