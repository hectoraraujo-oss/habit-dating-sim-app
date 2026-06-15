// Crear personaje: formulario mínimo (el doc no define pantalla aparte — solo nombre).

import { useState } from 'react';
import { Button } from '../components/Button';

interface CreateCharacterScreenProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
  // Durante el onboarding: oculta "Cancelar" (no hay a dónde volver aún) y resalta el
  // campo de nombre (spotlight del tutorial). Default: comportamiento normal sin cambios.
  tutorial?: boolean;
  onNameChange?: (name: string) => void;
}

export function CreateCharacterScreen({
  onConfirm,
  onCancel,
  tutorial = false,
  onNameChange,
}: CreateCharacterScreenProps) {
  const [name, setName] = useState('');
  const valid = name.trim().length > 0;

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="border-b-4 border-pink-200 bg-white px-4 py-3">
        {!tutorial && (
          <button onClick={onCancel} className="text-sm font-medium text-pink-600 hover:underline">
            ← Cancelar
          </button>
        )}
        {tutorial && <span className="text-sm font-medium text-pink-300">Tutorial</span>}
      </header>

      <main className={`mx-auto w-full max-w-md flex-1 px-4 py-8 ${tutorial ? 'pb-40' : ''}`}>
        <h1 className="text-xl font-bold text-stone-800">Nuevo personaje</h1>
        <p className="mt-1 text-sm text-stone-500">
          Un personaje es un hábito que quieres construir. Dale un nombre.
        </p>

        <label className="mt-6 block text-sm font-medium text-stone-600">
          ¿Qué hábito quieres construir?
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              onNameChange?.(e.target.value);
            }}
            maxLength={40}
            placeholder="Ej: Ejercicio, Lectura, Meditar…"
            className={`mt-2 w-full rounded-lg border-2 border-pink-200 bg-white px-3 py-2 text-stone-800 outline-none focus:border-pink-400 ${
              tutorial ? 'ring-4 ring-pink-400 ring-offset-2' : ''
            }`}
          />
        </label>

        <Button onClick={() => valid && onConfirm(name.trim())} disabled={!valid} className="mt-6">
          Crear personaje
        </Button>
      </main>
    </div>
  );
}
