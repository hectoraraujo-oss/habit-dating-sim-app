// Cuadro de diálogo de Cupido a pantalla completa, reutilizable (intro, handoff y, más
// adelante, los puntos de recurrencia). Fondo cálido (placeholder en color sólido) +
// sprite de Cupido al centro + cuadro de texto abajo. Click en cualquier parte avanza.
// Link discreto "saltar intro ›" arriba a la derecha (opcional via onSkip).
//
// El fondo es un color sólido por ahora; cuando llegue fondo-intro.png (P2) se cambia el
// className por un <img>/background-image en un solo punto.

import type { ReactNode } from 'react';
import { Cupido, type CupidoPose } from './Cupido';

interface PresenterDialogProps {
  pose: CupidoPose;
  // Avanza al hacer click en cualquier parte.
  onAdvance: () => void;
  // Si se pasa, muestra el link "saltar intro ›" arriba a la derecha.
  onSkip?: () => void;
  // Texto del cuadro de diálogo.
  children: ReactNode;
  // CTA explícito abajo a la derecha (ej. "Empezar" en el handoff). Si se omite, una
  // pista discreta indica que se puede tocar para continuar.
  cta?: string;
}

export function PresenterDialog({ pose, onAdvance, onSkip, children, cta }: PresenterDialogProps) {
  return (
    <div
      onClick={onAdvance}
      className="relative flex min-h-svh cursor-pointer select-none flex-col bg-gradient-to-b from-pink-200 to-pink-50 px-6 py-8"
    >
      {onSkip && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          className="absolute right-4 top-4 cursor-pointer text-sm font-medium text-pink-500 transition hover:text-pink-700"
        >
          saltar intro ›
        </button>
      )}

      <div className="flex flex-1 items-center justify-center">
        <Cupido pose={pose} size={160} />
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl border-4 border-pink-300 bg-white p-5 shadow-lg">
        <p className="text-base leading-relaxed text-stone-800">{children}</p>
        <div className="mt-3 text-right">
          {cta ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdvance();
              }}
              className="rounded-xl bg-pink-500 px-5 py-2 font-bold text-white transition hover:bg-pink-600"
            >
              {cta}
            </button>
          ) : (
            <span className="text-xs text-pink-400">toca para continuar ›</span>
          )}
        </div>
      </div>
    </div>
  );
}
