import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import './index.css';
import { Quest } from './Quest';
import { RealCurtain } from './RealCurtain';
import { Confetti } from './Confetti';
import { makeConfetti, type Particle } from './makeConfetti';

// Import all images
import img1 from './assets/img/image_1.jpeg';
import img2 from './assets/img/image_2.jpeg';
import img3 from './assets/img/image_3.jpeg';
import img5 from './assets/img/image_5.jpeg';
import img7 from './assets/img/image_7.jpeg';
import img10 from './assets/img/image_10.jpeg'; // The requested hero image
import img11 from './assets/img/image_11.jpeg';
import { FaHeart } from 'react-icons/fa';
import { Finale } from './Finale';
import { Lantern } from './Lantern';
import { sfx, startAmbient, setMuted } from './sound';

// Drop the song at public/birthday-song.mp3. It starts when she taps "Click to Open"
// (the tap is what lets browsers play sound). The mute button only shows once the file exists.
const MUSIC_SRC = '/birthday-song.mp3';

// Add your name for the sign-off, e.g. 'Jude'. Leave empty to sign off without one.
const SENDER_NAME = '';

// The gallery, as Polaroids with a handwritten caption each (edit the captions to taste).
// image_4 and image_6 are near-twins of image_3 and image_5, so they're left out.
const GALLERY = [
  { src: img2, caption: 'That look 😎' },
  { src: img3, caption: 'Peace, love & a pose ✌️' },
  { src: img5, caption: 'Calm and unbothered 🌿' },
  { src: img7, caption: 'This smile. Every time. 😊' },
];

// How far each Polaroid is tipped, in degrees
const TILTS = [-2.5, 2, 1.8, -2];

// Rolled once when the page loads, so every visit gets a different shower of hearts
const FLOATING_HEARTS = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 20,
  size: Math.random() * 15 + 10,
  duration: Math.random() * 15 + 15,
}));

const FloatingBackground = () => {
  return (
    <div className="floating-container">
      {FLOATING_HEARTS.map((el) => (
        <motion.div
          key={el.id}
          className="floating-item"
          style={{ left: `${el.x}vw`, width: el.size, height: el.size }}
          initial={{ y: "110vh", rotate: 0, opacity: 0 }}
          animate={{
            y: "-10vh",
            rotate: 360,
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear"
          }}
        >
          <FaHeart style={{ width: '100%', height: '100%' }} />
        </motion.div>
      ))}
    </div>
  );
};

// quest: the chain of questions -> curtain: the closed curtain -> open: it's parting
// -> done: the page is all hers
type Stage = 'quest' | 'curtain' | 'open' | 'done';

function App() {
  const [stage, setStage] = useState<Stage>('quest');
  const [reveal, setReveal] = useState<Particle[]>([]);
  const [keyboardUser, setKeyboardUser] = useState(false);
  const [replays, setReplays] = useState(0);
  const [lit, setLit] = useState(true); // the lantern: lit is the normal look, off is dark mode
  const isOpened = stage === 'open' || stage === 'done';
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicReady, setMusicReady] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // the stylesheet swaps its colours when <html data-theme="dark">
  useEffect(() => {
    document.documentElement.dataset.theme = lit ? 'light' : 'dark';
  }, [lit]);

  // Keep the page still (and at the top) until the curtain has opened
  useEffect(() => {
    document.body.style.overflow = stage === 'done' ? '' : 'hidden';
    if (stage !== 'done') window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = '';
    };
  }, [stage]);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.6;
    audio.preload = 'metadata';
    // 'loadedmetadata' only fires if the file really exists, so no song means no button
    const onReady = () => setMusicReady(true);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('loadedmetadata', onReady);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onReady);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audioRef.current = null;
    };
  }, []);

  // The lullaby is built into sound.ts. If a song file is added at MUSIC_SRC, that plays instead.
  const startMusic = () => {
    setMusicStarted(true);
    if (musicReady) {
      audioRef.current?.play().catch(() => {});
    } else {
      startAmbient();
      setIsPlaying(true);
    }
  };

  const pullCurtain = () => {
    setStage('open');
    setReveal(makeConfetti(48, 1.8));
    sfx.curtain();
  };

  // "Play it again": back to the first question, with the page and the cake reset
  const replay = () => {
    setReveal([]);
    setReplays((n) => n + 1);
    setStage('quest');
  };

  // the mute button silences the music and the sound effects together
  const toggleMusic = () => {
    const nowPlaying = !isPlaying;
    setMuted(!nowPlaying);
    if (musicReady) {
      const audio = audioRef.current;
      if (nowPlaying) audio?.play().catch(() => {});
      else audio?.pause();
    } else {
      setIsPlaying(nowPlaying);
    }
  };

  return (
    <div className="bg-ivory min-h-screen text-text relative">
      <FloatingBackground />
      <Lantern
        lit={lit}
        onToggle={() => {
          sfx.click();
          setLit((on) => !on);
        }}
      />

      {/* The birthday quest, then the curtain she gets to open */}
      <AnimatePresence mode="wait">
        {stage === 'quest' && (
          <Quest
            key="quest"
            onBegin={startMusic}
            onComplete={(viaKeyboard) => {
              setKeyboardUser(viaKeyboard);
              setStage('curtain');
            }}
          />
        )}
        {(stage === 'curtain' || stage === 'open') && (
          <RealCurtain
            key="curtain"
            open={stage === 'open'}
            focusButton={keyboardUser}
            onPull={pullCurtain}
            onGone={() => setStage('done')}
          />
        )}
      </AnimatePresence>
      <Confetti particles={reveal} originY="45%" />

      {musicStarted && (
        <button
          className="music-toggle"
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Mute music' : 'Play music'}
          aria-pressed={isPlaying}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}

      {/* Main Content (Revealed after curtain opens) */}
      <div
        className={`main-content transition-opacity duration-1000 ${isOpened ? 'opacity-100' : 'opacity-0'}`}
        inert={!isOpened}
      >

        {/* Section 1: The New Cinematic Background Hero Page (img10) */}
        <section key={`hero-${replays}`} className="hero-wrapper bg-dark">
          <motion.img
            style={{ scale: heroScale, y: heroY }}
            src={img10}
            alt="Hero Chiamaka"
            className="hero-bg-img"
            fetchPriority="high"
          />
          <div className="hero-overlay"></div>

          {/* The date sits above her head and the title below her face, so neither covers it */}
          <motion.div
            className="hero-date"
            initial={{ opacity: 0 }}
            animate={isOpened ? { opacity: 1 } : {}}
            transition={{ duration: 1.5, delay: 1.2 }}
          >
            <div className="date-badge">October 11th</div>
          </motion.div>

          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={isOpened ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5, delay: 1.5 }}
          >
            <h1 className="title-massive serif-font text-ivory mb-2">Happy Birthday</h1>
            <h2 className="script-massive">My Dearest Chiamaka</h2>
            <div className="flex justify-center mt-8 space-x-4">
              <Heart className="text-accent w-6 h-6" fill="currentColor" />
              <Heart className="text-accent w-8 h-8" fill="currentColor" />
              <Heart className="text-accent w-6 h-6" fill="currentColor" />
            </div>
          </motion.div>

          {/* Animated Scroll Down Indicator */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={isOpened ? { opacity: 0.8 } : {}}
            transition={{ duration: 1, delay: 3.2 }}
          >
            <span className="sans-font text-xs uppercase tracking-widest">Scroll</span>
            <motion.div
              className="scroll-line"
              animate={{ height: ["0px", "40px", "0px"], y: [0, 20, 40] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </section>

        {/* Chapter 1: where it started */}
        <section className="chapter bg-surface">
          <p className="eyebrow">Chapter one</p>
          <h3 className="chapter-title script-font">The girl who caught my eye</h3>
          <motion.div
            className="image-frame max-w-xl w-full mt-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <div className="flower-corner flower-tl text-accent opacity-50"><FaHeart className="w-8 h-8" /></div>
            <img src={img1} alt="Chiamaka" loading="lazy" decoding="async" className="w-full h-auto aspect-[4/5] object-cover rounded-sm" />
            <div className="flower-corner flower-br text-accent opacity-50"><FaHeart className="w-8 h-8" /></div>
          </motion.div>
          <p className="chapter-sub">
            From the very first picture you ever sent me, I knew there was something different about you. Something warm, something real, something I couldn't look away from.
          </p>
        </section>

        {/* Chapter 2: the photos she sent */}
        <section className="chapter bg-beige">
          <p className="eyebrow">Chapter two</p>
          <h3 className="chapter-title script-font">Every photo you sent, I kept</h3>
          <p className="chapter-sub">Because every single one reminded me why talking to you is the best part of my day.</p>

          <div className="polaroids">
            {GALLERY.map((photo, i) => (
              <motion.figure
                key={photo.src}
                className="polaroid"
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }}
                whileHover={{ rotate: 0, scale: 1.03 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <img src={photo.src} alt={photo.caption} loading="lazy" decoding="async" />
                <figcaption>{photo.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* Chapter 3: the letter */}
        <section className="chapter bg-ivory">
          <p className="eyebrow">Chapter three</p>
          <h3 className="chapter-title script-font">My special wish for you…</h3>

          <motion.article
            className="letter-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1 }}
          >
            <div className="letter-photo">
              <div className="image-frame">
                <img src={img11} alt="Chiamaka" loading="lazy" decoding="async" className="w-full aspect-[3/4] object-cover" />
              </div>
            </div>

            <div className="letter-body">
              <p className="letter-text">
                I wanted to make something that could somehow match your grace, but honestly, nothing comes close to the real thing. Every moment I spend with you feels like a gift.
              </p>
              <p className="letter-text">
                As you celebrate another year of your life, I just want you to know how truly special you are to me. I hope this new year brings you as much happiness as you bring to my days.
              </p>
              <p className="letter-text letter-close">Happy Birthday, my beautiful Chiamaka.</p>
              <p className="script-font text-4xl text-accent mt-2">
                Yours, always{SENDER_NAME && `, ${SENDER_NAME}`}
              </p>
            </div>
          </motion.article>
        </section>

        {/* The finale: make a wish */}
        <Finale key={`finale-${replays}`} onReplay={replay} />

      </div>
    </div>
  );
}

export default App;
