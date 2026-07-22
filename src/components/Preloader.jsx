import React, { useState, useEffect } from 'react';
import BlurText from './BlurText';

const Preloader = ({ onComplete }) => {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [textFadeOut, setTextFadeOut] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterValue, setCounterValue] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleNameAnimationComplete = () => {
    // Name animation finished, trigger subtitle
    setShowSubtitle(true);
  };

  const handleSubtitleAnimationComplete = () => {
    // Keep it on screen briefly (much shorter on mobile to optimize FCP/LCP)
    const holdTime = isMobile ? 300 : 1500;
    setTimeout(() => {
      // Fade out the text group
      setTextFadeOut(true);
      // Wait for fade out animation to finish, then display counter immediately
      setTimeout(() => {
        setShowCounter(true);
      }, isMobile ? 250 : 500);
    }, holdTime);
  };

  // Fast counter loop with progressive slowing down between 80 and 100
  useEffect(() => {
    if (!showCounter) return;

    let currentValue = 0;
    let isFinished = false;

    const tick = () => {
      if (isFinished) return;

      // Calculate delay: fast at first (10ms), slower from 80 to 100
      let delay = isMobile ? 4 : 10;
      if (currentValue >= 80) {
        const progress = (currentValue - 80) / 20; // 0 to 1
        delay = isMobile 
          ? 10 + progress * 20 
          : 40 + progress * 140; // progressively slows down
      }

      setTimeout(() => {
        // Increment faster on mobile to reduce load time while keeping the counter visual
        currentValue += isMobile ? 5 : 1;
        if (currentValue > 100) currentValue = 100;
        
        setCounterValue(currentValue);

        if (currentValue < 100) {
          tick();
        } else {
          isFinished = true;
          // Finished! Wait briefly then start exit transition
          setTimeout(() => {
            setIsExiting(true);
            // Wait for exit slide transition to finish before notifying parent
            setTimeout(() => {
              onComplete();
            }, isMobile ? 400 : 800); // matches CSS exit transition duration
          }, isMobile ? 100 : 250);
        }
      }, delay);
    };

    // Small initial delay before starting counter for visual breathing room
    const startTimeout = setTimeout(() => {
      tick();
    }, isMobile ? 100 : 200);

    return () => {
      clearTimeout(startTimeout);
      isFinished = true;
    };
  }, [showCounter, onComplete, isMobile]);

  // Bulletproof fail-safe: Force exit preloader after 5 seconds max (2.5s on mobile)
  // to ensure users never get stuck due to animation/IntersectionObserver failures on slow/older devices
  useEffect(() => {
    const limit = isMobile ? 2500 : 5000;
    const failSafeTimer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        onComplete();
      }, isMobile ? 400 : 800);
      return () => clearTimeout(exitTimer);
    }, limit);

    return () => clearTimeout(failSafeTimer);
  }, [onComplete, isMobile]);

  return (
    <div 
      className={`preloader-overlay ${isExiting ? 'exit' : ''}`}
      style={isMobile ? { transitionDuration: '0.4s' } : {}}
    >
      <div className="preloader-content">
        {!showCounter ? (
          <div className={`preloader-text-group ${textFadeOut ? 'fade-out' : ''}`}>
            <BlurText
              text="Ahmad Nafi"
              delay={isMobile ? 100 : 200}
              animateBy="words"
              direction="top"
              className="preloader-title"
              onAnimationComplete={handleNameAnimationComplete}
            />
            
            {showSubtitle && (
              <BlurText
                text="welcome to my portofolio"
                delay={isMobile ? 70 : 150}
                animateBy="words"
                direction="bottom"
                className="preloader-subtitle visible"
                onAnimationComplete={handleSubtitleAnimationComplete}
              />
            )}
          </div>
        ) : (
          <div className="preloader-counter-group">
            <span className="preloader-number">{counterValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preloader;
