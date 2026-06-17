import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Play, X, Calendar, User, Briefcase, Cpu, Link } from 'lucide-react';
import TiltedCard from './TiltedCard';

const isVideoUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  const extension = url.split('.').pop().split('?')[0].toLowerCase();
  return ['mp4', 'webm', 'ogg', 'mov', 'quicktime'].includes(extension);
};

const PortfolioGrid = ({ projects = [], activeCategory, setActiveCategory, addToast }) => {
  const [selectedProject, setSelectedProject] = useState(null);

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

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'photography', label: 'Fotografi' },
    { id: 'videography', label: 'Videografi' },
    { id: 'design', label: 'Desain Grafis' },
    { id: 'uiux', label: 'UI/UX Design' }
  ];

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const getCategoryLabel = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="portfolio-content">
      {/* Categories Filter Tabs */}
      <div className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      {filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Belum ada karya di kategori ini.
        </div>
      ) : (
        <div className="portfolio-grid">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="portfolio-card reveal"
              style={{ transitionDelay: `${(index % 2) * 120}ms`, cursor: 'pointer' }}
              onClick={() => setSelectedProject(project)}
            >
              {project.mediaType === 'video' && (
                <div className="video-badge" style={{ zIndex: 10 }}>
                  <Play size={16} fill="currentColor" />
                </div>
              )}
              <TiltedCard
                imageSrc={project.mediaUrl}
                altText={project.title}
                captionText={project.title}
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                rotateAmplitude={12}
                scaleOnHover={1.06}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                isVideo={project.mediaType === 'video'}
                overlayContent={
                  <div className="card-overlay" style={{ pointerEvents: 'none' }}>
                    <span className="card-category">{getCategoryLabel(project.category)}</span>
                    <h3 className="card-title">{project.title}</h3>
                    <div className="card-arrow">
                      <span>Lihat Detail</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Premium Detail Modal Overlay */}
      <div className={`modal-overlay ${selectedProject ? 'open' : ''}`}>
        {selectedProject && (
          <>
            <div className="modal-controls">
              <button className="modal-control-btn" onClick={handleCopyLink} title="Salin Link Karya">
                <Link size={18} />
              </button>
              <button className="modal-control-btn modal-close-btn" onClick={handleCloseModal} title="Tutup">
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
                {selectedProject.mediaType === 'video' ? (
                  <video 
                    src={selectedProject.mediaUrl} 
                    controls 
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
                <div className="modal-gallery">
                  <h4 style={{ 
                    fontFamily: 'var(--font-serif)', 
                    fontSize: '1.5rem', 
                    marginBottom: '1rem',
                    fontWeight: '400'
                  }}>
                    Galeri Tambahan
                  </h4>
                  {selectedProject.gallery.map((url, index) => (
                    <div key={index} className="modal-gallery-item">
                      {isVideoUrl(url) ? (
                        <video 
                          src={url} 
                          controls 
                          playsInline 
                          style={{ width: '100%', display: 'block', maxHeight: '550px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)' }}
                        />
                      ) : (
                        <img 
                          src={url} 
                          alt={`${selectedProject.title} Gallery ${index + 1}`}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none'; // hide broken images in gallery
                          }}
                        />
                      )}
                    </div>
                  ))}
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
