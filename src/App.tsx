import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import './index.css';

// Import all images
import img1 from './assets/img/image_1.jpeg';
import img2 from './assets/img/image_2.jpeg';
import img3 from './assets/img/image_3.jpeg';
import img4 from './assets/img/image_4.jpeg';
import img5 from './assets/img/image_5.jpeg';
import img6 from './assets/img/image_6.jpeg';
import img7 from './assets/img/image_7.jpeg';
import img8 from './assets/img/image_8.jpeg';
import img9 from './assets/img/image_9.jpeg';
import img10 from './assets/img/image_10.jpeg'; // The requested hero image
import img11 from './assets/img/image_11.jpeg';
import img12 from './assets/img/image_12.jpeg';
import { FaHeart } from 'react-icons/fa';

const FloatingBackground = () => {
  const [elements, setElements] = useState<{ id: number; x: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, 
      delay: Math.random() * 20, 
      size: Math.random() * 15 + 10, 
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="floating-container">
      {elements.map((el) => (
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
            duration: Math.random() * 15 + 15, 
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

function Curtain({ onOpen }: { onOpen: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(onOpen, 1800); 
  };

  return (
    <div className="curtain-container">
      <motion.div 
        className="curtain-panel left"
        animate={{ x: isOpen ? "-100%" : "0%" }}
        transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div 
        className="curtain-panel right"
        animate={{ x: isOpen ? "100%" : "0%" }}
        transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
      />
      
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            className="curtain-content"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="script-massive text-accent">For You,</h1>
            <h2 className="title-massive serif-font text-text mt-4 mb-8">Chiamaka</h2>
            
            <div className="flex justify-center mb-8">
               <FaHeart className="w-12 h-12 text-accent" />
            </div>

            <button onClick={handleOpen} className="open-button">
              Click to Open
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [isOpened, setIsOpened] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="bg-ivory min-h-screen text-text relative">
      <FloatingBackground />
      
      {/* The Opening Curtain Screen */}
      {!isOpened && <Curtain onOpen={() => setIsOpened(true)} />}

      {/* Main Content (Revealed after curtain opens) */}
      <div className={`main-content transition-opacity duration-1000 ${isOpened ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Section 1: The New Cinematic Background Hero Page (img10) */}
        <section className="hero-wrapper bg-dark">
          <motion.img 
            style={{ scale: heroScale, y: heroY }}
            src={img10} 
            alt="Hero Chiamaka" 
            className="hero-bg-img" 
          />
          <div className="hero-overlay"></div>
          
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={isOpened ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <div className="date-badge">September 27th</div>
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
            transition={{ duration: 1, delay: 2 }}
          >
            <span className="sans-font text-xs uppercase tracking-widest">Scroll</span>
            <motion.div 
              className="scroll-line"
              animate={{ height: ["0px", "40px", "0px"], y: [0, 20, 40] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </section>

        {/* Section 2: Beautiful Single Portrait (img1) */}
        <section className="romantic-section bg-surface z-20">
          <motion.div 
            className="image-frame max-w-xl w-full mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <div className="flower-corner flower-tl text-accent opacity-50"><FaHeart className="w-8 h-8" /></div>
            <img src={img1} alt="Chiamaka" className="w-full h-auto aspect-[4/5] object-cover rounded-sm" />
            <div className="flower-corner flower-br text-accent opacity-50"><FaHeart className="w-8 h-8" /></div>
          </motion.div>
          <div className="text-center mt-12 max-w-2xl px-6">
            <h3 className="script-font text-5xl md:text-6xl text-accent mb-6">The girl who caught my eye</h3>
            <p className="sans-font text-lg text-muted-text leading-relaxed">
              From the very first picture you ever sent me, I knew there was something different about you. Something warm, something real, something I couldn't look away from.
            </p>
          </div>
        </section>

        {/* Section 3: The Memories Grid */}
        <section className="romantic-section bg-beige py-24 z-20 relative">
          <div className="text-center mb-16">
            <h3 className="serif-font text-4xl text-text">Every photo you sent, I kept</h3>
            <p className="sans-font text-lg text-muted-text mt-4 max-w-xl mx-auto leading-relaxed">Because every single one reminded me why talking to you is the best part of my day.</p>
            <div className="w-24 h-px bg-accent mx-auto mt-6"></div>
          </div>
          
          <div className="grid-gallery px-8">
            {[img2, img3, img4, img5, img6, img7].map((imgSrc, i) => (
              <motion.div 
                key={i}
                className="image-frame"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <img src={imgSrc} alt={`Memory ${i+2}`} className="w-full aspect-[4/5] object-cover" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 4: The Heartfelt Letter */}
        <section className="romantic-section bg-ivory z-20 relative">
          <div className="flex flex-col md:flex-row items-center max-w-6xl w-full px-8 gap-12">
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="image-frame">
                <img src={img11} alt="Portrait" className="w-full aspect-[3/4] object-cover" />
              </div>
            </motion.div>

            <motion.div 
              className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h3 className="script-font text-6xl text-accent mb-8">My special wish for you...</h3>
              <p className="serif-font text-xl md:text-2xl leading-loose text-text mb-6">
                I wanted to make something that could somehow match your grace, but honestly, nothing comes close to the real thing. Every moment I spend with you feels like a gift. 
              </p>
              <p className="serif-font text-xl md:text-2xl leading-loose text-text mb-6">
                As you celebrate today, I just want you to know how truly special you are to me. I hope this new year brings you as much happiness as you bring to my days.
              </p>
              <p className="serif-font text-xl md:text-2xl leading-loose text-text font-medium text-accent">
                Happy Birthday, my beautiful Chiamaka.
              </p>
              
              <div className="mt-12 flex justify-center md:justify-start">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-xl">
                  <img src={img12} alt="Finale" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;
