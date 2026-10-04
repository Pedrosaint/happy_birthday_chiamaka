export interface Particle {
  id: number;
  emoji: string;
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
  duration: number;
  size: number;
}

const EMOJI = ['🎉', '🎊', '❤️', '✨', '🎂', '💛', '🥳'];

let nextId = 0;

// Call this from an event handler (it uses Math.random), then hand the result to <Confetti />.
// `spread` > 1 throws the pieces further.
export function makeConfetti(count: number, spread = 1): Particle[] {
  return Array.from({ length: count }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const power = (120 + Math.random() * 260) * spread;
    return {
      id: nextId++,
      emoji: EMOJI[Math.floor(Math.random() * EMOJI.length)],
      dx: Math.cos(angle) * power,
      dy: Math.sin(angle) * power - 80,
      rotate: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.15,
      duration: 1.2 + Math.random() * 0.9,
      size: 18 + Math.random() * 16,
    };
  });
}
