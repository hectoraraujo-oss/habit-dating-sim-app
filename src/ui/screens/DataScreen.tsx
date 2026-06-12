// Pantalla de respaldo: exportar/importar el estado completo como JSON.
// Los datos viven solo en localStorage de este navegador; esta pantalla es el
// respaldo manual (deuda de Fase 2, decisión P1 de Hector 2026-06-11).
// Importar reemplaza TODO el estado actual, por eso pide confirmación.

import { useRef, useState } from 'react';
import type { GameState } from '../../types';
import { exportStateJson, importStateJson } from '../../storage';

interface DataScreenProps {
  state: GameState;
  today: string;
  onImport: (state: GameState) => void;
  onBack: () => void;
}

export function DataScreen({ state, today, onImport, onBack }: DataScreenProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    const blob = new Blob([exportStateJson(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-dating-sim-respaldo-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file: File) {
    setError(null);
    const result = importStateJson(await file.text());
    if (!result.ok) {
      setError(
        result.error === 'invalid_json'
          ? 'Ese archivo no es un JSON válido.'
          : 'El archivo no es un respaldo de Habit Dating Sim (o es de otra versión de la app).',
      );
      return;
    }
    setPendingImport(result.state);
  }

  return (
    <div className="flex min-h-svh flex-col bg-pink-50">
      <header className="flex items-center gap-3 border-b-4 border-pink-200 bg-white px-4 py-3">
        <button onClick={onBack} className="text-xl text-stone-500 transition hover:text-stone-700" title="Volver">
          ←
        </button>
        <h1 className="font-mono text-lg font-bold tracking-tight text-pink-600">💾 Respaldo</h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 py-6">
        <p className="text-sm text-stone-600">
          Tus datos viven solo en este navegador. Descarga un respaldo de vez en cuando para no
          perder a nadie si se borra el caché o cambias de dispositivo.
        </p>

        <section className="rounded-xl border-2 border-pink-200 bg-white p-4">
          <h2 className="font-semibold text-stone-700">Exportar</h2>
          <p className="mt-1 text-sm text-stone-500">
            Descarga un archivo con todo: {state.characters.length}{' '}
            {state.characters.length === 1 ? 'personaje' : 'personajes'}, {state.missions.length}{' '}
            {state.missions.length === 1 ? 'misión' : 'misiones'} y {state.happyEndings.length} happy{' '}
            {state.happyEndings.length === 1 ? 'ending' : 'endings'}.
          </p>
          <button
            onClick={handleExport}
            className="mt-3 w-full rounded-xl bg-pink-500 px-4 py-3 font-bold text-white transition hover:bg-pink-600"
          >
            Descargar respaldo
          </button>
        </section>

        <section className="rounded-xl border-2 border-pink-200 bg-white p-4">
          <h2 className="font-semibold text-stone-700">Importar</h2>
          <p className="mt-1 text-sm text-stone-500">
            Restaura un respaldo descargado antes. Esto reemplaza por completo lo que tengas ahora.
          </p>
          <button
            onClick={() => fileInput.current?.click()}
            className="mt-3 w-full rounded-xl border-2 border-pink-400 px-4 py-3 font-bold text-pink-600 transition hover:bg-pink-100"
          >
            Elegir archivo de respaldo
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = '';
            }}
          />
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
        </section>
      </main>

      {pendingImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl">
            <p className="text-sm text-stone-700">
              ¿Reemplazar tus datos actuales con este respaldo? Lo que tienes ahora se pierde y se
              cargan {pendingImport.characters.length}{' '}
              {pendingImport.characters.length === 1 ? 'personaje' : 'personajes'} y{' '}
              {pendingImport.missions.length}{' '}
              {pendingImport.missions.length === 1 ? 'misión' : 'misiones'} del archivo.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPendingImport(null)}
                className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => onImport(pendingImport)}
                className="flex-1 rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-600"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
