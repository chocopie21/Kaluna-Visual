import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Lock, Mail, Globe, Phone, Send, ChevronRight, Menu, X, Sun, Moon } from 'lucide-react';
import PortfolioGrid from './components/PortfolioGrid';
import AdminPanel from './components/AdminPanel';
import Preloader from './components/Preloader';
import LogoLoop from './components/LogoLoop';
import Lanyard from './components/Lanyard';

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isLoading, setIsLoading] = useState(true);
  const [lanyardRight, setLanyardRight] = useState('220px');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      let serverProjects = [];
      try {
        const res = await fetch('./data.json');
        if (res.ok) {
          serverProjects = await res.json();
        }
      } catch (err) {
        console.warn('Failed to fetch data.json, using local storage fallback', err);
      }

      // Load client-side local projects (if any added previously offline)
      const localProjects = JSON.parse(localStorage.getItem('local_portfolio_projects') || '[]');
      
      // Merge: avoid duplicates by ID
      const merged = [...localProjects];
      serverProjects.forEach(sp => {
        if (!merged.some(mp => mp.id === sp.id)) {
          merged.push(sp);
        }
      });
      
      // Sort projects (if they have date, or keep default ordering)
      setProjects(merged);
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
  }, [projects, activeCategory]); // Re-run on dynamic updates

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
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Kaluna Visual <span>Portfolio</span>
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
              style={{ marginRight: '0.25rem' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setIsAdminOpen(true)}
              title="Akses Panel Admin"
            >
              <Lock size={16} />
            </button>
            <button 
              className="btn-icon mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            <div className="hero-lanyard-wrapper" style={{ position: 'absolute', top: 0, right: lanyardRight }}>
              {!isMobile && (
                <Lanyard
                  position={[0, 0, 14]}
                  gravity={[0, -40, 0]}
                  frontImage="/foto-depna.png"
                  backImage="/foto-belakang.png"
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
              <h2 className="section-title" style={{ marginBottom: '1.5rem', lineHeight: '1.05' }}>Di Balik Lensa & Layar</h2>
              <p className="about-paragraph">
                Sebagai kreator multi-disiplin, saya bergerak di persimpangan antara visual storytelling dan digital experience. Lewat lensa fotografi dan videografi, saya meng-capture momen jujur dan mengubahnya menjadi compelling stories.
              </p>
              <p className="about-paragraph">
                Skillset tersebut kemudian saya aplikasikan ke dalam industri desain grafis dan UI/UX. Fokus saya adalah melakukan crafting pada identitas merek agar lebih impactful, serta merancang produk digital yang tidak hanya estetik secara look and feel, tetapi juga memberikan delightful experience bagi user.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Infinite Logo Marquee */}
      <section className="reveal" style={{ width: '100%' }}>
        <LogoLoop
          logos={toolsMarquee}
          speed={isMobile ? 55 : 80}
          direction="left"
          logoHeight={isMobile ? 40 : 65}
          gap={isMobile ? 65 : 120}
          pauseOnHover={true}
          scaleOnHover={true}
          fadeOut={true}
          ariaLabel="Software and design tools"
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
            addToast={addToast}
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
                href="mailto:kalunavisual1@gmail.com" 
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
                kalunavisual1@gmail.com
              </a>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <a href="mailto:kalunavisual1@gmail.com" className="btn btn-primary">
                <Mail size={16} />
                <span>Kirim Email</span>
              </a>
              <a href="https://wa.me/6281510435042" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <Phone size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

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
                <a href="#" className="footer-link">Instagram</a>
                <a href="#" className="footer-link">LinkedIn</a>
                <a href="#" className="footer-link">Behance</a>
              </div>
            </div>
          </div>

          {/* Giant Title (Exactly 1 Line) */}
          <div className="footer-giant-text">
            Kaluna Visual
          </div>

          {/* Bottom row */}
          <div className="footer-bottom">
            <div className="footer-brand">
              Kaluna Visual
            </div>
            <div className="footer-bottom-links">
              <span>© 2026 Kaluna Visual</span>
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

      {/* Loading preloader */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
    </div>
  );
}

export default App;
