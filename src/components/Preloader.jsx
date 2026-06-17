import React, { useState, useEffect } from 'react';
import BlurText from './BlurText';

const Preloader = ({ onComplete }) => {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [textFadeOut, setTextFadeOut] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterValue, setCounterValue] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNameAnimationComplete = () => {
    // Name animation finished, trigger subtitle
    setShowSubtitle(true);
  };

  const handleSubtitleAnimationComplete = () => {
    // All text is now fully visible. Keep it on screen for 1.5 seconds (1500ms)
    setTimeout(() => {
      // Fade out the text group
      setTextFadeOut(true);
      // Wait for fade out animation to finish (500ms), then display counter immediately
      setTimeout(() => {
        setShowCounter(true);
      }, 500);
    }, 1500);
  };

  // Fast counter loop with progressive slowing down between 80 and 100
  useEffect(() => {
    if (!showCounter) return;

    let currentValue = 0;
    let isFinished = false;

    const tick = () => {
      if (isFinished) return;

      // Calculate delay: fast at first (10ms), slower from 80 to 100
      let delay = 10;
      if (currentValue >= 80) {
        const progress = (currentValue - 80) / 20; // 0 to 1
        delay = 40 + progress * 140; // progressively slows down from 40ms to 180ms
      }

      setTimeout(() => {
        currentValue += 1;
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
            }, 800); // matches CSS exit transition duration
          }, 250);
        }
      }, delay);
    };

    // Small initial delay before starting counter for visual breathing room
    const startTimeout = setTimeout(() => {
      tick();
    }, 200);

    return () => {
      clearTimeout(startTimeout);
      isFinished = true;
    };
  }, [showCounter, onComplete]);

  return (
    <div className={`preloader-overlay ${isExiting ? 'exit' : ''}`}>
      <div className="preloader-content">
        {!showCounter ? (
          <div className={`preloader-text-group ${textFadeOut ? 'fade-out' : ''}`}>
            <BlurText
              text="Kaluna Visual"
              delay={200}
              animateBy="words"
              direction="top"
              className="preloader-title"
              onAnimationComplete={handleNameAnimationComplete}
            />
            
            {showSubtitle && (
              <BlurText
                text="welcome to my portofolio"
                delay={150}
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
