// Guion de Cupido para el onboarding (voz Dr. Hakim, aprobada por Hector 2026-06-13, P7-d).
// Texto EXACTO de flujo-y-guion §2 (intro) y §3 (handoff). No editar el copy sin re-aprobar.

import type { CupidoPose } from '../components/Cupido';

export interface PresenterFrame {
  pose: CupidoPose;
  text: string;
}

// 6 cuadros de intro. El pacto se reparte en los cuadros 4-6 para no caer de golpe.
export const INTRO_FRAMES: readonly PresenterFrame[] = [
  {
    pose: 'saludo',
    text: '¡Ahhh! Una nueva alma decidida a transformarse. Soy Cupido, maestro del amor. Y tú, tú serás mi próxima obra maestra.',
  },
  {
    pose: 'explicar',
    text: 'Esto no es una triste lista de pendientes. ¡Por favor! Es un escenario donde cada hábito que deseas se vuelve alguien: alguien que vive, respira y te espera.',
  },
  {
    pose: 'explicar',
    text: 'Tú decides el reparto. ¿Ejercicio? ¿Lectura? ¿Meditar? Le pones nombre y se muda contigo. Tres habitaciones, tres romances posibles.',
  },
  {
    pose: 'corazon',
    text: 'Cada promesa que cumples es una caricia al corazón. Yo lo llamo amor; aquí se mide en corazones. Y el amor, querido, hace crecer la relación.',
  },
  {
    pose: 'celebrar',
    text: 'Y si llegan juntos hasta el final… ¡BODA! Ese hábito ya es parte de ti, para siempre. ¡Ah, no existe final más glorioso! …Me emociono, lo sé.',
  },
  {
    pose: 'serena',
    text: 'Pero el amor verdadero es de verdad: si la abandonas demasiado, la relación se enfría, y un día se marcha. No para asustarte, sino porque esto importa. ¡Ahora ven! Tu primer romance espera.',
  },
];

// Cuadro final a pantalla completa (cierre simétrico con la intro).
export const HANDOFF_FRAME: PresenterFrame = {
  pose: 'despedida',
  text: 'Y con esto… ¡ya sabes amar en este mundo! Me retiro, pero jamás lejos: apareceré en los momentos que de verdad importan. El resto, alma valiente, depende de ti. ¡Ve! Y… cumple.',
};
