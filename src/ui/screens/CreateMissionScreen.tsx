// Pantalla 3: Crear misión — 3 campos, preview de recompensa (flujo-pantallas.md).

import { useEffect, useState } from 'react';
import type { Character, Difficulty, GameState } from '../../types';
import { HEARTS_BY_DIFFICULTY, MAX_PENDING_MISSIONS_PER_CHARACTER } from '../../game/constants';
import { addDays } from '../../game/dates';
import { pendingMissions } from '../../game/engine';
import { DIFFICULTY_HINT, DIFFICULTY_ICON, DIFFICULTY_LABEL } from '../format';
import { Sprite } from '../components/Sprite';

// Pasos del tutorial guiado: el orden en que Cupido acompaña los campos (flujo-y-guion §3).
export type MissionTutorialStep = 'name' | 'difficulty' | 'deadline' | 'reward';

interface CreateMissionScreenProps {
  state: GameState;
  character: Character;
  today: string;
  onConfirm: (name: string, difficulty: Difficulty, deadline: string) => void;
  onCancel: () => void;
  // Durante el onboarding: oculta "Cancelar", deja espacio para la franja de Cupido, y
  // avisa qué campo está tocando el usuario para que Cupido reaccione. Default: normal.
  tutorial?: boolean;
  onTutorialStep?: (step: MissionTutorialStep) => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export function CreateMissionScreen({
  state,
  character,
  today,
  onConfirm,
  onCancel,
  tutorial = false,
  onTutorialStep,
}: CreateMissionScreenProps) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  // Default: 3 días desde hoy. Rango: HOY hasta 14 días.
  // Decisión P5 de Hector (2026-06-12): el mínimo pasó de mañana a hoy ("hoy hago X").
  const [deadline, setDeadline] = useState(addDays(today, 3));
  const [showNameError, setShowNameError] = useState(false);

  const minDeadline = today;
  const maxDeadline = addDays(today, 14);
  const limitReached = pendingMissions(state, character.id).length >= MAX_PENDING_MISSIONS_PER_CHARACTER;
  const valid = name.trim().length > 0 && deadline >= minDeadline && deadline <= maxDeadline;

  // Tutorial: cuando el formulario queda completo y válido, Cupido pasa a hablar de la
  // recompensa (último paso antes de confirmar, flujo-y-guion §3).
  useEffect(() => {
    if (tutorial && valid) onTutorialStep?.('reward');
  }, [tutorial, valid, onTutorialStep]);

  function handleConfirm() {
    if (!name.trim()) {
      setShowNameError(true);
      return;
    }
    if (valid) onConfirm(name.trim(), difficulty, deadline);
  }

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="border-b-4 border-pink-200 bg-white px-4 py-3">
        {!tutorial && (
          <button onClick={onCancel} className="text-sm font-medium text-pink-600 hover:underline">
            ← Cancelar
          </button>
        )}
        {tutorial && <span className="text-sm font-medium text-pink-300">Tutorial</span>}
        <div className="mt-1 flex items-center gap-2">
          <Sprite character={character} size={28} />
          <h1 className="font-bold text-stone-800">Nueva misión para {character.name}</h1>
        </div>
      </header>

      <main className={`mx-auto w-full max-w-md flex-1 px-4 py-6 ${tutorial ? 'pb-40' : ''}`}>
        {limitReached ? (
          <p className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4 text-sm text-orange-700">
            Ya tienes {MAX_PENDING_MISSIONS_PER_CHARACTER} misiones activas con {character.name}.
            Completa alguna antes de crear otra.
          </p>
        ) : (
          <>
            <label className="block text-sm font-medium text-stone-600">
              ¿Qué vas a hacer?
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowNameError(false);
                  if (tutorial && e.target.value.trim()) onTutorialStep?.('name');
                }}
                maxLength={60}
                placeholder="¿Qué vas a hacer?"
                className={`mt-2 w-full rounded-lg border-2 bg-white px-3 py-2 text-stone-800 outline-none focus:border-pink-400 ${
                  showNameError ? 'border-red-400' : 'border-pink-200'
                } ${tutorial ? 'ring-4 ring-pink-400 ring-offset-2' : ''}`}
              />
              {showNameError && <span className="text-xs text-red-500">Dale un nombre a esta misión</span>}
            </label>

            <p className="mt-5 text-sm font-medium text-stone-600">Dificultad:</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setDifficulty(option);
                    if (tutorial) onTutorialStep?.('difficulty');
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition ${
                    difficulty === option
                      ? 'border-pink-500 bg-pink-100'
                      : 'border-pink-200 bg-white hover:border-pink-300'
                  }`}
                >
                  <span className="text-lg">{DIFFICULTY_ICON[option]}</span>
                  <span className="text-sm font-semibold text-stone-700">{DIFFICULTY_LABEL[option]}</span>
                  <span className="text-[10px] leading-tight text-stone-400">{DIFFICULTY_HINT[option]}</span>
                </button>
              ))}
            </div>

            <label className="mt-5 block text-sm font-medium text-stone-600">
              Fecha límite:
              <input
                type="date"
                value={deadline}
                min={minDeadline}
                max={maxDeadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  if (tutorial) onTutorialStep?.('deadline');
                }}
                onFocus={() => tutorial && onTutorialStep?.('deadline')}
                className="mt-2 w-full rounded-lg border-2 border-pink-200 bg-white px-3 py-2 text-stone-800 outline-none focus:border-pink-400"
              />
            </label>

            <p className="mt-5 rounded-lg border border-dashed border-pink-300 bg-white px-3 py-2 text-center text-sm text-stone-600">
              Si completas esto ganarás: <strong>+{HEARTS_BY_DIFFICULTY[difficulty]} 💕</strong>
            </p>

            <p className="mt-3 text-center text-xs text-stone-400">
              ⚠ Cambiar la fecha límite después penaliza corazones.
            </p>

            <button
              onClick={handleConfirm}
              disabled={!valid && name.trim().length > 0}
              className="mt-5 w-full rounded-cta bg-primary px-4 py-3 font-bold text-white shadow-cta transition hover:bg-primary-press disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
            >
              Confirmar misión
            </button>
          </>
        )}
      </main>
    </div>
  );
}
