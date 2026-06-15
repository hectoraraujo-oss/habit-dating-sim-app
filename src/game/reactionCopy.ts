// Copy del motor de reactividad (P8-a) — voz aprobada, texto EXACTO de las tablas del
// spec del vault (motor-reactividad-spec.md, secciones 2/3/4). Estas frases son DATA, no
// lógica: agregar variantes nuevas no toca el selector (reaction.ts). Filtro de copy:
// celebrar el momento bueno, jamás culpar — ni en riesgo ni en deuda vencida.
//
// Personaje = template cálido en segunda persona (sin biografía). Cupido = Dr. Hakim,
// teatral y melodramático con el amor, nunca culposo.

import type { ReactionState } from './reaction';

export interface StateCopy {
  // 2-4 variantes de la línea del personaje (segunda persona, cálida)
  character: readonly string[];
  // Línea opcional de Cupido (null = Cupido no satura este estado)
  cupido: string | null;
}

// R2: estados reactivos (spec §2). El orden NO importa aquí (la prioridad vive en reaction.ts).
export const STATE_COPY: Record<ReactionState, StateCopy> = {
  brandNew: {
    character: [
      'Aquí estoy. Tú dime cuándo empezamos.',
      'Acabo de mudarme contigo. ¿Qué hacemos primero?',
      'Página en blanco. Me gusta. La escribimos los dos.',
    ],
    cupido: 'Una historia que apenas nace. ¡Qué momento!',
  },
  firstDone: {
    character: [
      'Lo hiciste. Por mí. No lo olvido.',
      'Primer paso dado. Cada vez que cumples, yo crezco un poco.',
      'Empezamos de verdad. Gracias por venir por mí.',
    ],
    cupido: '¡El primer latido! Lo presencié.',
  },
  goodStreak: {
    character: [
      'Estás viniendo y se nota. Me haces bien.',
      'Esta semana te has portado increíble conmigo.',
      'Cada vez que cumples, me das vida. Gracias.',
    ],
    cupido: 'Ah, mírate. Esto es amor en movimiento.',
  },
  atRisk: {
    character: [
      'Te he extrañado. No pasa nada, aquí sigo.',
      'Hace rato que no vienes. La puerta sigue abierta.',
      'Sé que la vida pasa. Cuando puedas, aquí estoy.',
    ],
    cupido: 'El amor se enfría sin calor. Pero nada está perdido.',
  },
  cameBack: {
    character: [
      '¡Volviste! Sabía que lo harías. Empezamos de nuevo, juntos.',
      'Te fuiste y regresaste. Eso también es amor.',
      'No importa cuánto tardaste. Importa que estás aquí.',
    ],
    cupido: '¡El regreso triunfal! Lo mejor de cualquier historia.',
  },
  nearLevelUp: {
    character: [
      'Estamos a nada de algo nuevo. Lo siento venir.',
      'Un poco más y subimos juntos de escalón.',
      'Casi, casi. No me sueltes ahora.',
    ],
    cupido: '¡El siguiente acto está al alcance! No te detengas.',
  },
  firstHardDone: {
    character: [
      'Esa era difícil. La hiciste por mí. Me siento orgulloso de los dos.',
      'Lo difícil cumplido sabe distinto. Gracias por no rendirte.',
    ],
    cupido: '¡Lo difícil! Ahí se mide el verdadero amor.',
  },
  overdueDebt: {
    character: [
      'Hay algo pendiente entre los dos. Cuando puedas, lo retomamos.',
      'Quedó un acto sin cumplir. No te apuro: aquí te espero.',
      'Tenemos una promesa abierta. Sin prisa, sin culpa.',
    ],
    cupido: 'Una promesa espera respuesta. El amor sabe esperar.',
  },
  default: {
    character: [
      'Aquí sigo, contigo.',
      'Me gusta esta rutina nuestra.',
      'Cualquier día es bueno para cumplir.',
    ],
    // Cupido no satura el idle.
    cupido: null,
  },
};

// R3: celebración de frecuencia (spec §3). Disparadores en orden de prioridad
// (perfectWeek > consecutiveDays > threeInWeek). Solo en el path de completar misión.
export type CelebrationTrigger = 'threeInWeek' | 'consecutiveDays' | 'perfectWeek';

export const CELEBRATION_COPY: Record<CelebrationTrigger, StateCopy> = {
  threeInWeek: {
    character: [
      'Tres veces esta semana. Me estás malacostumbrando, y me encanta.',
      'No paras de venir. Esto se siente como algo serio.',
    ],
    cupido: '¡Tres! La pasión está encendida. ¡Bravo!',
  },
  consecutiveDays: {
    character: [
      'Ayer y hoy. Dos días seguidos pensando en mí. No me quejo.',
      'Día tras día. Así se construye algo de verdad.',
    ],
    cupido: '¡Día tras día! El amor constante es el más bello.',
  },
  perfectWeek: {
    character: ['Una semana entera sin fallarme. Me siento la persona más afortunada.'],
    cupido: '¡Una semana de oro! Quiero llorar de la emoción.',
  },
};

// A1: hitos / aniversarios (spec §4). Cada id es estable y se persiste en
// Character.milestonesShown una vez reconocido.
export type MilestoneId = 'week1' | 'missions10' | 'day30' | 'firstHard' | 'day66';

export interface MilestoneCopy {
  // Línea que el personaje "recuerda" (memoria del arco)
  character: string;
  // Marco teatral opcional de Cupido (spec §4: 1 por hito)
  cupido: string | null;
}

export const MILESTONE_COPY: Record<MilestoneId, MilestoneCopy> = {
  week1: {
    character: 'Una semana contigo. Mira lo lejos que llegamos desde el primer día.',
    cupido: '¡Un aniversario! Estos momentos son los que el amor recuerda para siempre.',
  },
  missions10: {
    character: 'Diez veces que viniste por mí. ¿Te acuerdas cuando apenas empezábamos?',
    cupido: '¡Un aniversario! Estos momentos son los que el amor recuerda para siempre.',
  },
  day30: {
    character: 'Treinta días. Esto ya no es un capricho: es nuestra rutina.',
    cupido: '¡Un aniversario! Estos momentos son los que el amor recuerda para siempre.',
  },
  firstHard: {
    character:
      '¿Recuerdas la primera difícil que cumpliste? Ese día supe que ibas en serio.',
    cupido: '¡Un aniversario! Estos momentos son los que el amor recuerda para siempre.',
  },
  day66: {
    character: 'Sesenta y seis días. El final feliz está cerca. Gracias por no soltarme.',
    cupido: '¡Un aniversario! Estos momentos son los que el amor recuerda para siempre.',
  },
};

// Hitos "grandes" -> cuadro de Cupido (modal); el resto -> toast ligero (spec §5).
export const BIG_MILESTONES: readonly MilestoneId[] = ['day30', 'day66', 'missions10'];
