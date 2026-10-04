import { motion } from 'framer-motion';

const GATHER = { duration: 2.2, delay: 0.35, ease: [0.65, 0, 0.35, 1] as const };

// A theatre curtain: velvet drapes that gather to the sides when she pulls the cord
// (or taps the button), then the whole thing fades away to show the page behind it.
export function RealCurtain({
  open,
  focusButton,
  onPull,
  onGone,
}: {
  open: boolean;
  focusButton: boolean; // true when she's been using the keyboard
  onPull: () => void;
  onGone: () => void;
}) {
  return (
    <motion.div
      className="stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 0 : 1 }}
      // fade in on arrival; once the drapes are gathered, fade out and tell the page we're done
      transition={open ? { delay: 2.5, duration: 0.8 } : { duration: 0.8 }}
      onAnimationComplete={() => open && onGone()}
    >
      <motion.div className="drape drape-left" style={{ originX: 0 }} initial={false} animate={{ scaleX: open ? 0.14 : 1 }} transition={GATHER} />
      <motion.div className="drape drape-right" style={{ originX: 1 }} initial={false} animate={{ scaleX: open ? 0.14 : 1 }} transition={GATHER} />
      <div className="valance" />

      {/* the golden cord: a shortcut for anyone who wants to literally pull it */}
      <motion.div
        className="tassel"
        aria-hidden="true"
        animate={{ y: open ? [0, 60, 0] : 0 }}
        transition={{ duration: 0.7 }}
        onClick={() => !open && onPull()}
      >
        <div className="tassel-cord" />
        <div className="tassel-knob" />
        <div className="tassel-skirt" />
      </motion.div>

      <motion.div
        className="stage-content"
        animate={{ opacity: open ? 0 : 1, y: open ? -12 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="stage-emoji"
          aria-hidden="true"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
        >
          🥁
        </motion.div>
        <h1 className="stage-title script-font">Drumroll, please…</h1>
        <p className="stage-sub">Your surprise is right behind this curtain.</p>
        <button type="button" className="stage-btn" onClick={onPull} disabled={open} autoFocus={focusButton}>
          Open the curtain 🎭
        </button>
      </motion.div>
    </motion.div>
  );
}
