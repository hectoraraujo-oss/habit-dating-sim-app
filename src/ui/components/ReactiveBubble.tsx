// Bocadillo reactivo unificado (dirección-visual.md §2 principio 5: "Cada superficie tiene
// voz"). Antes la línea reactiva del personaje + la de Cupido se renderizaban con markup
// repetido (Perfil, resultado de completar). Este componente estandariza esa presentación:
//   - caja con --radius-card y fondo --color-surface-soft
//   - texto del personaje en italic body, --color-ink
//   - línea de Cupido en --color-love, text-xs, prefijada "Cupido:"
// NO cambia el contenido: las líneas siguen saliendo de reactionFor. Solo unifica la forma.

interface ReactiveBubbleProps {
  // Línea reactiva del personaje (segunda persona). Se muestra entre comillas, italic.
  characterLine: string;
  // Línea opcional de Cupido (el presentador). Si viene, va prefijada "Cupido:" en --color-love.
  cupidoLine?: string | null;
  // Clases extra de layout para la caja (ancho máximo, márgenes) — la PRESENTACIÓN base
  // (radio, fondo, padding) la fija el componente; el contenedor decide su sitio en la pantalla.
  className?: string;
}

export function ReactiveBubble({ characterLine, cupidoLine, className = '' }: ReactiveBubbleProps) {
  return (
    <div
      className={`rounded-card border border-border bg-surface-soft px-4 py-3 ${className}`.trim()}
    >
      <p className="text-sm italic leading-relaxed text-ink">“{characterLine}”</p>
      {cupidoLine && <p className="mt-1 text-xs text-love">Cupido: {cupidoLine}</p>}
    </div>
  );
}
