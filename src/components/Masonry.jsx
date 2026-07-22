import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './Masonry.css';

const useMedia = (queries, values, defaultValue) => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onItemClick
}) => {
  const columns = useMedia(
    ['(min-width:1200px)', '(min-width:900px)', '(min-width:600px)', '(min-width:400px)'],
    [4, 3, 2, 1],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [itemsWithAspect, setItemsWithAspect] = useState([]);
  const [imagesReady, setImagesReady] = useState(false);

  const getInitialPosition = item => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;

    if (animateFrom === 'random') {
      const directions = ['top', 'bottom', 'left', 'right'];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      setItemsWithAspect([]);
      setImagesReady(true);
      return;
    }

    setImagesReady(false);
    let active = true;

    const loadAll = async () => {
      const loadedItems = await Promise.all(
        items.map(item => {
          return new Promise(resolve => {
            const img = new Image();
            img.src = item.img;
            img.onload = () => {
              const ratio = img.naturalWidth / img.naturalHeight;
              resolve({ ...item, aspectRatio: ratio });
            };
            img.onerror = () => {
              resolve({ ...item, aspectRatio: 1.33 }); // default fallback (4:3)
            };
          });
        })
      );
      if (active) {
        setItemsWithAspect(loadedItems);
        setImagesReady(true);
      }
    };

    loadAll();
    return () => {
      active = false;
    };
  }, [items]);

  const grid = useMemo(() => {
    if (!width || !itemsWithAspect.length) return [];

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return itemsWithAspect.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      // Calculate dynamic height based on aspect ratio
      const h = columnWidth / (child.aspectRatio || 1.33);
      const y = colHeights[col];

      colHeights[col] += h;

      return { ...child, x, y, w: columnWidth, h };
    });
  }, [columns, itemsWithAspect, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || grid.length === 0) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      };

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: 'blur(10px)' })
        };

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: 'power3.out',
          delay: index * stagger
        });
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration: duration,
          ease: ease,
          overwrite: 'auto'
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0.3,
          duration: 0.3
        });
      }
    }
  };

  const handleMouseLeave = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3
        });
      }
    }
  };

  // Calculate container height to prevent layout collapses
  const containerHeight = useMemo(() => {
    if (grid.length === 0) return 0;
    const heights = new Array(columns).fill(0);
    grid.forEach(item => {
      const idx = Math.round(item.x / item.w);
      if (idx >= 0 && idx < columns) {
        heights[idx] = Math.max(heights[idx], item.y + item.h);
      }
    });
    return Math.max(...heights);
  }, [grid, columns]);

  return (
    <div 
      ref={containerRef} 
      className="list" 
      style={{ height: containerHeight ? `${containerHeight}px` : 'auto', minHeight: '300px' }}
    >
      {grid.map(item => {
        return (
          <div
            key={item.id}
            data-key={item.id}
            className="item-wrapper"
            onClick={() => onItemClick && onItemClick(item.project)}
            onMouseEnter={e => handleMouseEnter(e, item)}
            onMouseLeave={e => handleMouseLeave(e, item)}
          >
            <div 
              className="item-img" 
              style={{ backgroundImage: `url(${item.img})` }}
            >
              <div className="masonry-item-hover-overlay">
                <span className="masonry-item-category">
                  {item.project.category === 'uiux' 
                    ? 'UI/UX Design' 
                    : item.project.category === 'photography' 
                    ? 'Fotografi' 
                    : item.project.category === 'videography' 
                    ? 'Videografi' 
                    : item.project.category === 'design' 
                    ? 'Desain Grafis' 
                    : item.project.category === 'random' 
                    ? 'Random Pict' 
                    : item.project.category}
                </span>
                <h4 className="masonry-item-title">
                  {item.project.title}
                </h4>
              </div>
              {colorShiftOnHover && (
                <div
                  className="color-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))',
                    opacity: 0,
                    pointerEvents: 'none',
                    borderRadius: '8px'
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Masonry;
