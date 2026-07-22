import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Play, X, Calendar, User, Briefcase, Cpu, Link } from 'lucide-react';
import TiltedCard from './TiltedCard';
import Masonry from './Masonry';
import Lenis from 'lenis';
import { motion } from 'motion/react';

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

const PortfolioGrid = ({ projects = [], activeCategory, setActiveCategory, addToast, onTrackProjectClick }) => {
  const [selectedProject, setSelectedProject] = useState(null);

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
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq < 128;
  };

  const getModalStyle = () => {
    if (!selectedProject || !selectedProject.backgroundColor) return {};
    const bg = selectedProject.backgroundColor;
    const isDarkBg = isColorDark(bg);
    const textPrimary = isDarkBg ? '#ffffff' : '#0a0a0c';
    const textSecondary = isDarkBg ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 12, 0.7)';
    const textTertiary = isDarkBg ? 'rgba(255, 255, 255, 0.45)' : 'rgba(10, 10, 12, 0.45)';
    const borderColor = isDarkBg ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    const tagBg = isDarkBg ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)';

    const hexToRgba = (hex, opacity) => {
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length !== 6) return hex;
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return {
      backgroundColor: bg.startsWith('#') ? hexToRgba(bg, 0.65) : bg,
      color: textPrimary,
      '--text-primary': textPrimary,
      '--text-secondary': textSecondary,
      '--text-tertiary': textTertiary,
      '--border-color': borderColor,
      '--bg-tertiary': tagBg
    };
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    // Clean up URL query parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const handleCopyLink = () => {
    if (!selectedProject) return;
    const url = `${window.location.origin}${window.location.pathname}?project=${selectedProject.id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        if (addToast) {
          addToast('Link karya berhasil disalin!', 'success');
        } else {
          alert('Link karya berhasil disalin!');
        }
      })
      .catch(() => {
        if (addToast) {
          addToast('Gagal menyalin link.', 'error');
        }
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId && projects.length > 0) {
      const proj = projects.find(p => p.id === projectId);
      if (proj) {
        setSelectedProject(proj);
      }
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  // Instantiate Lenis smooth scrolling inside the details modal when open
  useEffect(() => {
    if (!selectedProject) return;

    const timer = setTimeout(() => {
      const wrapper = document.querySelector('.modal-overlay');
      const content = document.querySelector('.modal-container');
      
      if (!wrapper || !content) return;

      const modalLenis = new Lenis({
        wrapper: wrapper,
        content: content,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      });

      let rafId;
      function raf(time) {
        modalLenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        modalLenis.destroy();
      };
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedProject]);

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'photography', label: 'Fotografi' },
    { id: 'videography', label: 'Videografi' },
    { id: 'design', label: 'Desain Grafis' },
    { id: 'uiux', label: 'UI/UX Design' },
    { id: 'random', label: 'Random Pict' }
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
      {/* Categories Filter Tabs Centered Wrapper */}
      <div className="filter-tabs-wrapper" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
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
            Belum ada karya di kategori ini.
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
                      <span>Klien</span>
                    </div>
                    <div className="meta-item-value">{selectedProject.client || 'Personal Project'}</div>
                  </div>
                  
                  <div className="meta-item">
                    <div className="meta-item-title">
                      <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      <span>Tanggal</span>
                    </div>
                    <div className="meta-item-value">{selectedProject.date || 'Terbaru'}</div>
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
                    Galeri Tambahan
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
