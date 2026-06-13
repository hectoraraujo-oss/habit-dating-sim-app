// Botón compartido para elegir un archivo de respaldo y validarlo con importStateJson.
// Lo usan la pantalla de Respaldo (DataScreen) y la pantalla de inicio (StartScreen).
// No decide qué hacer con el estado válido (cada pantalla difiere: DataScreen pide
// confirmación porque reemplaza datos; StartScreen carga directo porque no hay nada que
// pisar). Solo encapsula el file picker + la validación + el copy de error.

import { useRef, useState } from 'react';
import type { GameState } from '../../types';
import { importStateJson } from '../../storage';

interface ImportFileButtonProps {
  label: string;
  className: string;
  onValid: (state: GameState) => void;
}

export function ImportFileButton({ label, className, onValid }: ImportFileButtonProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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
    onValid(result.state);
  }

  return (
    <>
      <button onClick={() => fileInput.current?.click()} className={className}>
        {label}
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
    </>
  );
}
