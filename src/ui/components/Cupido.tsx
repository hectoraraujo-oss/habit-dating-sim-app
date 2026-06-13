// Placeholder de Cupido, el presentador del onboarding (voz Dr. Hakim, decisión P7-d).
//
// PUNTO ÚNICO DE ARTE: hoy cada pose es un recuadro con emoji + etiqueta. Cuando Hector
// entregue los 6 PNG (P2), basta con:
//   1. importar los PNG aquí (como hace src/ui/sprites.ts),
//   2. mapearlos en CUPIDO_ART por pose,
//   3. cambiar el render a <img src={CUPIDO_ART[pose]} ... />.
// Ningún otro archivo conoce el arte de Cupido: todos consumen <Cupido pose=... />.

export type CupidoPose =
  | 'saludo' // abrir intro y pantalla de inicio
  | 'explicar' // exponer concepto
  | 'corazon' // hablar del amor / los corazones
  | 'celebrar' // boda / subida de nivel
  | 'serena' // decir el riesgo sin asustar
  | 'despedida'; // handoff final

const POSE_EMOJI: Record<CupidoPose, string> = {
  saludo: '👋',
  explicar: '🎭',
  corazon: '💘',
  celebrar: '🎉',
  serena: '🌙',
  despedida: '🙇',
};

const POSE_LABEL: Record<CupidoPose, string> = {
  saludo: 'saludo',
  explicar: 'explicar',
  corazon: 'corazón',
  celebrar: 'celebrar',
  serena: 'serena',
  despedida: 'despedida',
};

interface CupidoProps {
  pose: CupidoPose;
  size?: number;
}

export function Cupido({ pose, size = 128 }: CupidoProps) {
  return (
    <div
      className="flex select-none flex-col items-center justify-center rounded-xl border-2 border-dashed border-pink-400 bg-pink-100 text-pink-600"
      style={{ width: size, height: size }}
      aria-label={`Cupido (${POSE_LABEL[pose]})`}
      role="img"
    >
      <span style={{ fontSize: size * 0.38, lineHeight: 1 }}>{POSE_EMOJI[pose]}</span>
      <span className="mt-1 font-mono font-bold" style={{ fontSize: Math.max(9, size * 0.1) }}>
        Cupido
      </span>
      <span className="font-mono opacity-70" style={{ fontSize: Math.max(8, size * 0.085) }}>
        [{POSE_LABEL[pose]}]
      </span>
    </div>
  );
}
