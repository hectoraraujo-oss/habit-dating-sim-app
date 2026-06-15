// Botón 3D estilo Duolingo — la FIRMA del "feel Duolingo" (Fase 4 Ola 5, §2 + §6).
//
// Look en reposo: una "tecla física". Cara de color + borde inferior 3D SÓLIDO de 4px
// (box-shadow: 0 4px 0 var(--color-primary-press), blur 0, NO la sombra difusa). Al
// presionar, la cara baja 4px (whileTap y:4) Y el borde 3D colapsa a 0 0 0 simultáneamente:
// el botón se hunde contra la mesa. Spring rápido (stiffness 600, damping 20) para que el
// regreso al soltar rebote levemente (micro-overshoot). Hundir ~80ms, volver ~180ms.
//
// Variantes (rol, mismo patrón 3D): 'primary' (cara primary / borde primary-press, default),
// 'secondary' (cara surface / borde border / texto ink — para CTA sobrios: "Aceptar la
// pérdida", "Entendido", sin fiesta), 'destructive' (cara blanca / borde+texto danger, sin
// bounce festivo — eliminar).
//
// Accesibilidad: useReducedMotion() de motion/react. Si el usuario pide reducir movimiento,
// no hay spring (el press no anima): respeta el guard global de prefers-reduced-motion.
//
// Anti double-tap: respeta el `disabled` que ya pasan las pantallas. Disabled queda hundido
// (y:4, sombra 0) + opacity 0.7. Es drop-in para reemplazar los <button> de CTA primario.

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  className?: string;
}

// Cara, borde 3D (sombra sólida en reposo) y texto por variante. El highlight interno
// (inset blanco 1px) da el brillo de "tecla". Las variantes sobrias (secondary/destructive)
// tienen cara clara, así que conservan el borde 3D pero sin el énfasis festivo del rosa.
const VARIANT: Record<ButtonVariant, { face: string; rest: string; text: string }> = {
  primary: {
    face: 'var(--color-primary)',
    rest: '0 4px 0 var(--color-primary-press), inset 0 1px 0 rgb(255 255 255 / 0.25)',
    text: '#ffffff',
  },
  secondary: {
    face: 'var(--color-surface)',
    rest: '0 4px 0 var(--color-border), inset 0 1px 0 rgb(255 255 255 / 0.6)',
    text: 'var(--color-ink)',
  },
  destructive: {
    face: '#ffffff',
    rest: '0 4px 0 var(--color-danger), inset 0 1px 0 rgb(255 255 255 / 0.6)',
    text: 'var(--color-danger)',
  },
};

// Sombra colapsada (botón hundido): el borde 3D desaparece, queda solo el highlight interno.
const PRESSED_SHADOW: Record<ButtonVariant, string> = {
  primary: '0 0 0 rgb(0 0 0 / 0), inset 0 1px 0 rgb(255 255 255 / 0.25)',
  secondary: '0 0 0 rgb(0 0 0 / 0), inset 0 1px 0 rgb(255 255 255 / 0.6)',
  destructive: '0 0 0 rgb(0 0 0 / 0), inset 0 1px 0 rgb(255 255 255 / 0.6)',
};

// Spring de la firma: rápido y con leve rebote al soltar (§2). Hundir ~80ms, volver ~180ms.
const PRESS_SPRING = { type: 'spring', stiffness: 600, damping: 20 } as const;

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const reduced = useReducedMotion();
  const v = VARIANT[variant];

  // Disabled: queda hundido (y:4, sombra colapsada) + opacity 0.7. Con reduced-motion el
  // press no anima (sin spring): el estado se aplica directo, respetando el guard global.
  const restShadow = disabled ? PRESSED_SHADOW[variant] : v.rest;
  const restY = disabled ? 4 : 0;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // Press físico: solo cuando NO está disabled NI con reduced-motion. La cara baja y el
      // borde 3D colapsa simultáneamente (el botón se hunde). El regreso (estado de reposo)
      // rebota levemente por el spring.
      whileTap={disabled || reduced ? undefined : { y: 4, boxShadow: PRESSED_SHADOW[variant] }}
      animate={{ y: restY, opacity: disabled ? 0.7 : 1 }}
      transition={reduced ? { duration: 0 } : PRESS_SPRING}
      // El borde 3D en reposo vive en el style (CSS), NO solo en el animate de motion: así el
      // look de "tecla" siempre está presente sin depender del primer tick de rAF. motion solo
      // anima el COLAPSO de la sombra en el press (whileTap) y la vuelta al soltar.
      style={{
        backgroundColor: v.face,
        color: v.text,
        borderRadius: 'var(--radius-cta)',
        boxShadow: restShadow,
      }}
      className={[
        // Alto táctil generoso (py-4 mínimo), texto Baloo 2 bold, centrado. El font-bold +
        // font-body (Baloo 2) viene del chrome; aquí lo fijamos por si el contexto lo baja.
        'inline-flex w-full items-center justify-center px-6 py-4 text-lg font-bold',
        'font-body select-none disabled:cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </motion.button>
  );
}
