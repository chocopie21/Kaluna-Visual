import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const words = [
    "FOTOGRAFI",
    "VIDEOGRAFI",
    "DESAIN GRAFIS",
    "UI/UX DESIGN",
    "CREATIVE STORYTELLING",
    "AHMAD NAFI"
  ];

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    // Session Storage Bypass to optimize repeated visits during active work
    const visited = sessionStorage.getItem('portfolio_visited');
    if (visited) {
      onComplete();
    } else {
      sessionStorage.setItem('portfolio_visited', 'true');
      setShouldRender(true);
    }
  }, [onComplete]);

  useEffect(() => {
    if (!shouldRender) return;

    // Define timing per word: slightly speedier on mobile for UX
    const duration = isMobile ? 320 : 420;

    if (currentIndex < words.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      // Hold the final name longer for visual emphasis
      const finalTimer = setTimeout(() => {
        setIsExiting(true);
        const exitTimer = setTimeout(() => {
          onComplete();
        }, isMobile ? 400 : 800); // Matches CSS exit transition duration
        return () => clearTimeout(exitTimer);
      }, 750);
      return () => clearTimeout(finalTimer);
    }
  }, [currentIndex, shouldRender, isMobile, onComplete]);

  // Fail-safe limit: Force complete preloader after 5 seconds max
  useEffect(() => {
    if (!shouldRender) return;
    const limit = isMobile ? 2500 : 5000;
    const failSafeTimer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        onComplete();
      }, isMobile ? 400 : 800);
      return () => clearTimeout(exitTimer);
    }, limit);

    return () => clearTimeout(failSafeTimer);
  }, [onComplete, isMobile, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`preloader-overlay ${isExiting ? 'exit' : ''}`}
      style={isMobile ? { transitionDuration: '0.4s' } : {}}
    >
      <div className="preloader-content" style={{ overflow: 'hidden', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: isMobile ? '1.6rem' : '3.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: currentIndex === words.length - 1 ? 'var(--accent-color)' : 'var(--text-primary)',
              lineHeight: 1.2
            }}
          >
            {words[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Preloader;
