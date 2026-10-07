import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const PULL_TO_TOGGLE = 36; // how far she has to drag the rope, in px

// A hanging lantern in the corner. Drag its rope down (or tap the knob) and the light goes
// off, which is dark mode. Pull again and it comes back on.
export function Lantern({ lit, onToggle }: { lit: boolean; onToggle: () => void }) {
  const y = useMotionValue(0);
  const ropeHeight = useTransform(y, (v) => 36 + v);
  const dragged = useRef(false);
  const [used, setUsed] = useState(false);

  const toggle = () => {
    setUsed(true);
    onToggle();
  };

  return (
    <div className={`lantern ${lit ? 'on' : 'off'}`}>
      <div className="lantern-glow" />
      <svg className="lantern-body" viewBox="0 0 70 100" aria-hidden="true">
        <defs>
          <radialGradient id="lantern-glass" cx="50%" cy="55%" r="60%">
            <stop offset="0" stopColor="#fff6cf" />
            <stop offset="0.55" stopColor="#ffc247" />
            <stop offset="1" stopColor="#e8872a" />
          </radialGradient>
        </defs>
        <line x1="35" y1="0" x2="35" y2="14" stroke="#6b4a1e" strokeWidth="2.5" />
        <circle cx="35" cy="14" r="4" fill="none" stroke="#6b4a1e" strokeWidth="2.5" />
        <path d="M13 32 L35 17 L57 32 Z" fill="#6b4a1e" />
        <rect x="16" y="32" width="38" height="46" rx="6" fill={lit ? 'url(#lantern-glass)' : '#2c241d'} className="lantern-glass" />
        {lit && <ellipse cx="35" cy="58" rx="5" ry="9" fill="#fffbe6" className="lantern-flame" />}
        <g stroke="#6b4a1e" strokeWidth="2.5">
          <line x1="28" y1="32" x2="28" y2="78" />
          <line x1="42" y1="32" x2="42" y2="78" />
        </g>
        <rect x="12" y="78" width="46" height="8" rx="3" fill="#6b4a1e" />
        <circle cx="35" cy="90" r="3.5" fill="#6b4a1e" />
      </svg>

      <motion.div className="lantern-rope" style={{ height: ropeHeight }} />
      <motion.button
        type="button"
        className="lantern-knob"
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 64 }}
        dragElastic={0.15}
        dragSnapToOrigin
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          if (info.offset.y > PULL_TO_TOGGLE) toggle();
          window.setTimeout(() => (dragged.current = false), 50);
        }}
        onClick={() => {
          if (!dragged.current) toggle(); // a plain tap or Enter key works too
        }}
        aria-label={lit ? 'Turn the light off (dark mode)' : 'Turn the light on'}
        aria-pressed={!lit}
      />
      {!used && <span className="lantern-hint script-font">pull me</span>}
    </div>
  );
}
