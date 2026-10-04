import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from './Confetti';
import { makeConfetti, type Particle } from './makeConfetti';
import portrait from './assets/img/image_12.jpeg';

const CANDLES = [
  { x: 92, color: '#ff8fa3' },
  { x: 106, color: '#8ecae6' },
  { x: 120, color: '#ffd166' },
  { x: 134, color: '#a8e6a3' },
  { x: 148, color: '#c4a7e7' },
];

// A three-tier cake. The flames flicker; when `lit` turns false they shrink out one after
// another and a wisp of smoke rises from each candle.
function Cake({ lit }: { lit: boolean }) {
  return (
    <svg
      className="cake"
      viewBox="0 24 240 214"
      role="img"
      aria-label={lit ? 'A birthday cake with lit candles' : 'A birthday cake with the candles blown out'}
    >
      <defs>
        <radialGradient id="flame-glow" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fff7c2" />
          <stop offset="0.5" stopColor="#ffc233" />
          <stop offset="1" stopColor="#ff7a18" />
        </radialGradient>
      </defs>

      {/* plate */}
      <ellipse cx="120" cy="228" rx="108" ry="10" fill="#d9c9a8" />
      <ellipse cx="120" cy="224" rx="108" ry="10" fill="#f3e8d2" />

      {/* bottom tier */}
      <rect x="22" y="168" width="196" height="52" rx="10" fill="#f4c6c0" />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={32 + i * 20} cy="168" r="10" fill="#fffaf2" />
      ))}
      <rect x="22" y="196" width="196" height="8" fill="#8e1a31" opacity="0.9" />

      {/* middle tier */}
      <rect x="50" y="128" width="140" height="44" rx="9" fill="#fff0d9" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={59 + i * 18} cy="128" r="9" fill="#fffaf2" />
      ))}
      <rect x="50" y="154" width="140" height="7" fill="#c9a24d" />

      {/* top tier */}
      <rect x="82" y="92" width="76" height="40" rx="8" fill="#f4c6c0" />
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx={90 + i * 14} cy="92" r="7" fill="#fffaf2" />
      ))}
      <rect x="82" y="118" width="76" height="6" fill="#8e1a31" opacity="0.9" />

      {/* sprinkles */}
      {[[40, 186, '#8ecae6'], [78, 182, '#ffd166'], [118, 188, '#a8e6a3'], [160, 184, '#c4a7e7'], [196, 187, '#ff8fa3'], [66, 142, '#8e1a31'], [150, 146, '#8ecae6']].map(
        ([x, y, c]) => (
          <circle key={`${x}-${y}`} cx={x as number} cy={y as number} r="2.4" fill={c as string} />
        ),
      )}

      {/* candles, flames and smoke */}
      {CANDLES.map((c, i) => (
        <g key={c.x}>
          <rect x={c.x - 3} y="64" width="6" height="30" rx="2" fill={c.color} />
          <line x1={c.x} y1="58" x2={c.x} y2="64" stroke="#3a2a1a" strokeWidth="1.5" />
          <path
            className={`flame ${lit ? '' : 'out'}`}
            style={{ transitionDelay: `${i * 0.09}s`, animationDelay: `${i * 0.07}s` }}
            d={`M${c.x} 36 C${c.x + 7} 44 ${c.x + 6} 54 ${c.x} 58 C${c.x - 6} 54 ${c.x - 7} 44 ${c.x} 36Z`}
            fill="url(#flame-glow)"
          />
          {!lit && (
            <path
              className="smoke"
              style={{ animationDelay: `${0.25 + i * 0.09}s` }}
              d={`M${c.x} 54 q-5 -8 0 -14 t0 -14`}
            />
          )}
        </g>
      ))}
    </svg>
  );
}

// The last chapter: make a wish, blow out the candles, get the closing message.
export function Finale({ onReplay }: { onReplay: () => void }) {
  const [lit, setLit] = useState(true);
  const [burst, setBurst] = useState<Particle[]>([]);

  const blowOut = () => {
    setLit(false);
    setBurst(makeConfetti(60, 2));
  };

  return (
    <section className="chapter finale">
      <div className={`finale-glow ${lit ? '' : 'dim'}`} />
      <p className="eyebrow">The finale</p>
      <h3 className="finale-title script-font">{lit ? 'Make a wish…' : 'Wish made ✨'}</h3>

      <Cake lit={lit} />

      <AnimatePresence mode="wait">
        {lit ? (
          <motion.div
            key="before"
            className="finale-copy"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="finale-prompt">Close your eyes, think of something wonderful, then blow out the candles.</p>
            <button type="button" className="stage-btn" onClick={blowOut}>
              Blow out the candles 🌬️
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="after"
            className="finale-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9 }}
          >
            <img className="finale-photo" src={portrait} alt="Chiamaka" loading="lazy" decoding="async" />
            <p className="finale-message serif-font">
              Happy Birthday, my beautiful Chiamaka. May this year give you everything you just wished for. ❤️
            </p>
            <button type="button" className="ghost-btn" onClick={onReplay}>
              ↺ Play it again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Confetti particles={burst} originY="45%" />
    </section>
  );
}
