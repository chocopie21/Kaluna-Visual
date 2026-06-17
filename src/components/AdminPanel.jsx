import React, { useState, useEffect } from 'react';
import { X, Lock, Plus, List, Trash2, Upload, FileText, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';

const isVideoUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  const extension = url.split('.').pop().split('?')[0].toLowerCase();
  return ['mp4', 'webm', 'ogg', 'mov', 'quicktime'].includes(extension);
};

const AdminPanel = ({ isOpen, onClose, projects = [], onUpdateProjects, addToast }) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('photography');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [tools, setTools] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const expectedPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'admin123';
    if (passcode === expectedPasscode) {
      setIsAuthenticated(true);
      addToast('Login admin berhasil', 'success');
      setPasscode('');
    } else {
      addToast('Passcode salah!', 'error');
    }
  };

  // Convert File to Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // Handle Main Media Selection
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Gallery Selection
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setGalleryFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and Drop Handlers for Media Utama
  const handleMediaDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMediaDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(true);
  };

  const handleMediaDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(false);
  };

  const handleMediaDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    setMediaFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handlers for Galeri Tambahan
  const handleGalleryDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleGalleryDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(true);
  };

  const handleGalleryDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
  };

  const handleGalleryDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter to only include images and videos for gallery
    const allowedFiles = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (allowedFiles.length === 0) {
      addToast('Hanya file gambar & video yang didukung untuk galeri tambahan!', 'error');
      return;
    }

    setGalleryFiles(prev => [...prev, ...allowedFiles]);

    allowedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle start editing project
  const handleStartEdit = (project) => {
    setEditingProject(project);
    setTitle(project.title);
    setCategory(project.category);
    setDescription(project.description);
    setClient(project.client || '');
    setDate(project.date || '');
    setTools(project.tools ? project.tools.join(', ') : '');
    setMediaPreview(project.mediaUrl || '');
    setMediaType(project.mediaType || 'image');
    setMediaFile(null); // Reset new file upload
    setGalleryPreviews(project.gallery || []);
    setGalleryFiles([]); // Reset new gallery uploads
    setActiveTab('add'); // Switch to form tab
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingProject(null);
    resetForm();
  };

  // Remove item from gallery
  const handleRemoveGalleryItem = (idx) => {
    const previewToRemove = galleryPreviews[idx];
    if (previewToRemove && previewToRemove.startsWith('data:')) {
      const fileIndex = galleryPreviews.slice(0, idx).filter(p => p.startsWith('data:')).length;
      setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || (!mediaFile && !mediaPreview)) {
      addToast('Harap isi judul, deskripsi, dan unggah media utama!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalMediaUrl = mediaPreview;
      const finalGalleryUrls = galleryPreviews.filter(p => !p.startsWith('data:'));

      // 1. Upload Main Media to Local Storage / Server API
      if (mediaFile) {
        const base64Data = await toBase64(mediaFile);
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: mediaFile.name,
              type: mediaFile.type,
              data: base64Data
            })
          });
          if (res.ok) {
            const data = await res.json();
            finalMediaUrl = data.url;
          } else {
            console.warn('API upload failed, falling back to base64');
          }
        } catch (apiErr) {
          console.warn('API connection failed, falling back to base64 storage', apiErr);
        }
      }

      // 2. Upload new Gallery Files
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        const base64Data = await toBase64(file);
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              type: file.type,
              data: base64Data
            })
          });
          if (res.ok) {
            const data = await res.json();
            finalGalleryUrls.push(data.url);
          } else {
            console.warn('Gallery API upload failed');
          }
        } catch (apiErr) {
          console.warn('Gallery API upload error', apiErr);
        }
      }

      // 3. Save Project object
      const toolsArray = tools.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const projectData = {
        title,
        category,
        description,
        client,
        date,
        tools: toolsArray,
        featured: true,
        mediaType,
        mediaUrl: finalMediaUrl,
        gallery: finalGalleryUrls
      };

      if (editingProject) {
        projectData.id = editingProject.id;
      }

      let saveSuccess = false;
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
        if (res.ok) {
          const data = await res.json();
          // Fetch refreshed projects
          const refreshedRes = await fetch('./data.json');
          if (refreshedRes.ok) {
            const refreshedData = await refreshedRes.json();
            onUpdateProjects(refreshedData);
          } else {
            // fallback local update
            if (editingProject) {
              onUpdateProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
            } else {
              onUpdateProjects([data.project, ...projects]);
            }
          }
          saveSuccess = true;
        }
      } catch (err) {
        console.warn('Could not save to server, using client local update', err);
      }

      if (!saveSuccess) {
        if (editingProject) {
          const updated = projects.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p);
          onUpdateProjects(updated);
          // Update localStorage
          const localSaved = JSON.parse(localStorage.getItem('local_portfolio_projects') || '[]');
          const updatedLocal = localSaved.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p);
          localStorage.setItem('local_portfolio_projects', JSON.stringify(updatedLocal));
        } else {
          const clientProject = {
            id: Date.now().toString(),
            ...projectData
          };
          onUpdateProjects([clientProject, ...projects]);
          const localSaved = JSON.parse(localStorage.getItem('local_portfolio_projects') || '[]');
          localStorage.setItem('local_portfolio_projects', JSON.stringify([clientProject, ...localSaved]));
        }
      }

      addToast(editingProject ? 'Karya berhasil diperbarui!' : 'Karya berhasil ditambahkan!', 'success');
      resetForm();
      setEditingProject(null);
      setActiveTab('manage');
    } catch (err) {
      addToast('Gagal menyimpan karya: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Project Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus karya ini?')) return;

    try {
      let deleteSuccess = false;
      try {
        const res = await fetch('/api/projects/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          const refreshedRes = await fetch('./data.json');
          if (refreshedRes.ok) {
            const refreshedData = await refreshedRes.json();
            onUpdateProjects(refreshedData);
          } else {
            onUpdateProjects(projects.filter(p => p.id !== id));
          }
          deleteSuccess = true;
        }
      } catch (err) {
        console.warn('Could not delete from server, using local update', err);
      }

      if (!deleteSuccess) {
        // Fallback for offline mode / localStorage
        onUpdateProjects(projects.filter(p => p.id !== id));
        const localSaved = JSON.parse(localStorage.getItem('local_portfolio_projects') || '[]');
        localStorage.setItem('local_portfolio_projects', JSON.stringify(localSaved.filter(p => p.id !== id)));
      }

      addToast('Karya berhasil dihapus!', 'success');
    } catch (err) {
      addToast('Gagal menghapus karya: ' + err.message, 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('photography');
    setDescription('');
    setClient('');
    setDate('');
    setTools('');
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('image');
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEditingProject(null);
    resetForm();
    addToast('Logout berhasil', 'success');
  };

  return (
    <div className={`admin-drawer ${isOpen ? 'open' : ''}`}>
      <div className="admin-drawer-header">
        <h3 className="admin-drawer-title">
          <Lock size={18} />
          <span>Panel Admin</span>
        </h3>
        <button className="btn-icon" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="admin-drawer-content">
        {!isAuthenticated ? (
          /* Authentication Screen */
          <form onSubmit={handleLogin} className="admin-login-container">
            <div className="admin-login-lock">
              <Lock size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Akses Terbatas</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Masukkan passcode admin untuk mengunggah dan mengelola karya.
              </p>
            </div>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan passcode"
              style={{ width: '100%', textAlign: 'center' }}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Masuk
            </button>
          </form>
        ) : (
          /* Dashboard Screen */
          <div>
            {/* Admin Tabs */}
            <div className="admin-tabs">
              <button
                className={`admin-tab ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => setActiveTab('add')}
              >
                {editingProject ? (
                  <>
                    <Edit2 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Edit Karya
                  </>
                ) : (
                  <>
                    <Plus size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Tambah Karya
                  </>
                )}
              </button>
              <button
                className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => {
                  if (editingProject) {
                    if (window.confirm('Batalkan pengeditan karya?')) {
                      handleCancelEdit();
                    } else {
                      return;
                    }
                  }
                  setActiveTab('manage');
                }}
              >
                <List size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Kelola Karya ({projects.length})
              </button>
            </div>

            {/* TAB: Add Project */}
            {activeTab === 'add' && (
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label className="contact-label">Judul Karya *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Portrait of Humanity"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="contact-label">Kategori *</label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ backgroundPosition: 'right 1rem center' }}
                  >
                    <option value="photography">Fotografi</option>
                    <option value="videography">Videografi</option>
                    <option value="design">Desain Grafis</option>
                    <option value="uiux">UI/UX Design</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="contact-label">Media Utama (Gambar / Video) *</label>
                  <label 
                    className={`file-dropzone ${isDraggingMedia ? 'dragging' : ''}`}
                    onDragOver={handleMediaDragOver}
                    onDragEnter={handleMediaDragEnter}
                    onDragLeave={handleMediaDragLeave}
                    onDrop={handleMediaDrop}
                    style={isDraggingMedia ? { borderColor: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' } : {}}
                  >
                    <Upload size={24} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                      {isDraggingMedia ? 'Lepaskan media di sini...' : 'Klik atau seret media utama ke sini'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Mendukung format gambar & video
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      style={{ display: 'none' }}
                    />
                    
                    {mediaPreview && !isDraggingMedia && (
                      <div style={{ width: '100%' }}>
                        {mediaType === 'video' ? (
                          <video src={mediaPreview} className="file-dropzone-preview" muted />
                        ) : (
                          <img src={mediaPreview} alt="Preview" className="file-dropzone-preview" />
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                          {mediaFile ? mediaFile.name : 'Media terpilih'}
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="form-group">
                  <label className="contact-label">Galeri Tambahan (Opsional)</label>
                  <label 
                    className={`file-dropzone ${isDraggingGallery ? 'dragging' : ''}`}
                    onDragOver={handleGalleryDragOver}
                    onDragEnter={handleGalleryDragEnter}
                    onDragLeave={handleGalleryDragLeave}
                    onDrop={handleGalleryDrop}
                    style={{ 
                      padding: '1.5rem 1rem', 
                      ...(isDraggingGallery ? { borderColor: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' } : {}) 
                    }}
                  >
                    <Plus size={18} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.85rem' }}>
                      {isDraggingGallery ? 'Lepaskan file di sini...' : 'Klik atau seret media detail (gambar/video) ke sini'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleGalleryChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {galleryPreviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} style={{ position: 'relative', aspectRatio: '1', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          {isVideoUrl(preview) ? (
                            <video src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                          ) : (
                            <img src={preview} alt="Gallery Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryItem(index)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '10px',
                              zIndex: 5
                            }}
                            title="Hapus gambar ini"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="contact-label">Deskripsi Cerita / Kasus *</label>
                  <textarea
                    className="form-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ceritakan proses pembuatan, konsep, dan hasil karya ini..."
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="contact-label">Nama Klien</label>
                    <input
                      type="text"
                      className="form-input"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Contoh: Personal, Brand X"
                    />
                  </div>
                  <div className="form-group">
                    <label className="contact-label">Bulan/Tahun</label>
                    <input
                      type="text"
                      className="form-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Contoh: Juni 2026 atau 2026-06"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="contact-label">Software / Tools (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tools}
                    onChange={(e) => setTools(e.target.value)}
                    placeholder="Contoh: Photoshop, Figma, Lightroom"
                  />
                </div>

                {editingProject ? (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      style={{ flex: 1 }}
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mengunggah Karya...' : 'Simpan & Publikasikan'}
                  </button>
                )}
              </form>
            )}

            {/* TAB: Manage Projects */}
            {activeTab === 'manage' && (
              <div className="admin-project-list">
                {projects.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                    Belum ada karya yang dipublikasikan.
                  </p>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="admin-project-item">
                      <div className="admin-project-item-info">
                        <img
                          src={project.mediaUrl}
                          alt={project.title}
                          className="admin-project-item-thumb"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=80&q=80';
                          }}
                        />
                        <div className="admin-project-item-text">
                          <div className="admin-project-item-title">{project.title}</div>
                          <div className="admin-project-item-category">
                            {project.category === 'uiux' ? 'UI/UX Design' : project.category}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(project)}
                          title="Edit Karya"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            transition: 'var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-text-danger"
                          onClick={() => handleDelete(project.id)}
                          title="Hapus Karya"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '2rem', color: '#dc3545', borderColor: 'rgba(220, 53, 69, 0.2)' }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
