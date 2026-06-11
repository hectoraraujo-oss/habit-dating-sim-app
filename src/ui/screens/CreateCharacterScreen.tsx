// Crear personaje: formulario mínimo (el doc no define pantalla aparte — solo nombre).

import { useState } from 'react';

interface CreateCharacterScreenProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function CreateCharacterScreen({ onConfirm, onCancel }: CreateCharacterScreenProps) {
  const [name, setName] = useState('');
  const valid = name.trim().length > 0;

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="border-b-4 border-pink-200 bg-white px-4 py-3">
        <button onClick={onCancel} className="text-sm font-medium text-pink-600 hover:underline">
          ← Cancelar
        </button>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <h1 className="text-xl font-bold text-stone-800">Nuevo personaje</h1>
        <p className="mt-1 text-sm text-stone-500">
          Un personaje es un hábito que quieres construir. Dale un nombre.
        </p>

        <label className="mt-6 block text-sm font-medium text-stone-600">
          ¿Qué hábito quieres construir?
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Ej: Ejercicio, Lectura, Meditar…"
            className="mt-2 w-full rounded-lg border-2 border-pink-200 bg-white px-3 py-2 text-stone-800 outline-none focus:border-pink-400"
          />
        </label>

        <button
          onClick={() => valid && onConfirm(name.trim())}
          disabled={!valid}
          className="mt-6 w-full rounded-xl bg-pink-500 px-4 py-3 font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          Crear personaje
        </button>
      </main>
    </div>
  );
}
