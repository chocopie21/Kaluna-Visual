import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { flushSync } from 'react-dom';
import { Lock, Mail, Globe, Phone, Send, ChevronRight, Menu, X, Sun, Moon, Camera, Video, Palette, Layers } from 'lucide-react';
import PortfolioGrid from './components/PortfolioGrid';
import AdminPanel from './components/AdminPanel';
import Preloader from './components/Preloader';
import ScrollVelocity from './components/ScrollVelocity';
import Lenis from 'lenis';

import Lanyard from './components/Lanyard';
import WhatsAppButton from './components/WhatsAppButton';
import BorderGlow from './components/BorderGlow';
import ChatBotButton from './components/ChatBotButton';

// Custom Brand Icons since brand icons are removed in recent lucide-react versions
const InstagramIcon = ({ size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ size = 16, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// SVGs for Tools Marquee (Moving Logos)
const FigmaIcon = () => (
  <svg width="20" height="30" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12Z" fill="#F24E1E"/>
    <path d="M18 12C21.3137 12 24 9.31371 24 6C24 2.68629 21.3137 0 18 0C14.6863 0 12 2.68629 12 6C12 9.31371 14.6863 12 18 12Z" fill="#FF7262"/>
    <path d="M6 24C9.31371 24 12 21.3137 12 18C12 14.6863 9.31371 12 6 12C2.68629 12 0 14.6863 0 18C0 21.3137 2.68629 24 6 24Z" fill="#A259FF"/>
    <path d="M18 24C21.3137 24 24 21.3137 24 18C24 14.6863 21.3137 12 18 12C14.6863 12 12 14.6863 12 18C12 21.3137 14.6863 24 18 24Z" fill="#1ABCFE"/>
    <path d="M6 36C9.31371 36 12 33.3137 12 30V24H6C2.68629 24 0 26.6863 0 30C0 33.3137 2.68629 36 6 36Z" fill="#0ACF83"/>
  </svg>
);

const PhotoshopIcon = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#001833"/>
    <text x="6.5" y="24" fill="#00C8FF" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" letterSpacing="-0.5">Ps</text>
  </svg>
);

const PremiereIcon = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#17002B"/>
    <text x="6.5" y="24" fill="#EA77FF" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" letterSpacing="-0.5">Pr</text>
  </svg>
);

const LightroomIcon = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#001C25"/>
    <text x="6.5" y="24" fill="#31A8FF" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" letterSpacing="-0.5">Lr</text>
  </svg>
);

const CanvaIcon = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="url(#canvaGrad)"/>
    <path d="M22.5 24C20.5 25.5 17.5 25.5 15.5 24C13 21.5 13 16.5 15.5 14C17.5 12.5 20.5 12.5 22.5 14L24.5 12C21.5 9.5 16.5 9.5 13.5 12C10 15.5 10 21.5 13.5 25C16.5 27.5 21.5 27.5 24.5 25L22.5 24Z" fill="white" />
    <defs>
      <linearGradient id="canvaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00C4CC" />
        <stop offset="100%" stopColor="#7D2AE8" />
      </linearGradient>
    </defs>
  </svg>
);

const toolsMarquee = [
  { node: <FigmaIcon />, title: 'Figma' },
  { node: <PhotoshopIcon />, title: 'Adobe Photoshop' },
  { node: <PremiereIcon />, title: 'Adobe Premiere Pro' },
  { node: <LightroomIcon />, title: 'Adobe Lightroom' },
  { node: <CanvaIcon />, title: 'Canva' }
];

function App() {
  const [projects, setProjects] = useState([]);
  const [mountError, setMountError] = useState(null);
  const viewTrackedRef = useRef(false);
 
  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const trackPageView = async (loadedProjects) => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;

    try {
      let data = {};
      try {
        const res = await fetch('./api/analytics');
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.warn('API analytics load failed, using local storage fallback', err);
      }

      if (!data || Object.keys(data).length === 0) {
        try {
          data = JSON.parse(localStorage.getItem('portfolio_analytics') || '{}');
        } catch (e) {
          data = {};
        }
      }

      // If still empty, seed it
      if (!data || Object.keys(data).length === 0) {
        const seedProjectClicks = {};
        loadedProjects.forEach((p, idx) => {
          seedProjectClicks[p.id] = Math.max(12, 180 - (idx * 35) + Math.floor(Math.random() * 15));
        });

        data = {
          totalViews: 1420,
          totalClicks: Object.values(seedProjectClicks).reduce((a, b) => a + b, 0),
          dailyViews: [120, 155, 180, 142, 210, 248, 365],
          projectClicks: seedProjectClicks,
          categoryViews: {
            all: 340,
            photography: 245,
            videography: 190,
            design: 120,
            uiux: 95
          },
          deviceShare: { mobile: 58, desktop: 42 },
          sourceShare: { direct: 45, social: 35, search: 20 }
        };
      }

      // 1. Increment totalViews
      data.totalViews = (data.totalViews || 0) + 1;

      // 2. Increment dailyViews for today
      const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      if (!data.dailyViews) {
        data.dailyViews = [120, 155, 180, 142, 210, 248, 365];
      }
      data.dailyViews[todayIdx] = (data.dailyViews[todayIdx] || 0) + 1;

      // 3. Update deviceShare
      if (!data.deviceShare) {
        data.deviceShare = { mobile: 58, desktop: 42 };
      }
      const isMobileDevice = window.innerWidth < 768;
      let desktopCount = data.deviceShare.desktop || 42;
      let mobileCount = data.deviceShare.mobile || 58;
      
      if (isMobileDevice) {
        mobileCount += 1;
      } else {
        desktopCount += 1;
      }
      const totalDevice = desktopCount + mobileCount;
      data.deviceShare.desktop = Math.round((desktopCount / totalDevice) * 100);
      data.deviceShare.mobile = 100 - data.deviceShare.desktop;

      // 4. Update sourceShare
      if (!data.sourceShare) {
        data.sourceShare = { direct: 45, social: 35, search: 20 };
      }
      let source = 'direct';
      const referrer = document.referrer.toLowerCase();
      if (referrer) {
        if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('yahoo') || referrer.includes('duckduckgo') || referrer.includes('yandex') || referrer.includes('search')) {
          source = 'search';
        } else if (referrer.includes('facebook') || referrer.includes('instagram') || referrer.includes('twitter') || referrer.includes('t.co') || referrer.includes('linkedin') || referrer.includes('pinterest') || referrer.includes('tiktok') || referrer.includes('behance')) {
          source = 'social';
        }
      }
      
      let directCount = data.sourceShare.direct || 45;
      let socialCount = data.sourceShare.social || 35;
      let searchCount = data.sourceShare.search || 20;

      if (source === 'search') {
        searchCount += 1;
      } else if (source === 'social') {
        socialCount += 1;
      } else {
        directCount += 1;
      }

      const totalSource = directCount + socialCount + searchCount;
      data.sourceShare.direct = Math.round((directCount / totalSource) * 100);
      data.sourceShare.social = Math.round((socialCount / totalSource) * 100);
      data.sourceShare.search = 100 - data.sourceShare.direct - data.sourceShare.social;

      // 5. Make sure all current projects exist in projectClicks
      if (!data.projectClicks) data.projectClicks = {};
      loadedProjects.forEach(p => {
        if (data.projectClicks[p.id] === undefined) {
          data.projectClicks[p.id] = Math.floor(Math.random() * 15) + 5;
        }
      });

      // Save back
      localStorage.setItem('portfolio_analytics', JSON.stringify(data));
      try {
        await fetch('./api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (e) {
        // Fallback for static hosting
      }
    } catch (err) {
      console.error('Failed to track page view', err);
    }
  };

  const trackProjectClick = async (projectId) => {
    try {
      let data = {};
      try {
        const res = await fetch('./api/analytics');
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.warn('API analytics load failed, using local storage fallback', err);
      }

      if (!data || Object.keys(data).length === 0) {
        try {
          data = JSON.parse(localStorage.getItem('portfolio_analytics') || '{}');
        } catch (e) {
          data = {};
        }
      }

      if (!data || Object.keys(data).length === 0) {
        data = {
          totalViews: 1,
          totalClicks: 1,
          dailyViews: [0, 0, 0, 0, 0, 0, 0],
          projectClicks: { [projectId]: 1 },
          categoryViews: {
            all: 0,
            photography: 0,
            videography: 0,
            design: 0,
            uiux: 0
          },
          deviceShare: { mobile: 50, desktop: 50 },
          sourceShare: { direct: 100, social: 0, search: 0 }
        };
      } else {
        if (!data.projectClicks) data.projectClicks = {};
        data.projectClicks[projectId] = (data.projectClicks[projectId] || 0) + 1;
        data.totalClicks = (data.totalClicks || 0) + 1;
      }

      // Save back
      localStorage.setItem('portfolio_analytics', JSON.stringify(data));
      try {
        await fetch('./api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (e) {
        // Fallback for static hosting
      }
    } catch (err) {
      console.error('Failed to track project click', err);
    }
  };
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isLoading, setIsLoading] = useState(true);
  const [lanyardRight, setLanyardRight] = useState('220px');
  const [isMobile, setIsMobile] = useState(false);
  const [lanyardReady, setLanyardReady] = useState(false);
  const lanyardWrapperRef = useRef(null);
  const [isLanyardIntersecting, setIsLanyardIntersecting] = useState(true);

  // Contact Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      addToast('Harap isi nama, email, dan pesan Anda!', 'error');
      return;
    }
    
    setIsSendingMessage(true);
    try {
      let success = false;
      const messageData = {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage
      };

      try {
        const res = await fetch('./api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });
        if (res.ok) {
          success = true;
        }
      } catch (err) {
        console.warn('API message call failed, using localStorage fallback', err);
      }

      if (!success) {
        // Fallback for static hosting
        const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
        const newMsg = {
          id: Date.now().toString(),
          ...messageData,
          date: new Date().toISOString()
        };
        localMsgs.push(newMsg);
        localStorage.setItem('local_messages', JSON.stringify(localMsgs));
      }

      addToast('Pesan Anda berhasil dikirim!', 'success');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      addToast('Gagal mengirim pesan: ' + err.message, 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Global Lenis Smooth Scroll for Apple-like smooth page scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Lock scroll when preloader is loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  // Dynamically position the lanyard between "Tentang Saya" and "Kontak" links
  useEffect(() => {
    const updateLanyardPosition = () => {
      const aboutLink = document.getElementById('nav-link-about');
      const contactLink = document.getElementById('nav-link-contact');
      const container = document.querySelector('.navbar .container');
      
      if (aboutLink && contactLink && container) {
        const rectAbout = aboutLink.getBoundingClientRect();
        const rectContact = contactLink.getBoundingClientRect();
        const rectContainer = container.getBoundingClientRect();
        
        // Calculate the center of each link relative to the container's right edge
        const centerAboutRight = rectContainer.right - (rectAbout.left + rectAbout.width / 2);
        const centerContactRight = rectContainer.right - (rectContact.left + rectContact.width / 2);
        
        // The midpoint is the average of the two offsets
        const midpointRight = (centerAboutRight + centerContactRight) / 2;
        
        setLanyardRight(`${midpointRight}px`);
      }
    };

    if (!isLoading) {
      updateLanyardPosition();
      
      window.addEventListener('resize', updateLanyardPosition);
      // Run it after brief delays to ensure fonts are loaded and layout is fully settled
      const timer1 = setTimeout(updateLanyardPosition, 100);
      const timer2 = setTimeout(updateLanyardPosition, 1000);
      
      return () => {
        window.removeEventListener('resize', updateLanyardPosition);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isLoading]);

  // Defer Lanyard (Three.js) loading until page is idle to avoid blocking TBT
  useEffect(() => {
    if (isLoading || isMobile) return;
    
    const loadLanyard = () => {
      // Use requestIdleCallback if available, fallback to setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setLanyardReady(true), { timeout: 3000 });
      } else {
        setTimeout(() => setLanyardReady(true), 2000);
      }
    };
    
    // Wait a tick after preloader finishes to let paint happen first
    const timer = setTimeout(loadLanyard, 500);
    return () => clearTimeout(timer);
  }, [isLoading, isMobile]);

  // Observer to unmount Lanyard when scrolled off-screen (saves 100% GPU load on rest of page)
  useEffect(() => {
    if (isMobile || !lanyardReady) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLanyardIntersecting(entry.isIntersecting);
      },
      { root: null, rootMargin: '2000px', threshold: 0 }
    );

    const currentWrapper = lanyardWrapperRef.current;
    if (currentWrapper) {
      observer.observe(currentWrapper);
    }

    return () => {
      if (currentWrapper) {
        observer.unobserve(currentWrapper);
      }
    };
  }, [isMobile, lanyardReady]);

  // Premium Circular Ripple Theme Transition using View Transitions API
  const toggleTheme = (e) => {
    const newTheme = theme === 'light' ? 'dark' : 'light';

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Capture click coordinate or fall back to center of button if triggered via keyboard
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    // Calculate maximum radius to cover the entire viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 650, // elegant sweeping speed
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };



  // Load portfolio projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let serverProjects = [];
        try {
          const res = await fetch('./data.json');
          if (res.ok) {
            serverProjects = await res.json();
          } else {
            console.warn('API data.json returned not ok status:', res.status);
          }
        } catch (err) {
          console.warn('Failed to fetch data.json, using local storage fallback', err);
        }

        let localProjects = [];
        try {
          localProjects = JSON.parse(localStorage.getItem('local_portfolio_projects') || '[]');
          if (!Array.isArray(localProjects)) {
            localProjects = [];
          }
        } catch (err) {
          console.warn('Failed to parse local_portfolio_projects', err);
        }
        
        // Merge: avoid duplicates by ID
        const merged = [...localProjects];
        serverProjects.forEach(sp => {
          if (!merged.some(mp => mp.id === sp.id)) {
            merged.push(sp);
          }
        });
        
        // Normalize absolute paths (e.g. "/uploads/...") to relative paths ("uploads/...") for GitHub Pages
        const normalizePath = (pathOrObj) => {
          if (!pathOrObj) return pathOrObj;
          
          // If it's a string:
          if (typeof pathOrObj === 'string') {
            if (pathOrObj.startsWith('/uploads/')) {
              return pathOrObj.substring(1);
            }
            return pathOrObj;
          }
          
          // If it's an object:
          if (typeof pathOrObj === 'object' && pathOrObj.url) {
            const normalizedUrl = pathOrObj.url.startsWith('/uploads/') 
              ? pathOrObj.url.substring(1) 
              : pathOrObj.url;
            return {
              ...pathOrObj,
              url: normalizedUrl
            };
          }
          
          return pathOrObj;
        };

        const normalized = merged.map(proj => ({
          ...proj,
          mediaUrl: normalizePath(proj.mediaUrl),
          gallery: proj.gallery ? proj.gallery.map(normalizePath) : []
        }));

        setProjects(normalized);
        await trackPageView(normalized);
      } catch (err) {
        console.error('CRITICAL ERROR IN MOUNT:', err);
        setMountError(err.message + '\nStack:\n' + err.stack);
      }
    };

    fetchProjects();
  }, []);

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px -5% -80px -5%', // Trigger slightly inside the viewport
      threshold: 0.05
    };

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [projects, activeCategory, viewMode]); // Re-run on dynamic updates

  // Handler to add a Toast
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };



  // Scroll to section helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-wrapper">
      {mountError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#dc3545',
          color: '#fff',
          padding: '1.5rem',
          zIndex: 999999,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          borderBottom: '3px solid #721c24'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>⚠️ Critical Error during Page Load:</span>
              <button 
                onClick={() => setMountError(null)} 
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: '1px solid #fff', 
                  color: '#fff', 
                  padding: '2px 8px', 
                  borderRadius: '3px', 
                  cursor: 'pointer' 
                }}
              >
                Tutup
              </button>
            </div>
            <div>{mountError}</div>
          </div>
        </div>
      )}
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Ahmad Nafi <span>Portfolio</span>
          </a>

          <div className="nav-actions">
            {/* Desktop Nav Links */}
            <div className="nav-links">
              <a href="#work" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('work'); }}>Karya</a>
              <a id="nav-link-about" href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Tentang Saya</a>
              <a id="nav-link-contact" href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Kontak</a>
            </div>

            <button 
              className="btn-icon theme-toggle" 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
              aria-label={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
              style={{ marginRight: '0.25rem' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setIsAdminOpen(true)}
              title="Akses Panel Admin"
              aria-label="Buka Panel Admin"
            >
              <Lock size={16} />
            </button>
            <button 
              className="btn-icon mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup Menu' : 'Buka Menu Navigasi'}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: 0,
            right: 0,
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            zIndex: 99
          }}>
            <a href="#work" style={{ fontWeight: 500, color: 'var(--text-secondary)' }} onClick={(e) => { e.preventDefault(); scrollToSection('work'); }}>Karya</a>
            <a href="#about" style={{ fontWeight: 500, color: 'var(--text-secondary)' }} onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Tentang Saya</a>
            <a href="#contact" style={{ fontWeight: 500, color: 'var(--text-secondary)' }} onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Kontak</a>
          </div>
        )}
      </nav>

      <main>
      {/* Hero / Tentang Saya Section */}
      <section className="hero" id="about">
        {/* Lanyard container aligned with header link, but scrolls with page */}
        <div className="hero-lanyard-alignment-container" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 0,
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div className="container" style={{ position: 'relative', height: 0 }}>
            <div ref={lanyardWrapperRef} className="hero-lanyard-wrapper" style={{ position: 'absolute', top: 0, right: lanyardRight }}>
              {!isMobile && lanyardReady && isLanyardIntersecting && (
                <Lanyard
                  position={[0, 0, 14]}
                  gravity={[0, -40, 0]}
                  frontImage="./foto-depna.png"
                  backImage="./foto-belakang.png"
                  imageFit="cover"
                  lanyardWidth={1.2}
                />
              )}
            </div>
          </div>
        </div>
        <div className="container">
          <div className="about-grid">
            <div className="about-text reveal">
              <div className="section-tagline" style={{ marginBottom: '0.25rem' }}>Tentang Saya</div>
              <h1 className="section-title" style={{ marginBottom: '1.5rem', lineHeight: '1.05' }}>Di Balik Lensa & Layar</h1>
              <p className="about-paragraph">
                I am Ahmad Nafi, a student at Telkom University with a strong passion for photography and graphic design. My journey began with a simple curiosity about how visuals can speak louder than words — a curiosity that has grown into a deep interest in capturing stories and emotions through images and design.
              </p>
              <p className="about-paragraph">
                I’ve always believed that creativity is not just about aesthetics, but also about meaning, clarity, and impact.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-tagline">Layanan Kreatif</div>
            <h2 className="section-title">Apa Yang Saya Lakukan</h2>
          </div>
          <div className="services-grid reveal">
            <BorderGlow animated borderRadius={16} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
              <div className="service-card" style={{ height: '100%' }}>
                <div className="service-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>01</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                </div>
                <div className="service-card-icon" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                  <Camera size={24} />
                </div>
                <h3 className="service-card-title" style={{ fontSize: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-sans)' }}>Fotografi</h3>
                <p className="service-card-description">
                  Menangkap momen berharga dengan komposisi artistik dan pencahayaan yang dramatis. Spesialisasi dalam wisuda (graduation), dokumentasi event, dan portrait.
                </p>
              </div>
            </BorderGlow>

            <BorderGlow animated borderRadius={16} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
              <div className="service-card" style={{ height: '100%' }}>
                <div className="service-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>02</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                </div>
                <div className="service-card-icon" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                  <Video size={24} />
                </div>
                <h3 className="service-card-title" style={{ fontSize: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-sans)' }}>Videografi & Editing</h3>
                <p className="service-card-description">
                  Produksi video sinematik dengan drone dan editing dinamis. Cocok untuk kebutuhan iklan (commercial), video profil, reels, dan dokumentasi acara.
                </p>
              </div>
            </BorderGlow>

            <BorderGlow animated borderRadius={16} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
              <div className="service-card" style={{ height: '100%' }}>
                <div className="service-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>03</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                </div>
                <div className="service-card-icon" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                  <Palette size={24} />
                </div>
                <h3 className="service-card-title" style={{ fontSize: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-sans)' }}>Desain Grafis</h3>
                <p className="service-card-description">
                  Pembuatan identitas visual brand, feed sosial media, desain poster promosi, serta berbagai materi cetak/digital kreatif yang komunikatif.
                </p>
              </div>
            </BorderGlow>

            <BorderGlow animated borderRadius={16} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
              <div className="service-card" style={{ height: '100%' }}>
                <div className="service-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>04</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                </div>
                <div className="service-card-icon" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                  <Layers size={24} />
                </div>
                <h3 className="service-card-title" style={{ fontSize: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-sans)' }}>UI/UX Design</h3>
                <p className="service-card-description">
                  Merancang antarmuka (interface) aplikasi mobile dan website yang modern, responsif, serta berfokus pada kemudahan dan kenyamanan interaksi pengguna.
                </p>
              </div>
            </BorderGlow>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="timeline-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-tagline">Riwayat & Pengalaman</div>
            <h2 className="section-title">Perjalanan Kreatif</h2>
          </div>
          <div className="timeline-cols-grid reveal">
            {/* Left Column: Education */}
            <div className="timeline-col">
              <h3 className="timeline-col-title">Pendidikan</h3>
              <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <BorderGlow animated borderRadius={12} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>01</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="timeline-date">2024 - Sekarang</span>
                          <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                        </div>
                      </div>
                      <h4 className="timeline-title">Telkom University</h4>
                      <div className="timeline-subtitle">S1 Terapan Digital Creative Multimedia</div>
                      <p className="timeline-description">
                        Mendalami produksi konten multimedia, desain digital kreatif, website, UI/UX, serta pengembangan aset kreatif interaktif di era digital.
                      </p>
                    </div>
                  </div>
                </BorderGlow>

                <BorderGlow animated borderRadius={12} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>02</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="timeline-date">2021 - 2024</span>
                          <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                        </div>
                      </div>
                      <h4 className="timeline-title">SMAN 6 Karawang</h4>
                      <div className="timeline-subtitle">Sekolah Menengah Atas</div>
                      <p className="timeline-description">
                        Mengembangkan minat di bidang desain grafis dan dunia kreatif visual seperti Fotografi, Videografi, dan Editing melalui berbagai kegiatan sekolah dan proyek mandiri.
                      </p>
                    </div>
                  </div>
                </BorderGlow>

                <BorderGlow animated borderRadius={12} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>03</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="timeline-date">2018 - 2021</span>
                          <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                        </div>
                      </div>
                      <h4 className="timeline-title">SMPN 5 Karawang</h4>
                      <div className="timeline-subtitle">Sekolah Menengah Pertama</div>
                      <p className="timeline-description">
                        Mulai mengenal kamera untuk pertama kalinya dan terjun mengeksplorasi dunia fotografi.
                      </p>
                    </div>
                  </div>
                </BorderGlow>
              </div>
            </div>

            {/* Right Column: Experience */}
            <div className="timeline-col">
              <h3 className="timeline-col-title">Pengalaman Kerja</h3>
              <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <BorderGlow animated borderRadius={12} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>01</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="timeline-date">2023 - Sekarang</span>
                          <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                        </div>
                      </div>
                      <h4 className="timeline-title">Kaluna Visual</h4>
                      <div className="timeline-subtitle">Co-Founder & Visual Creator</div>
                      <p className="timeline-description">
                        Mendirikan Kaluna Visual bersama teman-teman untuk menyediakan jasa dokumentasi graduation (wisuda), liputan event, serta berbagai kebutuhan visual kreatif lainnya.
                      </p>
                    </div>
                  </div>
                </BorderGlow>

                <BorderGlow animated borderRadius={12} glowColor="12 80 60" colors={['#e54d3b', '#ff7e67', '#ffb088']}>
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-card-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>02</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="timeline-date">2024 - Sekarang</span>
                          <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>+</span>
                        </div>
                      </div>
                      <h4 className="timeline-title">Graphic & UI/UX Designer</h4>
                      <div className="timeline-subtitle">Branding & Digital Product</div>
                      <p className="timeline-description">
                        Merancang identitas visual brand, materi publikasi, wireframe antarmuka, serta purwarupa (prototype) produk digital dengan pendekatan user-centered design.
                      </p>
                    </div>
                  </div>
                </BorderGlow>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Logo Marquee */}
      <section className="logo-marquee-section reveal" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '2rem', overflow: 'hidden' }}>
        <ScrollVelocity
          texts={[
            <div style={{ display: 'flex', gap: '5rem', alignItems: 'center', paddingRight: '5rem' }}>
              {toolsMarquee.map((tool, idx) => (
                <div key={idx} className="scroll-logo-node">
                  {tool.node}
                </div>
              ))}
            </div>,
            <div style={{ display: 'flex', gap: '5rem', alignItems: 'center', paddingRight: '5rem' }}>
              {[...toolsMarquee].reverse().map((tool, idx) => (
                <div key={idx} className="scroll-logo-node">
                  {tool.node}
                </div>
              ))}
            </div>
          ]}
          velocity={55}
          numCopies={6}
          damping={50}
          stiffness={200}
        />
      </section>

      {/* Work / Portfolio Section */}
      <section id="work" className="portfolio-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-tagline">Portofolio Pilihan</div>
            <h2 className="section-title">Karya Terbaru</h2>
          </div>
          
          <PortfolioGrid 
            projects={projects}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            viewMode={viewMode}
            setViewMode={setViewMode}
            addToast={addToast}
            onTrackProjectClick={trackProjectClick}
          />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-tagline">Hubungi Kreator</div>
            <h2 className="section-title">Mari Berkolaborasi</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px' }} className="reveal">
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.65' }}>
              Apakah Anda memiliki proyek menarik, butuh dokumentasi visual, atau ingin merancang antarmuka aplikasi? Hubungi saya secara langsung melalui email atau media sosial di bawah ini.
            </p>
            
            <div>
              <a 
                href="mailto:mnafi151@gmail.com" 
                style={{ 
                  fontFamily: 'var(--font-sans)', 
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                  fontWeight: '700', 
                  letterSpacing: '-0.03em', 
                  color: 'var(--text-primary)',
                  borderBottom: '2px solid var(--text-primary)',
                  paddingBottom: '0.5rem',
                  display: 'inline-block',
                  lineHeight: '1.1',
                  transition: 'var(--transition-smooth)'
                }}
                className="contact-email-link"
              >
                mnafi151@gmail.com
              </a>
            </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          {/* Upper row */}
          <div className="footer-top">
            <div className="footer-tagline">
              Mari buat sesuatu yang luar biasa bersama-sama.
            </div>
            
            <div className="footer-links-grid">
              <div className="footer-links-col">
                <div className="footer-col-title">Navigasi</div>
                <a href="#work" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('work'); }}>Karya</a>
                <a href="#about" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Tentang Saya</a>
                <a href="#contact" className="footer-link" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Kontak</a>
              </div>
              <div className="footer-links-col">
                <div className="footer-col-title">Medsos</div>
                <a href="https://www.instagram.com/anafffi?igsh=ZGszdG9sNnpvYTNm" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
                <a href="https://www.linkedin.com/in/ahmad-nafi-04a6962b7" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
                <a href="https://www.behance.net/kalunavisual1" target="_blank" rel="noopener noreferrer" className="footer-link">Behance</a>
              </div>
            </div>
          </div>

          {/* Giant Title (Exactly 1 Line) */}
          <div className="footer-giant-text">
            Ahmad Nafi
          </div>

          {/* Bottom row */}
          <div className="footer-bottom">
            <div className="footer-brand">
              Ahmad Nafi
            </div>
            <div className="footer-bottom-links">
              <span>© 2026 Ahmad Nafi</span>
              <a href="#" className="footer-link">Kebijakan Privasi</a>
              <a href="#" className="footer-link">Ketentuan Layanan</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Panel Drawer */}
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        projects={projects}
        onUpdateProjects={setProjects}
        addToast={addToast}
      />

      {/* Toast Notification Renderer */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Viewport Bottom Gradient Blur Overlay */}
      <div className="bottom-page-blur-overlay"></div>

      {/* Floating Action Buttons */}
      <ChatBotButton />
      <WhatsAppButton phoneNumber="6283815906766" />

      {/* Loading preloader */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
    </div>
  );
}

export default App;
