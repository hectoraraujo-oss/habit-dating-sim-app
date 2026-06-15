// useReducedMotion — ¿el usuario pidió reducir el movimiento?
//
// El guard CSS global ya colapsa animaciones/transiciones a 1ms. Pero algunos efectos
// (el burst de corazones de la celebración mayor) deben NO renderizarse en absoluto bajo
// prefers-reduced-motion: colapsar a 1ms aún dispararía un parpadeo de N partículas. Este
// hook permite a un componente decidir en JS si monta el efecto.
//
// Guardado contra entornos sin window (tests/SSR): devuelve false.

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
