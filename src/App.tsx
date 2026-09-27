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

// A beautiful SVG Rose
const RoseSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" className={className} fill="currentColor" width="100%" height="100%">
    <path d="M312.6 57.3c-15.5-23.4-38.3-43-64.8-54.7-2.9-1.3-6.1-2-9.4-2-6.5 0-12.7 2.6-17.3 7.2l-37 37c-17.4 17.4-29.3 40-34.1 64.6-2.1 11.1-2.9 22.4-2.2 33.7-27.4-6.3-56.1-5.6-83 2-25.1 7.1-47.5 20.8-64.6 39.5-6.8 7.5-10.4 17.4-10.3 27.5.1 14.7 8 28.2 20.8 35.8l47.5 28.5c22.6 13.5 48.7 19.8 74.8 17.9 14.5-1 28.7-4 42.1-8.9 4 19.3 12.1 37.3 23.6 52.8 16.6 22.5 39.7 39.7 66 49.3 27.5 10.1 57.5 12.4 86.4 6.7 12.4-2.4 23-9.5 29.8-19.8 6.8-10.3 9-23 6.1-35.1l-14.7-61.9c-5.7-24.1-17.6-46.1-34.5-63.7-11.8-12.3-25.7-22.3-40.9-29.5 16.8-12.7 30.6-29.1 39.9-47.6 13.4-26.6 18.5-56.5 14.9-86.4-1-8.5-4.7-16.3-10.5-22.1-6.1-6.1-14.3-9.4-22.9-9.1-18.4.6-35.9 6.2-51.1 16.1-19.1 12.4-34.8 29.1-45.7 48.5z" />
  </svg>
);

const FloatingBackground = () => {
  const [elements, setElements] = useState<{ id: number; x: number; delay: number; size: number; isHeart: boolean }[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, 
      delay: Math.random() * 20, 
      size: Math.random() * 20 + 15, 
      isHeart: Math.random() > 0.5,
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
          {el.isHeart ? <Heart fill="currentColor" strokeWidth={0} /> : <RoseSVG />}
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
               <RoseSVG className="w-12 h-12 text-accent" />
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
            <div className="flower-corner flower-tl text-accent opacity-50"><RoseSVG /></div>
            <img src={img1} alt="Chiamaka" className="w-full h-auto aspect-[4/5] object-cover rounded-sm" />
            <div className="flower-corner flower-br text-accent opacity-50"><RoseSVG /></div>
          </motion.div>
          <div className="text-center mt-12 max-w-2xl px-6">
            <h3 className="script-font text-5xl md:text-6xl text-accent mb-6">A beauty like no other</h3>
            <p className="sans-font text-lg text-muted-text leading-relaxed">
              Every flower blooming today is just trying to match the radiance you bring into this world. 
            </p>
          </div>
        </section>

        {/* Section 3: The Memories Grid */}
        <section className="romantic-section bg-beige py-24 z-20 relative">
          <div className="text-center mb-16">
            <h3 className="serif-font text-4xl text-text">Precious Moments</h3>
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
              <h3 className="script-font text-6xl text-accent mb-8">My wish for you...</h3>
              <p className="serif-font text-xl md:text-2xl leading-loose text-text mb-6">
                May your day be filled with as much joy, love, and beauty as you give to everyone around you. You deserve all the floating roses, all the beautiful words, and a world that celebrates you.
              </p>
              <p className="serif-font text-xl md:text-2xl leading-loose text-text">
                Happy Birthday, my dear Chiamaka.
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
