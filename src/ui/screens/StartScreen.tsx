// Pantalla de inicio (P7-a): solo aparece cuando state.onboarded === false.
// El gate vive en App.tsx, ANTES de la máquina de escenas (Riesgo R1 de la spec).
// Copy exacto de flujo-y-guion §1. Fondo cálido (bg-pink-50, mismo lenguaje que el resto).
//
// "Iniciar partida" -> arranca el flujo del presentador (App marca onboarded:true al iniciar).
// "Cargar partida" -> file picker compartido; un respaldo válido salta TODO el onboarding
// (App fuerza onboarded:true) y entra al flujo normal. Un archivo inválido muestra el error
// y permanece en esta pantalla.

import { Cupido } from '../components/Cupido';
import { ImportFileButton } from '../components/ImportFileButton';
import { Button } from '../components/Button';
import type { GameState } from '../../types';

interface StartScreenProps {
  onStart: () => void;
  onLoad: (state: GameState) => void;
}

export function StartScreen({ onStart, onLoad }: StartScreenProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-pink-50 px-6 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center">
          <Cupido pose="saludo" size={140} />
        </div>

        <h1 className="mt-6 font-mono text-2xl font-bold tracking-tight text-pink-600">
          💕 Habit Dating Sim
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Construye hábitos. Enamórate de la persona en que te vuelves.
        </p>

        <div className="mt-8 space-y-3">
          {/* "Iniciar partida" = el CTA primario de la app: botón 3D rosa (la firma). */}
          <Button onClick={onStart}>Iniciar partida</Button>
          {/* "Cargar partida" pasa por ImportFileButton (file picker, compartido con
              DataScreen): se mantiene como botón secundario flat, no 3D, para no derivar el
              cambio a DataScreen. Subordinado al CTA primario. */}
          <ImportFileButton
            label="Cargar partida"
            className="w-full rounded-cta border-2 border-pink-400 px-4 py-3 font-bold text-pink-600 transition hover:bg-pink-100"
            onValid={onLoad}
          />
        </div>
      </div>
    </div>
  );
}
