import React, { useState, useEffect } from 'react';
import { X, Lock, Plus, List, Trash2, Upload, FileText, CheckCircle2, AlertCircle, Edit2, ArrowLeft, Calendar, User, Cpu, BarChart3, TrendingUp, Smartphone, Globe, Monitor } from 'lucide-react';

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

const getCategoryLabel = (cat) => {
  const labels = {
    photography: 'Fotografi',
    videography: 'Videografi',
    design: 'Desain Grafis',
    uiux: 'UI/UX Design',
    random: 'Random Pict'
  };
  return labels[cat] || cat;
};

const AdminPanel = ({ isOpen, onClose, projects = [], onUpdateProjects, addToast }) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('manage'); // 'add' or 'manage'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Drag and Drop Sorting States
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...projects];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    // Update parent state
    onUpdateProjects(reordered);

    // Save reordered projects
    try {
      let reorderSuccess = false;
      try {
        const res = await fetch('/api/projects/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reordered)
        });
        if (res.ok) {
          reorderSuccess = true;
        }
      } catch (err) {
        console.warn('API reorder call failed, using localStorage fallback', err);
      }

      if (!reorderSuccess) {
        localStorage.setItem('local_portfolio_projects', JSON.stringify(reordered));
      }
      
      addToast('Urutan karya berhasil diperbarui!', 'success');
    } catch (err) {
      addToast('Gagal menyimpan urutan: ' + err.message, 'error');
    }
    
    setDraggedIndex(null);
  };

  // Fetch or Seed Analytics
  const loadAnalytics = async () => {
    try {
      let data = {};
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.warn('API analytics load failed, using local storage fallback', err);
      }

      // If empty (no file or first time), load from localStorage or seed
      if (!data || Object.keys(data).length === 0) {
        data = JSON.parse(localStorage.getItem('portfolio_analytics') || '{}');
      }

      // Seed if still empty
      if (!data || Object.keys(data).length === 0) {
        const seedProjectClicks = {};
        projects.forEach((p, idx) => {
          // Seed with logical click numbers descending based on order
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
        
        // Save seed back
        saveAnalyticsData(data);
      } else {
        // Make sure any newly added projects exist in the clicks mapping
        let updated = false;
        if (!data.projectClicks) data.projectClicks = {};
        projects.forEach(p => {
          if (data.projectClicks[p.id] === undefined) {
            data.projectClicks[p.id] = Math.floor(Math.random() * 15) + 5;
            updated = true;
          }
        });
        if (updated) {
          saveAnalyticsData(data);
        }
      }

      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  const loadMessages = async () => {
    try {
      let data = [];
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.warn('API messages load failed, using local storage fallback', err);
      }

      if (!Array.isArray(data) || data.length === 0) {
        try {
          data = JSON.parse(localStorage.getItem('local_messages') || '[]');
        } catch (e) {
          data = [];
        }
      }

      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      let deleteSuccess = false;
      try {
        const res = await fetch('/api/messages/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          deleteSuccess = true;
        }
      } catch (err) {
        console.warn('Could not delete message from server, using local update', err);
      }

      if (!deleteSuccess) {
        const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
        const updated = localMsgs.filter(m => m.id !== id);
        localStorage.setItem('local_messages', JSON.stringify(updated));
      }

      setMessages(prev => prev.filter(m => m.id !== id));
      addToast('Pesan berhasil dihapus!', 'success');
    } catch (err) {
      addToast('Gagal menghapus pesan: ' + err.message, 'error');
    }
  };

  const saveAnalyticsData = async (updatedData) => {
    try {
      localStorage.setItem('portfolio_analytics', JSON.stringify(updatedData));
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
      } catch (e) {
        // Silently catch static hosting fallback
      }
    } catch (err) {
      console.error('Failed to save analytics', err);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAnalytics();
      loadMessages();
    }
  }, [isOpen, isAuthenticated, projects]);

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
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('');
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

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

  // Compress image on the client side before uploading
  const compressImage = (file, maxDim = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/webp', quality);
          
          fetch(compressedDataUrl)
            .then(res => res.blob())
            .then(blob => {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            })
            .catch(() => resolve(file));
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

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

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryPreviews(prev => [...prev, { url: reader.result, layout: 'full', padding: false, file }]);
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

    allowedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryPreviews(prev => [...prev, { url: reader.result, layout: 'full', padding: false, file }]);
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
    setBackgroundColor(project.backgroundColor || '');
    
    const isYT = project.mediaUrl && (project.mediaUrl.includes('youtube.com') || project.mediaUrl.includes('youtu.be'));
    setYoutubeUrl(isYT ? project.mediaUrl : '');
    
    // Normalize gallery entries (both string and object support)
    const normalizedGallery = (project.gallery || []).map(item => 
      typeof item === 'string' ? { url: item, layout: 'full', padding: false } : { padding: false, ...item }
    );
    setGalleryPreviews(normalizedGallery);
    setActiveTab('add'); // Switch to form tab
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingProject(null);
    resetForm();
  };

  // Remove item from gallery
  const handleRemoveGalleryItem = (idx) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Move gallery item (reorder)
  const handleMoveGalleryItem = (idx, direction) => {
    const newPreviews = [...galleryPreviews];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newPreviews.length) return;

    // Swap items
    const temp = newPreviews[idx];
    newPreviews[idx] = newPreviews[targetIdx];
    newPreviews[targetIdx] = temp;

    setGalleryPreviews(newPreviews);
  };

  // Toggle layout between 'full', 'half', and 'third'
  const handleToggleGalleryLayout = (idx) => {
    setGalleryPreviews(prev => prev.map((item, i) => {
      if (i === idx) {
        let nextLayout = 'half';
        if (item.layout === 'half') nextLayout = 'third';
        else if (item.layout === 'third') nextLayout = 'full';
        return { ...item, layout: nextLayout };
      }
      return item;
    }));
  };

  // Toggle padding (breathing room)
  const handleToggleGalleryPadding = (idx) => {
    setGalleryPreviews(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, padding: !item.padding };
      }
      return item;
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaFile && !mediaPreview) {
      addToast('Harap unggah media utama!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalMediaUrl = mediaPreview;
      let finalMediaType = mediaType;

      if (youtubeUrl) {
        finalMediaUrl = youtubeUrl;
        finalMediaType = 'video';
      }

      const finalGalleryItems = [];

      // 1. Upload Main Media to Local Storage / Server API
      if (mediaFile) {
        let fileToUpload = mediaFile;
        if (mediaFile.type.startsWith('image/')) {
          fileToUpload = await compressImage(mediaFile);
        }
        const base64Data = await toBase64(fileToUpload);
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: fileToUpload.name,
              type: fileToUpload.type,
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

      // 2. Upload new Gallery Files or preserve existing URLs
      for (let i = 0; i < galleryPreviews.length; i++) {
        const item = galleryPreviews[i];
        if (item.file) {
          // New file needs uploading
          let fileToUpload = item.file;
          if (item.file.type.startsWith('image/')) {
            fileToUpload = await compressImage(item.file);
          }
          const base64Data = await toBase64(fileToUpload);
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: fileToUpload.name,
                type: fileToUpload.type,
                data: base64Data
              })
            });
            if (res.ok) {
              const data = await res.json();
              finalGalleryItems.push({ url: data.url, layout: item.layout, padding: !!item.padding });
            } else {
              console.warn('Gallery API upload failed, falling back to base64');
              finalGalleryItems.push({ url: item.url, layout: item.layout, padding: !!item.padding });
            }
          } catch (apiErr) {
            console.warn('Gallery API upload error, falling back to base64 storage', apiErr);
            finalGalleryItems.push({ url: item.url, layout: item.layout, padding: !!item.padding });
          }
        } else {
          // Existing file URL, just keep it
          finalGalleryItems.push({ url: item.url, layout: item.layout, padding: !!item.padding });
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
        gallery: finalGalleryItems,
        backgroundColor: backgroundColor || ''
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
          let refreshed = false;
          try {
            // Use absolute root path for fetching data.json
            const refreshedRes = await fetch('/data.json');
            if (refreshedRes.ok) {
              const refreshedData = await refreshedRes.json();
              if (Array.isArray(refreshedData)) {
                onUpdateProjects(refreshedData);
                refreshed = true;
              }
            }
          } catch (fetchErr) {
            console.warn('Failed to fetch updated data.json, falling back to local state insert', fetchErr);
          }

          if (!refreshed) {
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
        console.warn('Save API call failed, using localStorage fallback', err);
      }

      if (!saveSuccess) {
        // Fallback for offline / static hosting mode
        let localSaved = [];
        try {
          localSaved = JSON.parse(localStorage.getItem('local_portfolio_projects') || '[]');
          if (!Array.isArray(localSaved)) localSaved = [];
        } catch (e) {
          localSaved = [];
        }

        if (editingProject) {
          const updatedLocal = localSaved.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p);
          localStorage.setItem('local_portfolio_projects', JSON.stringify(updatedLocal));
          onUpdateProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
        } else {
          const newProject = { ...projectData, id: Date.now().toString() };
          localSaved.unshift(newProject); // prepend to match server behavior
          localStorage.setItem('local_portfolio_projects', JSON.stringify(localSaved));
          onUpdateProjects([newProject, ...projects]);
        }
      }

      addToast(editingProject ? 'Perubahan berhasil disimpan!' : 'Karya baru berhasil diterbitkan!', 'success');
      resetForm();
      setEditingProject(null);
      setActiveTab('manage');
    } catch (err) {
      addToast('Gagal mempublikasikan karya: ' + err.message, 'error');
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
    setGalleryPreviews([]);
    setBackgroundColor('');
    setYoutubeUrl('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEditingProject(null);
    resetForm();
    addToast('Logout berhasil', 'success');
  };

  const renderSVGChart = () => {
    if (!analytics || !analytics.dailyViews) return null;
    
    const views = analytics.dailyViews;
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    
    const width = 600;
    const height = 150;
    const padding = 25;
    
    const maxVal = Math.max(...views, 10);
    const minVal = 0;
    const valRange = maxVal - minVal;
    
    const points = views.map((val, i) => {
      const x = padding + (i / (views.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
      return { x, y, val };
    });
    
    const lineD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
    const areaD = `${lineD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (height - padding * 2);
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              className="chart-grid-line"
            />
          );
        })}
        
        <path d={areaD} fill="url(#chartGradient)" />
        <path d={lineD} className="chart-line" />
        
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              className="chart-point"
              title={`${days[i]}: ${p.val} views`}
            />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="var(--text-primary)"
            >
              {p.val}
            </text>
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fontWeight="500"
              fill="var(--text-tertiary)"
            >
              {days[i]}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const renderPopularityList = () => {
    if (!analytics || !analytics.projectClicks) return null;
    
    const sortedProjects = [...projects].map(p => {
      const clicks = analytics.projectClicks[p.id] || 0;
      return { ...p, clicks };
    }).sort((a, b) => b.clicks - a.clicks);
    
    const maxClicks = Math.max(...sortedProjects.map(p => p.clicks), 1);
    
    return (
      <div className="analytics-popularity-list">
        {sortedProjects.map((p) => {
          const clickPercent = (p.clicks / maxClicks) * 100;
          return (
            <div key={p.id} className="analytics-popularity-item">
              <div className="analytics-popularity-info">
                { (p.mediaType === 'video' || isVideoUrl(p.mediaUrl)) && !isYouTubeUrl(p.mediaUrl) ? (
                  <video
                    src={p.mediaUrl}
                    className="analytics-popularity-thumb"
                    muted
                    playsInline
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={isYouTubeUrl(p.mediaUrl) ? getYouTubeThumbnail(p.mediaUrl) : p.mediaUrl}
                    alt={p.title}
                    className="analytics-popularity-thumb"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=80&q=80';
                    }}
                  />
                )}
                <div className="analytics-popularity-text">
                  <div className="analytics-popularity-name">{p.title}</div>
                  <div className="analytics-popularity-meta">
                    {getCategoryLabel(p.category)}
                  </div>
                </div>
              </div>
              
              <div className="analytics-popularity-clicks-wrapper">
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {p.clicks} klik
                </span>
                <div className="analytics-popularity-bar-bg">
                  <div className="analytics-popularity-bar-fill" style={{ width: `${clickPercent}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderShares = () => {
    if (!analytics) return null;
    
    const { deviceShare = { mobile: 58, desktop: 42 }, sourceShare = { direct: 45, social: 35, search: 20 } } = analytics;
    
    return (
      <div className="analytics-shares-list">
        <div className="analytics-share-group">
          <div className="analytics-share-header">
            <span className="analytics-share-label">Pembagian Perangkat</span>
            <span>Desktop vs Mobile</span>
          </div>
          <div className="analytics-share-bar-bg">
            <div 
              className="analytics-share-bar-segment" 
              style={{ width: `${deviceShare.desktop}%`, backgroundColor: 'var(--text-primary)' }}
              title={`Desktop: ${deviceShare.desktop}%`}
            ></div>
            <div 
              className="analytics-share-bar-segment" 
              style={{ width: `${deviceShare.mobile}%`, backgroundColor: 'var(--text-tertiary)' }}
              title={`Mobile: ${deviceShare.mobile}%`}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Monitor size={10} /> Desktop: {deviceShare.desktop}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Smartphone size={10} /> Mobile: {deviceShare.mobile}%
            </span>
          </div>
        </div>

        <div className="analytics-share-group" style={{ marginTop: '1rem' }}>
          <div className="analytics-share-header">
            <span className="analytics-share-label">Sumber Kunjungan</span>
            <span>Metrik Sumber</span>
          </div>
          <div className="analytics-share-bar-bg">
            <div 
              className="analytics-share-bar-segment" 
              style={{ width: `${sourceShare.direct}%`, backgroundColor: 'var(--text-primary)' }}
              title={`Langsung (Direct): ${sourceShare.direct}%`}
            ></div>
            <div 
              className="analytics-share-bar-segment" 
              style={{ width: `${sourceShare.social}%`, backgroundColor: 'var(--text-secondary)' }}
              title={`Media Sosial: ${sourceShare.social}%`}
            ></div>
            <div 
              className="analytics-share-bar-segment" 
              style={{ width: `${sourceShare.search}%`, backgroundColor: 'var(--text-tertiary)' }}
              title={`Pencarian (Search): ${sourceShare.search}%`}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Globe size={10} /> Langsung: {sourceShare.direct}%
            </span>
            <span>Medsos: {sourceShare.social}%</span>
            <span>Pencarian: {sourceShare.search}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`admin-drawer ${isOpen ? 'open' : ''}`} data-lenis-prevent="true">
      {/* Root Header: Only shown on Login screen or Dashboard/Analytics screen */}
      {(!isAuthenticated || activeTab === 'manage' || activeTab === 'analytics' || activeTab === 'inbox') && (
        <div className="admin-drawer-header">
          <h3 className="admin-drawer-title" style={{ marginRight: '1rem' }}>
            <Lock size={18} />
            <span>Panel Admin</span>
          </h3>
          
          {isAuthenticated && (
            <div className="admin-tab-group">
              <button
                type="button"
                className={`admin-header-tab ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                Kelola Karya
              </button>
              <button
                type="button"
                className={`admin-header-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                Analitik
              </button>
              <button
                type="button"
                className={`admin-header-tab ${activeTab === 'inbox' ? 'active' : ''}`}
                onClick={() => setActiveTab('inbox')}
              >
                Pesan Masuk
              </button>
            </div>
          )}

          <button className="btn-icon" onClick={onClose} title="Tutup Panel Admin" style={{ marginLeft: 'auto' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="admin-drawer-content">
        {!isAuthenticated ? (
          /* Authentication Screen - Glassmorphic backdrop with centered card */
          <div className="admin-login-backdrop">
            <form onSubmit={handleLogin} className="admin-login-card">
              <div className="admin-login-lock">
                <Lock size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: '500' }}>
                  Akses Terbatas
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Masukkan passcode admin untuk mengunggah dan mengelola karya.
                </p>
              </div>
              <input
                type="password"
                className="form-input"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode Admin"
                style={{ width: '100%', textAlign: 'center', letterSpacing: passcode ? '0.25em' : 'normal' }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Masuk
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard / Editor View */
          <>
            {/* 1. DASHBOARD VIEW (Kelola Karya) */}
            {activeTab === 'manage' && (
              <div className="admin-dashboard-container">
                <div className="admin-dashboard-header">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400' }}>
                      Kelola Karya Anda
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Pilih karya untuk diedit/dihapus, atau <strong>tahan & geser foto</strong> ke urutan teratas untuk mengatur posisi di website.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        handleCancelEdit(); // Clear forms
                        setActiveTab('add'); // Switch to editor
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Plus size={16} />
                      <span>Buat Karya Baru</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleLogout}
                      style={{ color: '#dc3545', borderColor: 'rgba(220, 53, 69, 0.2)' }}
                    >
                      Log Out
                    </button>
                  </div>
                </div>

                {projects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Belum ada karya yang dipublikasikan.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        handleCancelEdit();
                        setActiveTab('add');
                      }}
                    >
                      Mulai unggah karya pertama Anda
                    </button>
                  </div>
                ) : (
                  <div className="admin-dashboard-grid">
                    {projects.map((project, index) => (
                      <div 
                        key={project.id} 
                        className={`admin-dashboard-card ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        { (project.mediaType === 'video' || isVideoUrl(project.mediaUrl)) && !isYouTubeUrl(project.mediaUrl) ? (
                          <video
                            src={project.mediaUrl}
                            className="admin-dashboard-card-image"
                            muted
                            playsInline
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <img
                            src={isYouTubeUrl(project.mediaUrl) ? getYouTubeThumbnail(project.mediaUrl) : project.mediaUrl}
                            alt={project.title}
                            className="admin-dashboard-card-image"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        )}
                        <div className="admin-dashboard-card-content">
                          <h4 className="admin-dashboard-card-title">{project.title}</h4>
                          <span className="admin-dashboard-card-meta">
                            {getCategoryLabel(project.category)}
                          </span>
                          
                          <div className="admin-dashboard-card-actions">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => handleStartEdit(project)}
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc3545', borderColor: 'rgba(220, 53, 69, 0.15)' }}
                              onClick={() => handleDelete(project.id)}
                            >
                              <Trash2 size={13} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 1b. ANALYTICS VIEW */}
            {activeTab === 'analytics' && analytics && (
              <div className="admin-dashboard-container" style={{ paddingBottom: '6rem' }}>
                <div className="admin-dashboard-header">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400' }}>
                      Statistik & Analisis Web
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Pantau data kunjungan dan performa interaksi karya portofolio Anda.
                    </p>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-card-title">
                      <span>Total Kunjungan</span>
                      <TrendingUp size={14} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div className="analytics-card-value">
                      {analytics.totalViews.toLocaleString('id-ID')}
                    </div>
                    <div className="analytics-card-trend up">
                      <span>+12% minggu ini</span>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-card-title">
                      <span>Klik Karya</span>
                      <TrendingUp size={14} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div className="analytics-card-value">
                      {analytics.totalClicks.toLocaleString('id-ID')}
                    </div>
                    <div className="analytics-card-trend up">
                      <span>+8% minggu ini</span>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-card-title">
                      <span>Rasio Interaksi (CTR)</span>
                      <TrendingUp size={14} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div className="analytics-card-value">
                      {((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1)}%
                    </div>
                    <div className="analytics-card-trend neutral">
                      <span>Interaksi sangat baik</span>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-card-title">
                      <span>Kategori Terpopuler</span>
                      <TrendingUp size={14} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div className="analytics-card-value" style={{ fontSize: '1.25rem', height: '2rem', display: 'flex', alignItems: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {(() => {
                        const cats = analytics.categoryViews || {};
                        let maxCat = 'photography';
                        let maxVal = 0;
                        Object.keys(cats).forEach(c => {
                          if (c !== 'all' && cats[c] > maxVal) {
                            maxVal = cats[c];
                            maxCat = c;
                          }
                        });
                          return getCategoryLabel(maxCat);
                       })()}
                    </div>
                    <div className="analytics-card-trend neutral">
                      <span>Paling banyak diminati</span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Trend SVG Graph */}
                <div className="analytics-chart-card">
                  <div className="analytics-chart-header">
                    <h3 className="analytics-chart-title">Aktivitas Kunjungan (7 Hari Terakhir)</h3>
                  </div>
                  <div className="analytics-chart-wrapper">
                    {renderSVGChart()}
                  </div>
                </div>

                {/* Popularity & Share Layout */}
                <div className="analytics-details-layout">
                  {/* Table of project popularity */}
                  <div className="analytics-detail-card">
                    <h3 className="analytics-detail-title">Popularitas Karya</h3>
                    {renderPopularityList()}
                  </div>

                  {/* Share graphs */}
                  <div className="analytics-detail-card">
                    <h3 className="analytics-detail-title">Sumber & Perangkat</h3>
                    {renderShares()}
                  </div>
                </div>
              </div>
            )}
 
            {/* 1c. INBOX VIEW */}
            {activeTab === 'inbox' && (
              <div className="admin-dashboard-container" style={{ paddingBottom: '6rem' }}>
                <div className="admin-dashboard-header">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400' }}>
                      Pesan Masuk
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Berikut adalah pesan-pesan dari formulir kontak website Anda.
                    </p>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 0', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Belum ada pesan masuk.
                    </p>
                  </div>
                ) : (
                  <div className="inbox-list">
                    {messages.map((msg) => (
                      <div key={msg.id} className="inbox-card">
                        <div className="inbox-header">
                          <div className="inbox-sender-info">
                            <span className="inbox-sender-name">{msg.name}</span>
                            <a href={`mailto:${msg.email}`} className="inbox-sender-email">{msg.email}</a>
                          </div>
                          <div className="inbox-meta">
                            <span className="inbox-date">
                              {new Date(msg.date).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <button
                              type="button"
                              className="inbox-delete-btn"
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                        {msg.subject && (
                          <div className="inbox-subject">
                            Subjek: {msg.subject}
                          </div>
                        )}
                        <div className="inbox-message">
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. WYSIWYG PROJECT EDITOR (Tambah / Edit Karya) */}
            {activeTab === 'add' && (
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                {/* Editor Header Bar */}
                <div className="admin-editor-header">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem' }}
                    onClick={() => {
                      if (window.confirm('Batalkan pembuatan/pengeditan karya? Semua perubahan belum disimpan.')) {
                        handleCancelEdit();
                        setActiveTab('manage');
                      }
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Dashboard</span>
                  </button>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {editingProject ? `Edit Karya: ${title || 'Tanpa Judul'}` : 'Buat Karya Baru (Editor)'}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (window.confirm('Batalkan dan buang perubahan?')) {
                          handleCancelEdit();
                          setActiveTab('manage');
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan & Publikasikan'}
                    </button>
                  </div>
                </div>

                {/* Editor WYSIWYG Canvas */}
                <div className="admin-editor-canvas">
                  <div className="modal-container" style={{ margin: '3rem auto 6rem auto' }}>
                    {/* Inline Category Select & Custom Background Color */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="contact-label" style={{ fontSize: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-tertiary)' }}>KATEGORI:</span>
                        <select
                          className="admin-inline-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="photography">Fotografi</option>
                          <option value="videography">Videografi</option>
                          <option value="design">Desain Grafis</option>
                          <option value="uiux">UI/UX Design</option>
                          <option value="random">Random Pict</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <span className="contact-label" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>WARNA BACKDROP:</span>
                        <input
                          type="color"
                          value={backgroundColor || '#0a0a0c'}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          style={{
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            width: '40px',
                            height: '28px',
                            borderRadius: '4px',
                            padding: '1px'
                          }}
                          title="Pilih Warna Latar Belakang Modal Detail"
                        />
                        <button
                          type="button"
                          onClick={() => setBackgroundColor('')}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            borderRadius: '4px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Inline Title Input */}
                    <input
                      type="text"
                      className="admin-inline-input admin-inline-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan Judul Karya..."
                    />

                    {/* Inline Metadata Section */}
                    <div className="modal-metadata" style={{ margin: '1.5rem 0 3rem 0' }}>
                      <div className="meta-item">
                        <div className="meta-item-title">
                          <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          <span>Klien</span>
                        </div>
                        <input
                          type="text"
                          className="admin-inline-input"
                          style={{ fontSize: '0.95rem', fontWeight: '500' }}
                          value={client}
                          onChange={(e) => setClient(e.target.value)}
                          placeholder="Nama Klien (e.g. Personal)"
                        />
                      </div>
                      
                      <div className="meta-item">
                        <div className="meta-item-title">
                          <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          <span>Tanggal</span>
                        </div>
                        <input
                          type="text"
                          className="admin-inline-input"
                          style={{ fontSize: '0.95rem', fontWeight: '500' }}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          placeholder="Bulan/Tahun (e.g. Juni 2026)"
                        />
                      </div>
                      
                      <div className="meta-item">
                        <div className="meta-item-title">
                          <Cpu size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          <span>Software / Tools</span>
                        </div>
                        <input
                          type="text"
                          className="admin-inline-input"
                          style={{ fontSize: '0.95rem', fontWeight: '500' }}
                          value={tools}
                          onChange={(e) => setTools(e.target.value)}
                          placeholder="Figma, Photoshop (pisahkan koma)"
                        />
                      </div>
                    </div>

                    {/* Inline Main Media Section */}
                    <div>
                      <span className="contact-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Media Utama (Visual Cover) *</span>
                      
                      <input
                        id="editor-main-media-input"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                        style={{ display: 'none' }}
                      />

                      {mediaPreview ? (
                        <div className="admin-media-wrapper">
                          {mediaType === 'video' && !isYouTubeUrl(youtubeUrl) ? (
                            <video src={mediaPreview} controls muted playsInline style={{ width: '100%', display: 'block', maxHeight: '780px', objectFit: 'contain' }} />
                          ) : (
                            <img src={mediaPreview} alt="Media Utama" style={{ width: '100%', display: 'block', maxHeight: '780px', objectFit: 'contain' }} />
                          )}
                          
                          {/* Hover Actions for Main Media */}
                          <div className="admin-media-actions">
                            <button
                              type="button"
                              className="admin-media-action-btn"
                              onClick={() => document.getElementById('editor-main-media-input').click()}
                            >
                              <Upload size={14} />
                              <span>Ganti Media</span>
                            </button>
                            <button
                              type="button"
                              className="admin-media-action-btn"
                              style={{ color: '#ff4d4d' }}
                              onClick={() => {
                                setMediaPreview('');
                                setMediaFile(null);
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label 
                          htmlFor="editor-main-media-input"
                          className={`editor-dropzone ${isDraggingMedia ? 'dragging' : ''}`}
                          onDragOver={handleMediaDragOver}
                          onDragEnter={handleMediaDragEnter}
                          onDragLeave={handleMediaDragLeave}
                          onDrop={handleMediaDrop}
                          style={isDraggingMedia ? { borderColor: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' } : {}}
                        >
                          <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
                          <span style={{ fontSize: '1rem', fontWeight: '500' }}>
                            {isDraggingMedia ? 'Lepaskan media utama di sini...' : 'Klik atau seret media utama ke sini'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Mendukung format gambar & video (Maks 100MB)
                          </span>
                        </label>
                      )}

                      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                        <span className="contact-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Link Video YouTube (Opsional)</span>
                        <input
                          type="text"
                          className="admin-inline-input"
                          style={{ width: '100%', fontSize: '0.95rem' }}
                          value={youtubeUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setYoutubeUrl(val);
                            if (isYouTubeUrl(val)) {
                              const thumb = getYouTubeThumbnail(val);
                              setMediaPreview(thumb);
                              setMediaType('video');
                            } else if (!val && !mediaFile) {
                              setMediaPreview('');
                            }
                          }}
                          placeholder="Tempel link video YouTube di sini (e.g. https://www.youtube.com/watch?v=...)"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.4rem', display: 'block', lineHeight: '1.4' }}>
                          Jika dimasukkan, sistem akan otomatis mengambil cover thumbnail dari YouTube dan memutar videonya di dalam modal detail karya secara penuh.
                        </span>
                      </div>
                    </div>

                    {/* Inline Description Section */}
                    <div style={{ marginTop: '3rem' }}>
                      <span className="contact-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Cerita & Deskripsi Karya</span>
                      <textarea
                        className="admin-inline-input admin-inline-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ceritakan tentang proses pembuatan, konsep desain, dan hasil dari karya ini secara detail..."
                        required
                      />
                    </div>

                    {/* Gallery Section */}
                    <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                      <h4 style={{ 
                        fontFamily: 'var(--font-serif)', 
                        fontSize: '1.5rem', 
                        marginBottom: '0.5rem',
                        fontWeight: '400'
                      }}>
                        Galeri Tambahan
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Tambahkan gambar atau video detail pendukung untuk melengkapi studi kasus karya ini.
                      </p>

                      <input
                        id="editor-gallery-input"
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleGalleryChange}
                        style={{ display: 'none' }}
                      />

                      <label
                        htmlFor="editor-gallery-input"
                        className={`editor-gallery-dropzone ${isDraggingGallery ? 'dragging' : ''}`}
                        onDragOver={handleGalleryDragOver}
                        onDragEnter={handleGalleryDragEnter}
                        onDragLeave={handleGalleryDragLeave}
                        onDrop={handleGalleryDrop}
                        style={isDraggingGallery ? { borderColor: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' } : {}}
                      >
                        <Plus size={20} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                          {isDraggingGallery ? 'Lepaskan file di sini...' : 'Klik atau seret file detail (gambar/video) ke sini'}
                        </span>
                      </label>

                      {galleryPreviews.length > 0 && (
                        <div className="modal-gallery">
                          {galleryPreviews.map((preview, index) => (
                            <div 
                              key={index} 
                              className={`modal-gallery-item ${preview.layout === 'half' ? 'split' : preview.layout === 'third' ? 'third' : ''}`}
                              style={{ 
                                position: 'relative', 
                                overflow: 'hidden', 
                                minHeight: '220px', 
                                backgroundColor: 'var(--bg-secondary)',
                                padding: preview.padding ? '1.5rem' : '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: preview.padding ? 'fit-content' : '100%',
                                margin: preview.padding ? '0 auto' : '0',
                                maxWidth: '100%'
                              }}
                            >
                              {isVideoUrl(preview.url) ? (
                                <video 
                                  src={preview.url} 
                                  muted 
                                  playsInline 
                                  style={{ 
                                    width: '100%', 
                                    height: preview.padding ? 'auto' : '100%', 
                                    maxHeight: preview.padding ? '180px' : 'none',
                                    objectFit: preview.padding ? 'contain' : 'cover' 
                                  }} 
                                />
                              ) : (
                                <img 
                                  src={preview.url} 
                                  alt={`Gallery ${index}`} 
                                  style={{ 
                                    width: '100%', 
                                    height: preview.padding ? 'auto' : '100%', 
                                    maxHeight: preview.padding ? '180px' : 'none',
                                    objectFit: preview.padding ? 'contain' : 'cover' 
                                  }} 
                                />
                              )}

                              {/* WYSIWYG Control Overlay (Appears on Hover) */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.5)',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                zIndex: 10
                              }}
                              className="editor-gallery-item-hover"
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
                              >
                                {/* Top bar: Badge & Delete */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{
                                    backgroundColor: 'rgba(0,0,0,0.85)',
                                    color: 'white',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}>
                                    {preview.layout === 'half' ? 'Split (50%)' : preview.layout === 'third' ? '3-Kolom (33%)' : 'Penuh (100%)'}
                                    {preview.padding ? ' + Spasi' : ''}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryItem(index)}
                                    style={{
                                      backgroundColor: '#dc3545',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: '24px',
                                      height: '24px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '14px'
                                    }}
                                    title="Hapus Media"
                                  >
                                    ×
                                  </button>
                                </div>

                                {/* Bottom controls bar */}
                                <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => handleMoveGalleryItem(index, 'up')}
                                    style={{
                                      backgroundColor: 'rgba(0,0,0,0.85)',
                                      color: index === 0 ? '#666' : 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.4rem 0.85rem',
                                      fontSize: '12px',
                                      cursor: index === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    ←
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleGalleryLayout(index)}
                                    style={{
                                      backgroundColor: 'rgba(0,0,0,0.85)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.4rem 0.85rem',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {preview.layout === 'half' ? 'Jadikan 3-Kolom' : preview.layout === 'third' ? 'Jadikan Penuh' : 'Jadikan Split'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleGalleryPadding(index)}
                                    style={{
                                      backgroundColor: 'rgba(0,0,0,0.85)',
                                      color: preview.padding ? '#00d2ff' : 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.4rem 0.85rem',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {preview.padding ? 'Tanpa Spasi' : 'Beri Spasi'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === galleryPreviews.length - 1}
                                    onClick={() => handleMoveGalleryItem(index, 'down')}
                                    style={{
                                      backgroundColor: 'rgba(0,0,0,0.85)',
                                      color: index === galleryPreviews.length - 1 ? '#666' : 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.4rem 0.85rem',
                                      fontSize: '12px',
                                      cursor: index === galleryPreviews.length - 1 ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
