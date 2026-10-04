import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Particle } from './makeConfetti';

// A one-shot burst of party emoji from the middle of the screen
export function Confetti({ particles, originY = '60%' }: { particles: Particle[]; originY?: string }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion || particles.length === 0) return null;

  return (
    <div className="confetti" aria-hidden="true" style={{ '--origin-y': originY } as CSSProperties}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="confetti-piece"
          style={{ fontSize: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{
            x: p.dx,
            y: [0, p.dy, p.dy + 260],
            opacity: [1, 1, 0],
            rotate: p.rotate,
            scale: 1,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut', times: [0, 0.45, 1] }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
