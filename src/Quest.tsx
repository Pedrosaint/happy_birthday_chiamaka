import { useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { Confetti } from './Confetti';
import { makeConfetti, type Particle } from './makeConfetti';
import { sfx } from './sound';

// Her birthday is the 11th of October. On the day the first question says "today"; on any
// other day it asks about the date instead, so it reads right whether it's opened on time or late.
const TODAY = new Date();
const IS_BIRTHDAY_TODAY = TODAY.getMonth() === 9 && TODAY.getDate() === 11;

interface Answer {
  label: string;
  reply: string; // the comeback shown at the top of the next screen
}

interface Step {
  emoji: string;
  question: string;
  answers: Answer[];
  // a button that dodges her a few times before giving in (the last question)
  runaway?: { label: string; giveUp: string; reply: string };
}

// Add, remove or reword steps here. The last step hands over to the curtain.
const STEPS: Step[] = [
  {
    emoji: '🎂',
    question: IS_BIRTHDAY_TODAY
      ? 'Hey Chiamaka… you know today is your birthday?'
      : 'Hey Chiamaka… do you know what the 11th of October is?',
    answers: [
      {
        label: IS_BIRTHDAY_TODAY ? 'Yes, I know 😄' : 'Yes… my birthday 😄',
        reply: 'Ahh, so you do know! 😏',
      },
    ],
  },
  {
    emoji: '🤨',
    question: "And you really thought I'd forget?",
    answers: [
      { label: 'Never 😌', reply: 'Good answer. Very good answer. 😌' },
      { label: 'Hmm… maybe 😅', reply: 'Wow. After everything? 😤' },
    ],
  },
  {
    emoji: '🍰',
    question: 'Serious question: how much cake have you eaten this birthday season?',
    answers: [
      { label: 'A normal amount 😇', reply: 'Liar. 😂' },
      { label: 'An unreasonable amount 😋', reply: 'Respect. Honesty is beautiful. 🫡' },
    ],
  },
  {
    emoji: '🕵️',
    question: 'Plot twist: I made you something. But first you have to pass a test.',
    answers: [
      { label: 'Bring it on 😤', reply: "That's the spirit! 💪" },
      { label: "I'm scared 🙈", reply: "Relax, it's an easy test. Probably. 😏" },
    ],
  },
  {
    emoji: '💅',
    question: 'Test question: who is the most beautiful person reading this right now?',
    answers: [
      { label: 'Me 💅', reply: 'Correct. No notes. ✨' },
      { label: 'Obviously me 😎', reply: 'Correct again. The test is rigged. 😂' },
    ],
  },
  {
    emoji: '🎁',
    question: 'Last question, I promise: are you ready to see your surprise?',
    answers: [{ label: 'Yes!! 😍', reply: '' }],
    runaway: { label: 'Not yet 😌', giveUp: 'Fine… yes 😅', reply: 'I knew it. 😏' },
  },
];

const TAUNTS = ['Nice try 😏', 'Too slow 😎'];
const DODGES_BEFORE_GIVING_UP = 3;

function RunawayButton({
  label,
  giveUp,
  onGiveUp,
}: {
  label: string;
  giveUp: string;
  onGiveUp: (viaKeyboard: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const zoneRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastDodge = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const needed = reduceMotion ? 0 : DODGES_BEFORE_GIVING_UP;
  const givenUp = dodges >= needed;

  const dodge = () => {
    const room = (zoneRef.current?.clientWidth ?? 280) - (buttonRef.current?.offsetWidth ?? 140);
    const maxX = Math.max(24, room / 2);
    // always jump to the other side, so the pointer is left behind
    const side = pos.x > 0 ? -1 : 1;
    setPos({ x: side * (0.5 + Math.random() * 0.5) * maxX, y: (Math.random() * 2 - 1) * 14 });
    setDodges((d) => d + 1);
    lastDodge.current = performance.now();
    sfx.pop(1.7);
  };

  return (
    <>
      <div className="quest-runaway" ref={zoneRef}>
        <motion.button
          ref={buttonRef}
          type="button"
          className="quest-btn quest-btn-alt"
          animate={{ x: pos.x, y: pos.y }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          // a mouse can't catch it: it jumps whenever the pointer is on it (at most every 350ms,
          // so it can finish moving). On touch, each tap makes it jump. After a few tries it
          // gives up and works.
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse' || givenUp) return;
            if (performance.now() - lastDodge.current < 350) return;
            dodge();
          }}
          onClick={(e) => (givenUp ? onGiveUp(e.detail === 0) : dodge())}
        >
          {givenUp ? giveUp : label}
        </motion.button>
      </div>
      <p className="quest-taunt" aria-live="polite">
        {!givenUp && dodges > 0 ? TAUNTS[Math.min(dodges, TAUNTS.length) - 1] : ''}
      </p>
    </>
  );
}

export function Quest({
  onBegin,
  onComplete,
}: {
  onBegin: () => void;
  onComplete: (viaKeyboard: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [reply, setReply] = useState('');
  const [burst, setBurst] = useState<Particle[]>([]);
  // Keyboard users get the first button of each new question focused for them. Mouse and
  // touch users don't, otherwise a focus ring appears on a button nobody pressed.
  const [focusFirst, setFocusFirst] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const choose = (answerReply: string, viaKeyboard: boolean) => {
    if (step === 0) onBegin(); // the very first tap is what lets the browser play music
    sfx.pop();
    setBurst(makeConfetti(16));
    setReply(answerReply);
    setFocusFirst(viaKeyboard);
    if (isLast) onComplete(viaKeyboard);
    else setStep(step + 1);
  };

  return (
    <motion.div
      className="quest"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="quest-header">
        <span className="script-font quest-for">For you, Chiamaka</span>
        <div
          className="quest-progress"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
        >
          {STEPS.map((_, i) => (
            <FaHeart key={i} className={i <= step ? 'on' : ''} />
          ))}
        </div>
      </div>

      <div aria-live="polite" className="quest-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="quest-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            {reply && (
              <motion.p
                className="quest-reply"
                initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.25 }}
              >
                {reply}
              </motion.p>
            )}

            <motion.div
              className="quest-emoji"
              aria-hidden="true"
              animate={{ rotate: [0, -8, 8, -6, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
            >
              {current.emoji}
            </motion.div>

            <h1 className="quest-question serif-font">{current.question}</h1>

            <div className="quest-answers">
              {current.answers.map((answer, i) => (
                <button
                  key={answer.label}
                  type="button"
                  className="quest-btn"
                  autoFocus={focusFirst && i === 0}
                  onClick={(e) => choose(answer.reply, e.detail === 0)}
                >
                  {answer.label}
                </button>
              ))}
              {current.runaway && (
                <RunawayButton
                  label={current.runaway.label}
                  giveUp={current.runaway.giveUp}
                  onGiveUp={(viaKeyboard) => choose(current.runaway!.reply, viaKeyboard)}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Confetti particles={burst} />
    </motion.div>
  );
}
