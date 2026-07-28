import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Play, X, Calendar, User, Briefcase, Cpu, Link, Grid, List } from 'lucide-react';
import TiltedCard from './TiltedCard';
import Masonry from './Masonry';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'motion/react';

const isVideoUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  const extension = url.split('.').pop().split('?')[0].toLowerCase();
  return ['mp4', 'webm', 'ogg', 'mov', 'quicktime'].includes(extension);
};

const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
};

const getYouTubeThumbnail = (url) => {
  if (!url) return '';
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

const PortfolioGrid = ({ projects = [], activeCategory, setActiveCategory, viewMode, setViewMode, addToast, onTrackProjectClick, lang = 'id' }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleListItemMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleListItemMouseEnter = (project) => {
    setHoveredProject(project);
  };

  const handleListItemMouseLeave = () => {
    setHoveredProject(null);
  };

  useEffect(() => {
    if (selectedProject && onTrackProjectClick) {
      onTrackProjectClick(selectedProject.id);
    }
  }, [selectedProject, onTrackProjectClick]);

  // Helper to check if a color is dark
  const isColorDark = (hexColor) => {
    if (!hexColor) return false;
    const cleanHex = hexColor.replace('#', '');
    if (cleanHex.length !== 6) return false;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const getModalStyle = () => {
    if (!selectedProject || !selectedProject.color) return {};
    
    // Hex to RGBA conversion for the custom context tint overlay
    let hex = selectedProject.color.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.08)`,
      backdropFilter: 'blur(30px) saturate(190%)',
      WebkitBackdropFilter: 'blur(30px) saturate(190%)'
    };
  };

  const handleCopyLink = () => {
    if (!selectedProject) return;
    const url = `${window.location.origin}/?project=${selectedProject.id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        if (addToast) addToast(lang === 'id' ? 'Link karya berhasil disalin!' : 'Project link copied to clipboard!');
      })
      .catch(() => {
        if (addToast) addToast(lang === 'id' ? 'Gagal menyalin link!' : 'Failed to copy link!', 'error');
      });
  };

  // Dedicated Lenis instance for Modal Scrolling
  useEffect(() => {
    if (!selectedProject) return;

    let lenisModal;
    // Delay creation to make sure elements are fully mounted
    const timer = setTimeout(() => {
      const overlayEl = document.querySelector('.modal-overlay');
      if (overlayEl) {
        lenisModal = new Lenis({
          wrapper: overlayEl, // Scroll overlay wrapper
          content: overlayEl.querySelector('.modal-container'), // Target the container inside
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.1,
          touchMultiplier: 1.8,
        });

        const raf = (time) => {
          if (lenisModal) {
            lenisModal.raf(time);
            requestAnimationFrame(raf);
          }
        };
        requestAnimationFrame(raf);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (lenisModal) {
        lenisModal.destroy();
      }
    };
  }, [selectedProject]);

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  // Check URL query param ?project=ID for direct link views
  useEffect(() => {
    if (projects.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) {
      const match = projects.find(p => p.id === projectId);
      if (match) {
        // Delay modal load slightly to wait for layout animations to finish
        const timer = setTimeout(() => {
          setSelectedProject(match);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [projects]);

  // Clean URL when modal closes
  useEffect(() => {
    if (!selectedProject) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('project')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [selectedProject]);

  // Prevent background page body scroll while modal is active
  useEffect(() => {
    if (selectedProject) {
      document.body.classList.add('lenis-stopped');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  // Prevent esc key handling crashes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync scroll positioning to prevent visual viewport jumping when modal opens
  useEffect(() => {
    if (!selectedProject) return;
    const timer = setTimeout(() => {
      const overlayEl = document.querySelector('.modal-overlay');
      if (overlayEl) {
        overlayEl.scrollTop = 0;
      }
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedProject]);

  const categories = [
    { id: 'all', label: lang === 'id' ? 'Semua' : 'All' },
    { id: 'photography', label: lang === 'id' ? 'Fotografi' : 'Photography' },
    { id: 'videography', label: lang === 'id' ? 'Videografi' : 'Videography' },
    { id: 'design', label: lang === 'id' ? 'Desain Grafis' : 'Graphic Design' },
    { id: 'uiux', label: lang === 'id' ? 'UI/UX Design' : 'UI/UX Design' },
    { id: 'random', label: lang === 'id' ? 'Random Pict' : 'Random Pict' }
  ];

  const filteredProjects = activeCategory === 'all'
    ? projects.filter(p => p.category !== 'random')
    : projects.filter(p => p.category === activeCategory);

  const getCategoryLabel = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="portfolio-content">
      {/* Centered Portfolio Controls Bar */}
      <div className="portfolio-controls">
        {/* Left Spacer to balance centering of filter tabs */}
        <div className="controls-spacer" style={{ width: '88px' }} />
        
        {/* Categories Filter Tabs Centered Wrapper */}
        <div className="filter-tabs-wrapper" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <div className="filter-tabs" role="group" aria-label="Filter kategori portofolio">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`filter-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                style={{ position: 'relative' }}
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="filter-tab-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="filter-tab-text">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher Toggle on the Right */}
        <div className="switcher-wrapper" style={{ width: '88px', display: 'flex', justifyContent: 'flex-end' }}>
          {activeCategory !== 'random' && (
            <div className="view-switcher-toggle" style={{
              display: 'flex',
              background: 'var(--bg-navbar, rgba(255, 255, 255, 0.45))',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '0.25rem',
              gap: '0.15rem',
              position: 'relative'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`switcher-btn ${viewMode === 'grid' ? 'active' : ''}`}
                style={{
                  position: 'relative',
                  background: 'transparent',
                  color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'color 0.25s ease',
                  zIndex: 2
                }}
                aria-label="Grid View"
              >
                {viewMode === 'grid' && (
                  <motion.div
                    layoutId="activeViewPill"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '50%',
                      background: 'var(--accent-color, #e54d3b)',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`switcher-btn ${viewMode === 'list' ? 'active' : ''}`}
                style={{
                  position: 'relative',
                  background: 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'color 0.25s ease',
                  zIndex: 2
                }}
                aria-label="List View"
              >
                {viewMode === 'list' && (
                  <motion.div
                    layoutId="activeViewPill"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '50%',
                      background: 'var(--accent-color, #e54d3b)',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <List size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout or Masonry Layout for Random Pict */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ width: '100%' }}
      >
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            {lang === 'id' ? 'Belum ada karya di kategori ini.' : 'No works found in this category yet.'}
          </div>
        ) : activeCategory === 'random' ? (
          <Masonry
            items={filteredProjects.map(project => ({
              id: project.id,
              img: isYouTubeUrl(project.mediaUrl) ? getYouTubeThumbnail(project.mediaUrl) : project.mediaUrl,
              project: project
            }))}
            onItemClick={setSelectedProject}
            stagger={0.04}
            scaleOnHover={true}
            hoverScale={0.96}
            blurToFocus={true}
            colorShiftOnHover={false}
          />
        ) : viewMode === 'list' ? (
          <div className="portfolio-list">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="portfolio-list-item"
                onMouseEnter={() => handleListItemMouseEnter(project)}
                onMouseLeave={handleListItemMouseLeave}
                onMouseMove={handleListItemMouseMove}
                onClick={() => setSelectedProject(project)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                  <span className="list-item-number" style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1rem',
                    color: 'var(--text-tertiary)',
                    fontWeight: '600'
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="list-item-category" style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--accent-color)',
                    fontWeight: '700'
                  }}>
                    {getCategoryLabel(project.category)}
                  </span>
                  <h3 className="list-item-title" style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
                    fontWeight: '400',
                    margin: 0,
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s ease'
                  }}>
                    {project.title}
                  </h3>
                </div>
                <div className="list-item-arrow" style={{
                  color: 'var(--text-secondary)',
                  opacity: 0.5,
                  transform: 'scale(1)',
                  transition: 'all 0.3s ease'
                }}>
                  <ArrowUpRight size={28} />
                </div>
              </div>
            ))}

            {/* Floating Hover Preview Card */}
            <AnimatePresence>
              {hoveredProject && (
                <motion.div
                  className="floating-list-preview"
                  initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                    x: mousePosition.x + 30,
                    y: mousePosition.y - 120
                  }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 5 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 28,
                    x: { type: 'spring', stiffness: 200, damping: 20 },
                    y: { type: 'spring', stiffness: 200, damping: 20 }
                  }}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 9999,
                    width: '320px',
                    aspectRatio: '4/3',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: '#121110'
                  }}
                >
                  {(() => {
                    const isVid = hoveredProject.mediaType === 'video' && !isYouTubeUrl(hoveredProject.mediaUrl);
                    const posterImage = hoveredProject.poster || (hoveredProject.gallery && hoveredProject.gallery.find(g => g.url && !g.url.match(/\.(mp4|webm|ogg|mov)$/i))?.url) || '';
                    
                    if (isVid && !posterImage) {
                      return (
                        <video
                          src={`${hoveredProject.mediaUrl}#t=0.001`}
                          preload="metadata"
                          muted
                          playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      );
                    }
                    
                    const imgSrc = posterImage || (isYouTubeUrl(hoveredProject.mediaUrl) ? getYouTubeThumbnail(hoveredProject.mediaUrl) : hoveredProject.mediaUrl);
                    return (
                      <img 
                        src={imgSrc}
                        alt={hoveredProject.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="portfolio-grid">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="portfolio-card reveal"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedProject(project)}
              >
                <div className="portfolio-card-media-wrapper" style={{ width: '100%', aspectRatio: '4/3', position: 'relative' }}>
                  {(project.mediaType === 'video' || isYouTubeUrl(project.mediaUrl)) && (
                    <div className="video-badge" style={{ zIndex: 10 }}>
                      <Play size={16} fill="currentColor" />
                    </div>
                  )}
                  {(() => {
                    const posterImage = project.poster || (project.gallery && project.gallery.find(g => g.url && !g.url.match(/\.(mp4|webm|ogg|mov)$/i))?.url) || '';
                    return (
                      <TiltedCard
                        imageSrc={isYouTubeUrl(project.mediaUrl) ? getYouTubeThumbnail(project.mediaUrl) : project.mediaUrl}
                        posterSrc={posterImage}
                        altText={project.title}
                        captionText={project.title}
                        containerHeight="100%"
                        containerWidth="100%"
                        imageHeight="100%"
                        imageWidth="100%"
                        rotateAmplitude={8}
                        scaleOnHover={1.03}
                        showMobileWarning={false}
                        showTooltip={false}
                        displayOverlayContent={true}
                        overlayContent={
                          <div className="tilted-card-custom-overlay">
                            <span className="tilted-card-custom-category">
                              {getCategoryLabel(project.category)}
                            </span>
                            <h4 className="tilted-card-custom-title">
                              {project.title}
                            </h4>
                          </div>
                        }
                        isVideo={project.mediaType === 'video' && !isYouTubeUrl(project.mediaUrl)}
                      />
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Premium Detail Modal Overlay */}
      <div 
        className={`modal-overlay ${selectedProject ? 'open' : ''}`}
        style={getModalStyle()}
        data-lenis-prevent="true"
        role="dialog"
        aria-modal="true"
        aria-label={selectedProject ? `Detail karya: ${selectedProject.title}` : undefined}
      >
        {selectedProject && (
          <>
            <div className="modal-controls">
              <button className="modal-control-btn" onClick={handleCopyLink} title="Salin Link Karya" aria-label="Salin link karya ke clipboard">
                <Link size={18} />
              </button>
              <button className="modal-control-btn modal-close-btn" onClick={handleCloseModal} title="Tutup" aria-label="Tutup detail karya">
                <X size={18} />
              </button>
            </div>
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-category">{getCategoryLabel(selectedProject.category)}</div>
                <h1 className="modal-title">{selectedProject.title}</h1>
                
                <div className="modal-metadata">
                  <div className="meta-item">
                    <div className="meta-item-title">
                      <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      <span>{lang === 'id' ? 'Klien' : 'Client'}</span>
                    </div>
                    <div className="meta-item-value">{selectedProject.client || (lang === 'id' ? 'Proyek Pribadi' : 'Personal Project')}</div>
                  </div>
                  
                  <div className="meta-item">
                    <div className="meta-item-title">
                      <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      <span>{lang === 'id' ? 'Tanggal' : 'Date'}</span>
                    </div>
                    <div className="meta-item-value">{selectedProject.date || (lang === 'id' ? 'Terbaru' : 'Recent')}</div>
                  </div>
                  
                  <div className="meta-item">
                    <div className="meta-item-title">
                      <Cpu size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      <span>Software / Tools</span>
                    </div>
                    <div className="meta-tools">
                      {selectedProject.tools && selectedProject.tools.length > 0 ? (
                        selectedProject.tools.map((tool, idx) => (
                          <span key={idx} className="tool-tag">{tool}</span>
                        ))
                      ) : (
                        <span className="meta-item-value">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Media Visual */}
              <div className="modal-main-media">
                {isYouTubeUrl(selectedProject.mediaUrl) ? (
                  <div className="modal-youtube-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 'var(--border-radius-md)' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(selectedProject.mediaUrl)}
                      title={selectedProject.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  </div>
                ) : selectedProject.mediaType === 'video' ? (
                  <video 
                    src={selectedProject.mediaUrl} 
                    controls 
                    controlsList="nodownload nofullscreen"
                    onContextMenu={(e) => e.preventDefault()}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="modal-video-player"
                  />
                ) : (
                  <img
                    src={selectedProject.mediaUrl}
                    alt={selectedProject.title}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                )}
              </div>

              {/* Project Story / Description */}
              <div className="modal-description">
                <p>{selectedProject.description}</p>
              </div>

              {/* Additional Gallery Items */}
              {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                <div>
                  <h4 style={{ 
                    fontFamily: 'var(--font-serif)', 
                    fontSize: '1.5rem', 
                    marginBottom: '1rem',
                    fontWeight: '400'
                  }}>
                    {lang === 'id' ? 'Galeri Tambahan' : 'Additional Gallery'}
                  </h4>
                  <div className="modal-gallery">
                    {selectedProject.gallery.map((item, index) => {
                      const url = typeof item === 'string' ? item : item.url;
                      const layout = typeof item === 'string' ? 'full' : (item.layout || 'full');
                      const padding = typeof item === 'string' ? false : (item.padding || false);
                      const isSplit = layout === 'half';
                      const isThird = layout === 'third';
                      return (
                        <div key={index} className={`modal-gallery-item ${isSplit ? 'split' : isThird ? 'third' : ''} ${padding ? 'padded-item' : ''}`}>
                          {isVideoUrl(url) ? (
                            <video 
                              src={url} 
                              controls 
                              controlsList="nodownload nofullscreen"
                              onContextMenu={(e) => e.preventDefault()}
                              playsInline 
                              style={padding ? {
                                width: 'auto',
                                maxWidth: '100%',
                                height: 'auto',
                                maxHeight: '650px',
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: 'var(--border-radius-sm)',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                              } : {
                                width: '100%',
                                display: 'block',
                                maxHeight: '780px',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: 'var(--border-radius-md)'
                              }}
                            />
                          ) : (
                            <img 
                              src={url} 
                              alt={`${selectedProject.title} Gallery ${index + 1}`}
                              loading="lazy"
                              onContextMenu={(e) => e.preventDefault()}
                              draggable="false"
                              style={padding ? {
                                width: 'auto',
                                maxWidth: '100%',
                                height: 'auto',
                                maxHeight: '650px',
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: 'var(--border-radius-sm)',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                              } : {}}
                              onError={(e) => {
                                e.target.style.display = 'none'; // hide broken images in gallery
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PortfolioGrid;
