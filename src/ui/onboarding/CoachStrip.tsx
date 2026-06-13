// Franja inferior fija del tutorial guiado: Cupido en miniatura + burbuja de texto.
// Va FIJA abajo, encima de las pantallas reales (CreateCharacterScreen / CreateMissionScreen)
// sin rediseñarlas. pointer-events: la franja sí recibe clicks (su propio botón), pero NO
// bloquea el resto de la pantalla: el usuario sigue pudiendo escribir/elegir arriba.

import { Cupido, type CupidoPose } from '../components/Cupido';

interface CoachStripProps {
  pose: CupidoPose;
  text: string;
}

export function CoachStrip({ pose, text }: CoachStripProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="pointer-events-auto mx-auto flex max-w-md items-start gap-3 rounded-2xl border-2 border-pink-300 bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="shrink-0">
          <Cupido pose={pose} size={56} />
        </div>
        <p className="pt-1 text-sm leading-snug text-stone-800">{text}</p>
      </div>
    </div>
  );
}
